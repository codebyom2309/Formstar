import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { ConditionalRule, ConditionalClause, FormCard, FormField } from "../../types";
import {
  GitBranch,
  Users,
  Sliders,
  CheckCircle2,
  Trash2,
  Plus,
  AlertCircle,
  Sparkles,
  Layers,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

export const StudioLogicTab: React.FC = () => {
  const { currentStudioForm, updateCurrentStudioForm } = useDashboardStore();

  if (!currentStudioForm || !currentStudioForm.jsonConfig) return null;

  const logicConfig = currentStudioForm.jsonConfig?.logic || {};
  const steps = currentStudioForm.jsonConfig?.steps || [];

  // Filter trigger questions to Multiple Choice (radio, dropdown, checkbox) as requested
  const choiceFields: { id: string; entryCode: string; label: string; stepTitle: string; options: string[] }[] = [];
  const allCardsList: { id: string; title: string; stepIndex: number; stepTitle: string }[] = [];

  steps.forEach((step, sIdx) => {
    (step.cards || []).forEach((card) => {
      allCardsList.push({
        id: card.id,
        title: card.title,
        stepIndex: sIdx,
        stepTitle: step.title,
      });

      (card.fields || []).forEach((field) => {
        if (field.type === "radio" || field.type === "dropdown" || field.type === "checkbox") {
          choiceFields.push({
            id: field.id,
            entryCode: field.entryCode || field.id,
            label: field.label || `Question ${field.id}`,
            stepTitle: step.title || `Step ${sIdx + 1}`,
            options: field.options && field.options.length > 0 ? field.options : ["Option 1", "Option 2"],
          });
        }
      });
    });
  });

  const handleUpdateLogic = (patch: Partial<typeof logicConfig>) => {
    updateCurrentStudioForm((draft) => {
      if (!draft.jsonConfig.logic) {
        draft.jsonConfig.logic = {};
      }
      draft.jsonConfig.logic = { ...draft.jsonConfig.logic, ...patch };
      return draft;
    });
  };

  const handleSetStepRule = (stepIndex: number, rule: ConditionalRule | undefined) => {
    updateCurrentStudioForm((draft) => {
      if (draft.jsonConfig.steps[stepIndex]) {
        draft.jsonConfig.steps[stepIndex].conditionalRule = rule;
      }
      return draft;
    });
  };

  const handleSetCardRule = (stepIndex: number, cardIndex: number, rule: ConditionalRule | undefined) => {
    updateCurrentStudioForm((draft) => {
      if (draft.jsonConfig.steps[stepIndex]?.cards[cardIndex]) {
        draft.jsonConfig.steps[stepIndex].cards[cardIndex].conditionalRule = rule;
      }
      return draft;
    });
  };

  // Helper to get options for selected trigger field
  const getOptionsForField = (fieldId: string): string[] => {
    const f = choiceFields.find((cf) => cf.id === fieldId);
    return f?.options || [];
  };

  // Quantity Logic trigger question and mappings
  const activeQuantityField = choiceFields.find((f) => f.id === logicConfig.quantityTriggerFieldId) || choiceFields[0];
  const quantityOptions = activeQuantityField?.options || ["1", "2", "3", "4"];
  const quantityCardMappings = logicConfig.quantityCardMappings || {};

  const handleToggleCardForQuantity = (optionVal: string, cardId: string) => {
    const currentList = quantityCardMappings[optionVal] || [];
    const isPresent = currentList.includes(cardId);
    const updatedList = isPresent ? currentList.filter((c) => c !== cardId) : [...currentList, cardId];

    handleUpdateLogic({
      quantityCardMappings: {
        ...quantityCardMappings,
        [optionVal]: updatedList,
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Tab Header */}
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-600" />
          <span>Advanced Conditional Logic &amp; Branching</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Show/Hide rule trees and map Multiple Choice questions (e.g. Team Size) to dynamic card visibility.
        </p>
      </div>

      {/* SECTION 1: Quantity Logic - Map Multiple Choice options to specific card visibility */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Quantity Logic: Option-to-Card Visibility
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Map options (e.g. &ldquo;Team Size&rdquo;) to dynamically reveal specific member cards. Standard form sections (Leader, Project, Payment) always remain visible.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={!!logicConfig.quantityLogicEnabled}
              onChange={(e) => {
                const checked = e.target.checked;
                handleUpdateLogic({
                  quantityLogicEnabled: checked,
                  quantityTriggerFieldId: logicConfig.quantityTriggerFieldId || activeQuantityField?.id,
                });
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {logicConfig.quantityLogicEnabled && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            {choiceFields.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No Multiple Choice, Radio, or Dropdown questions were found in this form.</span>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Quantity Trigger Question (Multiple Choice / Radio)
                  </label>
                  <select
                    value={logicConfig.quantityTriggerFieldId || activeQuantityField?.id}
                    onChange={(e) =>
                      handleUpdateLogic({
                        quantityTriggerFieldId: e.target.value,
                      })
                    }
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    {choiceFields.map((cf) => (
                      <option key={cf.id} value={cf.id}>
                        {cf.label} ({cf.stepTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-slate-800">
                    Visible Cards per Selected Option:
                  </p>

                  <div className="space-y-3">
                    {quantityOptions.map((opt) => {
                      const selectedCards = quantityCardMappings[opt] || [];

                      return (
                        <div
                          key={opt}
                          className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-md">
                              When user chooses: &ldquo;{opt}&rdquo;
                            </span>
                            <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {selectedCards.length} dynamic card{selectedCards.length === 1 ? "" : "s"} revealed
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {allCardsList.map((cardItem) => {
                              const isChecked = selectedCards.includes(cardItem.id);

                              return (
                                <button
                                  type="button"
                                  key={cardItem.id}
                                  onClick={() => handleToggleCardForQuantity(opt, cardItem.id)}
                                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition-all ${
                                    isChecked
                                      ? "bg-purple-50/80 border-purple-300 text-purple-900 font-semibold"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 border ${
                                      isChecked
                                        ? "bg-purple-600 border-purple-600 text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="truncate flex-1">
                                    {cardItem.title}
                                    <span className="text-[10px] text-slate-400 block">
                                      {cardItem.stepTitle}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Step-Level & Card-Level Show/Hide Logic with AND/OR Operators */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Conditional Step &amp; Card Show/Hide Logic</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter trigger questions to Multiple Choice, choose from scraped options, and link conditions using AND / OR operators.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, sIdx) => {
            const rule = step.conditionalRule;
            const hasRule = !!rule;
            const triggerField = choiceFields.find((cf) => cf.id === rule?.fieldId) || choiceFields[0];
            const scrapedOptions = triggerField?.options || [];

            return (
              <div
                key={step.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
              >
                {/* Step Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {sIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{step.title}</span>
                  </div>

                  {!hasRule ? (
                    <button
                      onClick={() =>
                        handleSetStepRule(sIdx, {
                          action: "show",
                          fieldId: choiceFields[0]?.id || "",
                          operator: "equals",
                          value: choiceFields[0]?.options?.[0] || "Yes",
                          logicOperator: "and",
                          clauses: [],
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Step Condition</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetStepRule(sIdx, undefined)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Rule</span>
                    </button>
                  )}
                </div>

                {/* Step Rule Configurator */}
                {hasRule && rule && (
                  <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-200 space-y-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-purple-900">Action:</span>
                      <div className="inline-flex rounded-lg border border-purple-200 bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => handleSetStepRule(sIdx, { ...rule, action: "show" })}
                          className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors flex items-center gap-1 ${
                            rule.action === "show"
                              ? "bg-purple-600 text-white"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Show Step</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStepRule(sIdx, { ...rule, action: "hide" })}
                          className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors flex items-center gap-1 ${
                            rule.action === "hide"
                              ? "bg-rose-600 text-white"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Hide Step</span>
                        </button>
                      </div>

                      <span className="font-bold text-purple-900 ml-2">IF Condition Met:</span>
                    </div>

                    {/* Primary Clause */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={rule.fieldId}
                        onChange={(e) => {
                          const newFieldId = e.target.value;
                          const newOpts = getOptionsForField(newFieldId);
                          handleSetStepRule(sIdx, {
                            ...rule,
                            fieldId: newFieldId,
                            value: newOpts[0] || "",
                          });
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-500 max-w-[200px] truncate"
                      >
                        {choiceFields.map((cf) => (
                          <option key={cf.id} value={cf.id}>
                            {cf.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          handleSetStepRule(sIdx, {
                            ...rule,
                            operator: e.target.value as any,
                          })
                        }
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-500"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">does not equal</option>
                        <option value="contains">contains</option>
                      </select>

                      {scrapedOptions.length > 0 ? (
                        <select
                          value={String(rule.value)}
                          onChange={(e) =>
                            handleSetStepRule(sIdx, {
                              ...rule,
                              value: e.target.value,
                            })
                          }
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-500 flex-1 min-w-[140px]"
                        >
                          {scrapedOptions.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={String(rule.value)}
                          onChange={(e) =>
                            handleSetStepRule(sIdx, {
                              ...rule,
                              value: e.target.value,
                            })
                          }
                          placeholder="Option value"
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold flex-1 min-w-[140px]"
                        />
                      )}
                    </div>

                    {/* Secondary Clauses (AND / OR) */}
                    {(rule.clauses || []).map((clause, clIdx) => {
                      const cTriggerField = choiceFields.find((cf) => cf.id === clause.fieldId) || choiceFields[0];
                      const cScrapedOptions = cTriggerField?.options || [];

                      return (
                        <div key={clIdx} className="flex flex-wrap items-center gap-2 pl-4 border-l-2 border-purple-300 pt-1">
                          <span className="font-bold uppercase text-[11px] text-purple-800">
                            {rule.logicOperator || "and"}
                          </span>

                          <select
                            value={clause.fieldId}
                            onChange={(e) => {
                              const newFId = e.target.value;
                              const newOpts = getOptionsForField(newFId);
                              const nextClauses = [...(rule.clauses || [])];
                              nextClauses[clIdx] = { ...clause, fieldId: newFId, value: newOpts[0] || "" };
                              handleSetStepRule(sIdx, { ...rule, clauses: nextClauses });
                            }}
                            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold max-w-[180px] truncate"
                          >
                            {choiceFields.map((cf) => (
                              <option key={cf.id} value={cf.id}>
                                {cf.label}
                              </option>
                            ))}
                          </select>

                          <select
                            value={clause.operator}
                            onChange={(e) => {
                              const nextClauses = [...(rule.clauses || [])];
                              nextClauses[clIdx] = { ...clause, operator: e.target.value as any };
                              handleSetStepRule(sIdx, { ...rule, clauses: nextClauses });
                            }}
                            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                          >
                            <option value="equals">equals</option>
                            <option value="not_equals">does not equal</option>
                            <option value="contains">contains</option>
                          </select>

                          {cScrapedOptions.length > 0 ? (
                            <select
                              value={String(clause.value)}
                              onChange={(e) => {
                                const nextClauses = [...(rule.clauses || [])];
                                nextClauses[clIdx] = { ...clause, value: e.target.value };
                                handleSetStepRule(sIdx, { ...rule, clauses: nextClauses });
                              }}
                              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold flex-1 min-w-[120px]"
                            >
                              {cScrapedOptions.map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={String(clause.value)}
                              onChange={(e) => {
                                const nextClauses = [...(rule.clauses || [])];
                                nextClauses[clIdx] = { ...clause, value: e.target.value };
                                handleSetStepRule(sIdx, { ...rule, clauses: nextClauses });
                              }}
                              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold flex-1 min-w-[120px]"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const nextClauses = (rule.clauses || []).filter((_, i) => i !== clIdx);
                              handleSetStepRule(sIdx, { ...rule, clauses: nextClauses });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add Clause + Operator Selector */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const nextClauses = [
                            ...(rule.clauses || []),
                            {
                              fieldId: choiceFields[0]?.id || "",
                              operator: "equals" as const,
                              value: choiceFields[0]?.options?.[0] || "",
                            },
                          ];
                          handleSetStepRule(sIdx, { ...rule, clauses: nextClauses });
                        }}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Another Condition</span>
                      </button>

                      {(rule.clauses || []).length > 0 && (
                        <div className="flex items-center gap-1 ml-auto text-[11px] font-semibold text-slate-600">
                          <span>Operator:</span>
                          <select
                            value={rule.logicOperator || "and"}
                            onChange={(e) =>
                              handleSetStepRule(sIdx, { ...rule, logicOperator: e.target.value as any })
                            }
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold"
                          >
                            <option value="and">ALL match (AND)</option>
                            <option value="or">ANY match (OR)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Card-Level Rules */}
                <div className="pl-4 space-y-2 pt-1 border-l-2 border-slate-100">
                  {(step.cards || []).map((card, cIdx) => {
                    const cRule = card.conditionalRule;
                    const hasCRule = !!cRule;
                    const cField = choiceFields.find((cf) => cf.id === cRule?.fieldId) || choiceFields[0];
                    const cOptions = cField?.options || [];

                    return (
                      <div
                        key={card.id}
                        className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800">
                            Card: {card.title} ({card.fields.length} questions)
                          </span>

                          {!hasCRule ? (
                            <button
                              onClick={() =>
                                handleSetCardRule(sIdx, cIdx, {
                                  action: "show",
                                  fieldId: choiceFields[0]?.id || "",
                                  operator: "equals",
                                  value: choiceFields[0]?.options?.[0] || "Yes",
                                })
                              }
                              className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                            >
                              + Card Condition
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetCardRule(sIdx, cIdx, undefined)}
                              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {hasCRule && cRule && (
                          <div className="p-2.5 bg-white rounded-lg border border-purple-200 flex flex-wrap items-center gap-2 text-xs">
                            <select
                              value={cRule.action || "show"}
                              onChange={(e) =>
                                handleSetCardRule(sIdx, cIdx, {
                                  ...cRule,
                                  action: e.target.value as any,
                                })
                              }
                              className="px-2 py-1 bg-purple-50 text-purple-800 font-bold border border-purple-200 rounded text-xs"
                            >
                              <option value="show">Show Card IF</option>
                              <option value="hide">Hide Card IF</option>
                            </select>

                            <select
                              value={cRule.fieldId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                const newOpts = getOptionsForField(newId);
                                handleSetCardRule(sIdx, cIdx, {
                                  ...cRule,
                                  fieldId: newId,
                                  value: newOpts[0] || "",
                                });
                              }}
                              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs max-w-[160px] truncate"
                            >
                              {choiceFields.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.label}
                                </option>
                              ))}
                            </select>

                            <select
                              value={cRule.operator}
                              onChange={(e) =>
                                handleSetCardRule(sIdx, cIdx, {
                                  ...cRule,
                                  operator: e.target.value as any,
                                })
                              }
                              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                            >
                              <option value="equals">equals</option>
                              <option value="not_equals">!=</option>
                              <option value="contains">contains</option>
                            </select>

                            {cOptions.length > 0 ? (
                              <select
                                value={String(cRule.value)}
                                onChange={(e) =>
                                  handleSetCardRule(sIdx, cIdx, {
                                    ...cRule,
                                    value: e.target.value,
                                  })
                                }
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs flex-1 min-w-[100px]"
                              >
                                {cOptions.map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={String(cRule.value)}
                                onChange={(e) =>
                                  handleSetCardRule(sIdx, cIdx, {
                                    ...cRule,
                                    value: e.target.value,
                                  })
                                }
                                placeholder="Value"
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs flex-1 min-w-[80px]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
