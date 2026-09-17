import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { FormStep, FormCard, FormField, OptionLayoutType, FieldValidationType } from "../../types";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  FileCode,
  Copy,
  Check,
  CornerDownRight,
  GripVertical,
  MoveRight,
  ChevronRight,
  Lock,
  LayoutGrid,
  ShieldAlert,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";

export const StudioBuilderTab: React.FC = () => {
  const { currentStudioForm, updateCurrentStudioForm, activeStepIndex, setActiveStepIndex } =
    useDashboardStore();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  // Smart Accordion state: track collapsed cards
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  // Hold-to-drag state for steps, cards, and fields
  const [draggedStepIdx, setDraggedStepIdx] = useState<number | null>(null);
  const [dragOverStepIdx, setDragOverStepIdx] = useState<number | null>(null);
  const [draggedCardIdx, setDraggedCardIdx] = useState<number | null>(null);
  const [dragOverCardIdx, setDragOverCardIdx] = useState<number | null>(null);
  const [draggedFieldIdx, setDraggedFieldIdx] = useState<{ cardIdx: number; fieldIdx: number } | null>(null);
  const [dragOverFieldIdx, setDragOverFieldIdx] = useState<{ cardIdx: number; fieldIdx: number } | null>(null);

  if (!currentStudioForm || !currentStudioForm.jsonConfig) return null;

  const steps = currentStudioForm.jsonConfig.steps || [];
  const currentStep = steps[activeStepIndex] || steps[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCardCollapse = (cardId: string) => {
    setCollapsedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Step operations
  const handleAddStep = () => {
    const newStep: FormStep = {
      id: `step_${Date.now()}`,
      title: `Step ${steps.length + 1}: Section`,
      description: "Provide required details",
      cards: [
        {
          id: `card_${Date.now()}`,
          title: "Section Details",
          description: "Organize questions here",
          fields: [],
        },
      ],
    };

    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.steps.push(newStep);
      return draft;
    });
    setActiveStepIndex(steps.length);
  };

  const handleDeleteStep = (stepIdx: number) => {
    if (steps.length <= 1) {
      return;
    }

    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.steps.splice(stepIdx, 1);
      return draft;
    });

    if (activeStepIndex >= steps.length - 1) {
      setActiveStepIndex(Math.max(0, steps.length - 2));
    }
  };

  const handleMoveStep = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;

    updateCurrentStudioForm((draft) => {
      const temp = draft.jsonConfig.steps[idx];
      draft.jsonConfig.steps[idx] = draft.jsonConfig.steps[targetIdx];
      draft.jsonConfig.steps[targetIdx] = temp;
      return draft;
    });
    setActiveStepIndex(targetIdx);
  };

  const handleStepDrop = (targetIdx: number) => {
    if (draggedStepIdx === null || draggedStepIdx === targetIdx) {
      setDraggedStepIdx(null);
      setDragOverStepIdx(null);
      return;
    }
    updateCurrentStudioForm((draft) => {
      const list = draft.jsonConfig.steps;
      const [moved] = list.splice(draggedStepIdx, 1);
      list.splice(targetIdx, 0, moved);
      return draft;
    });
    setActiveStepIndex(targetIdx);
    setDraggedStepIdx(null);
    setDragOverStepIdx(null);
  };

  // Card operations
  const handleAddCard = (stepIdx: number) => {
    const newCard: FormCard = {
      id: `card_${Date.now()}`,
      title: "New Sub-Section Card",
      description: "Group related fields",
      fields: [],
    };

    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.steps[stepIdx].cards.push(newCard);
      return draft;
    });
  };

  const handleDeleteCard = (stepIdx: number, cardIdx: number) => {
    updateCurrentStudioForm((draft) => {
      const step = draft.jsonConfig.steps[stepIdx];
      if (!step) return draft;
      step.cards.splice(cardIdx, 1);
      if (step.cards.length === 0) {
        step.cards.push({
          id: `card_${Date.now()}`,
          title: "Section Details",
          description: "Organize questions here",
          fields: [],
        });
      }
      return draft;
    });
  };

  const handleMoveCard = (stepIdx: number, cardIdx: number, direction: "up" | "down") => {
    const cards = steps[stepIdx].cards;
    const targetIdx = direction === "up" ? cardIdx - 1 : cardIdx + 1;
    if (targetIdx < 0 || targetIdx >= cards.length) return;

    updateCurrentStudioForm((draft) => {
      const step = draft.jsonConfig.steps[stepIdx];
      const temp = step.cards[cardIdx];
      step.cards[cardIdx] = step.cards[targetIdx];
      step.cards[targetIdx] = temp;
      return draft;
    });
  };

  const handleCardDrop = (targetIdx: number) => {
    if (draggedCardIdx === null || draggedCardIdx === targetIdx) {
      setDraggedCardIdx(null);
      setDragOverCardIdx(null);
      return;
    }
    updateCurrentStudioForm((draft) => {
      const cards = draft.jsonConfig.steps[activeStepIndex].cards;
      const [moved] = cards.splice(draggedCardIdx, 1);
      cards.splice(targetIdx, 0, moved);
      return draft;
    });
    setDraggedCardIdx(null);
    setDragOverCardIdx(null);
  };

  const handleFieldDrop = (targetCardIdx: number, targetFieldIdx: number) => {
    if (!draggedFieldIdx) return;
    const { cardIdx: srcCardIdx, fieldIdx: srcFieldIdx } = draggedFieldIdx;
    if (srcCardIdx === targetCardIdx && srcFieldIdx === targetFieldIdx) {
      setDraggedFieldIdx(null);
      setDragOverFieldIdx(null);
      return;
    }

    updateCurrentStudioForm((draft) => {
      const step = draft.jsonConfig.steps[activeStepIndex];
      const srcCard = step.cards[srcCardIdx];
      const destCard = step.cards[targetCardIdx];
      if (!srcCard || !destCard) return draft;

      const [moved] = srcCard.fields.splice(srcFieldIdx, 1);
      if (moved) {
        destCard.fields.splice(targetFieldIdx, 0, moved);
      }
      return draft;
    });
    setDraggedFieldIdx(null);
    setDragOverFieldIdx(null);
  };

  // Hierarchy Merging: Move card to another step
  const handleMoveCardToStep = (sourceStepIdx: number, cardIdx: number, destStepIdx: number) => {
    if (sourceStepIdx === destStepIdx) return;
    updateCurrentStudioForm((draft) => {
      const card = draft.jsonConfig.steps[sourceStepIdx].cards.splice(cardIdx, 1)[0];
      if (card) {
        draft.jsonConfig.steps[destStepIdx].cards.push(card);
      }
      return draft;
    });
  };

  // Hierarchy Merging: Move field to another card
  const handleMoveFieldToCard = (
    srcStepIdx: number,
    srcCardIdx: number,
    fieldIdx: number,
    destCardId: string
  ) => {
    updateCurrentStudioForm((draft) => {
      const field = draft.jsonConfig.steps[srcStepIdx].cards[srcCardIdx].fields.splice(fieldIdx, 1)[0];
      if (!field) return draft;

      for (const s of draft.jsonConfig.steps) {
        for (const c of s.cards || []) {
          if (c.id === destCardId) {
            c.fields.push(field);
            return draft;
          }
        }
      }
      return draft;
    });
  };

  const handleMoveFieldOrder = (
    stepIdx: number,
    cardIdx: number,
    fieldIdx: number,
    direction: "up" | "down"
  ) => {
    const fields = steps[stepIdx].cards[cardIdx].fields;
    const targetIdx = direction === "up" ? fieldIdx - 1 : fieldIdx + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    updateCurrentStudioForm((draft) => {
      const card = draft.jsonConfig.steps[stepIdx].cards[cardIdx];
      const temp = card.fields[fieldIdx];
      card.fields[fieldIdx] = card.fields[targetIdx];
      card.fields[targetIdx] = temp;
      return draft;
    });
  };

  const handleUpdateField = (
    stepIdx: number,
    cardIdx: number,
    fieldIdx: number,
    patch: Partial<FormField>
  ) => {
    updateCurrentStudioForm((draft) => {
      const field = draft.jsonConfig.steps[stepIdx].cards[cardIdx].fields[fieldIdx];
      Object.assign(field, patch);
      return draft;
    });
  };

  // Collect all cards across all steps for Hierarchy Merging destination picker
  const allCardsList: { cardId: string; cardTitle: string; stepTitle: string }[] = [];
  steps.forEach((s) => {
    (s.cards || []).forEach((c) => {
      allCardsList.push({
        cardId: c.id,
        cardTitle: c.title,
        stepTitle: s.title,
      });
    });
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Source Locked Banner (Strictly Google Form Questions Only) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Source Locked Architecture
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Strictly relies ONLY on the specific questions imported from your Google Form link. Reorganize, regroup, and style freely.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Navigation Carousel & Smart Accordion Drag Handles */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Form Stepper ({steps.length} Steps)</span>
          </div>

          <button
            onClick={handleAddStep}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <span>+ Add Section Step</span>
          </button>
        </div>

        {/* Horizontal Step Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {steps.map((step, idx) => {
            const isSelected = idx === activeStepIndex;
            const isDragging = draggedStepIdx === idx;
            const isDragOver = dragOverStepIdx === idx;

            return (
              <div
                key={step.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(idx));
                  e.dataTransfer.effectAllowed = "move";
                  setDraggedStepIdx(idx);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverStepIdx !== idx) setDragOverStepIdx(idx);
                }}
                onDragLeave={() => {
                  if (dragOverStepIdx === idx) setDragOverStepIdx(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleStepDrop(idx);
                }}
                onDragEnd={() => {
                  setDraggedStepIdx(null);
                  setDragOverStepIdx(null);
                }}
                className={`flex items-center gap-1 shrink-0 transition-all cursor-grab active:cursor-grabbing ${
                  isDragging ? "opacity-30 scale-95" : ""
                } ${isDragOver ? "ring-2 ring-purple-500 rounded-xl bg-purple-50" : ""}`}
                title="Hold and drag to reorder step"
              >
                <button
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-xs font-bold"
                      : "bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[130px]">{step.title}</span>
                </button>

                {/* Move Step Controls */}
                <div className="flex flex-col">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveStep(idx, "up")}
                    className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move Step Left"
                  >
                    <ChevronUp className="w-3 h-3 -rotate-90" />
                  </button>
                  <button
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMoveStep(idx, "down")}
                    className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    title="Move Step Right"
                  >
                    <ChevronDown className="w-3 h-3 -rotate-90" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Editor */}
      {currentStep && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          {/* Step Meta Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Step {activeStepIndex + 1} Title
                </label>
                {currentStep.cards.length > 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Step inside step active ({currentStep.cards.length} sub-sections)
                  </span>
                )}
              </div>
              <input
                type="text"
                value={currentStep.title}
                onChange={(e) => {
                  const val = e.target.value;
                  updateCurrentStudioForm((draft) => {
                    draft.jsonConfig.steps[activeStepIndex].title = val;
                    return draft;
                  });
                }}
                className="w-full text-base font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-1.5 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-6">
              <button
                onClick={() => handleDeleteStep(activeStepIndex)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete this Step"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards within Current Step (Smart Accordion with Drag Handles & Hierarchy Merging) */}
          <div className="space-y-4">
            {currentStep.cards.map((card, cardIdx) => {
              const isCollapsed = !!collapsedCards[card.id];
              const isCardDragging = draggedCardIdx === cardIdx;
              const isCardDragOver = dragOverCardIdx === cardIdx;

              return (
                <div
                  key={card.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (draggedCardIdx !== null && dragOverCardIdx !== cardIdx) {
                      setDragOverCardIdx(cardIdx);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverCardIdx === cardIdx) setDragOverCardIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedCardIdx !== null) {
                      handleCardDrop(cardIdx);
                    }
                  }}
                  className={`rounded-2xl bg-slate-50/70 border overflow-hidden shadow-2xs transition-all ${
                    isCardDragging ? "opacity-30 scale-98 border-purple-400" : "border-slate-200"
                  } ${isCardDragOver ? "ring-2 ring-purple-500 border-purple-500 bg-purple-50/40" : ""}`}
                >
                  {/* Card Title & Smart Accordion Bar */}
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(cardIdx));
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedCardIdx(cardIdx);
                    }}
                    onDragEnd={() => {
                      setDraggedCardIdx(null);
                      setDragOverCardIdx(null);
                    }}
                    className="p-3.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {/* Drag Handle Icon */}
                      <span
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-purple-600 p-0.5"
                        title="Hold and drag to reorder card"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>

                      {/* Card Collapse / Expand Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardCollapse(card.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 transition-colors"
                        title={isCollapsed ? "Expand Card" : "Collapse Card"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isCollapsed ? "-rotate-90" : "rotate-0"
                          }`}
                        />
                      </button>

                      <input
                        type="text"
                        value={card.title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCurrentStudioForm((draft) => {
                            draft.jsonConfig.steps[activeStepIndex].cards[cardIdx].title = val;
                            return draft;
                          });
                        }}
                        className="font-bold text-sm text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-purple-500 rounded-lg px-2 py-0.5 transition-all flex-1"
                      />

                      <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                        {card.fields.length} {card.fields.length === 1 ? "question" : "questions"}
                      </span>
                    </div>

                    {/* Card Actions & Hierarchy Merging (Move Card to Step) */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* Move Card Up/Down in current step */}
                      <button
                        disabled={cardIdx === 0}
                        onClick={() => handleMoveCard(activeStepIndex, cardIdx, "up")}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Card Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={cardIdx === currentStep.cards.length - 1}
                        onClick={() => handleMoveCard(activeStepIndex, cardIdx, "down")}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Card Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Hierarchy Merge: Move Card to another Step */}
                      {steps.length > 1 && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value !== "") {
                              handleMoveCardToStep(activeStepIndex, cardIdx, parseInt(e.target.value, 10));
                            }
                          }}
                          className="text-[10px] bg-white border border-slate-300 text-slate-600 rounded px-1.5 py-0.5 focus:outline-none"
                          title="Move Card to another Step"
                        >
                          <option value="">Move to step...</option>
                          {steps.map((st, sIdx) => {
                            if (sIdx === activeStepIndex) return null;
                            return (
                              <option key={st.id} value={sIdx}>
                                Step {sIdx + 1}: {st.title}
                              </option>
                            );
                          })}
                        </select>
                      )}

                      {/* Delete Card */}
                      <button
                        onClick={() => handleDeleteCard(activeStepIndex, cardIdx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body with Questions (Collapsible) */}
                  {!isCollapsed && (
                    <div className="p-4 space-y-4">
                      {card.fields.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                          No questions in this card yet. Use the hierarchy menu on other questions to move them here.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {card.fields.map((field, fieldIdx) => {
                            const isFieldDragging =
                              draggedFieldIdx?.cardIdx === cardIdx && draggedFieldIdx?.fieldIdx === fieldIdx;
                            const isFieldDragOver =
                              dragOverFieldIdx?.cardIdx === cardIdx && dragOverFieldIdx?.fieldIdx === fieldIdx;

                            return (
                              <div
                                key={field.id}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = "move";
                                  if (
                                    draggedFieldIdx &&
                                    (dragOverFieldIdx?.cardIdx !== cardIdx || dragOverFieldIdx?.fieldIdx !== fieldIdx)
                                  ) {
                                    setDragOverFieldIdx({ cardIdx, fieldIdx });
                                  }
                                }}
                                onDragLeave={() => {
                                  if (
                                    dragOverFieldIdx?.cardIdx === cardIdx &&
                                    dragOverFieldIdx?.fieldIdx === fieldIdx
                                  ) {
                                    setDragOverFieldIdx(null);
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (draggedFieldIdx) {
                                    handleFieldDrop(cardIdx, fieldIdx);
                                  }
                                }}
                                className={`bg-white border rounded-xl p-3.5 shadow-2xs space-y-3 transition-all ${
                                  isFieldDragging ? "opacity-30 border-purple-400 scale-98" : "border-slate-200"
                                } ${isFieldDragOver ? "ring-2 ring-purple-500 border-purple-500 bg-purple-50/20" : ""}`}
                              >
                                {/* Field Header & Controls */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span
                                      draggable
                                      onDragStart={(e) => {
                                        e.stopPropagation();
                                        e.dataTransfer.setData("text/plain", `${cardIdx}:${fieldIdx}`);
                                        e.dataTransfer.effectAllowed = "move";
                                        setDraggedFieldIdx({ cardIdx, fieldIdx });
                                      }}
                                      onDragEnd={() => {
                                        setDraggedFieldIdx(null);
                                        setDragOverFieldIdx(null);
                                      }}
                                      className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-purple-600 p-0.5"
                                      title="Hold and drag to reorder question"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </span>

                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(e) =>
                                        handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                          label: e.target.value,
                                        })
                                      }
                                      className="font-bold text-xs text-slate-900 bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded px-2 py-1 flex-1 focus:bg-white focus:border-purple-500 focus:outline-none"
                                    />
                                  </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Required Checkbox */}
                                  <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer pr-2">
                                    <input
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={(e) =>
                                        handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                          required: e.target.checked,
                                        })
                                      }
                                      className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span>Required</span>
                                  </label>

                                  {/* Reorder Up/Down */}
                                  <button
                                    disabled={fieldIdx === 0}
                                    onClick={() =>
                                      handleMoveFieldOrder(activeStepIndex, cardIdx, fieldIdx, "up")
                                    }
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                    title="Move Question Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    disabled={fieldIdx === card.fields.length - 1}
                                    onClick={() =>
                                      handleMoveFieldOrder(activeStepIndex, cardIdx, fieldIdx, "down")
                                    }
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                    title="Move Question Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Hierarchy Move to Another Card */}
                                  {allCardsList.length > 1 && (
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          handleMoveFieldToCard(
                                            activeStepIndex,
                                            cardIdx,
                                            fieldIdx,
                                            e.target.value
                                          );
                                        }
                                      }}
                                      className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                                      title="Move Question to another Card"
                                    >
                                      <option value="">Move to card...</option>
                                      {allCardsList.map((ac) => {
                                        if (ac.cardId === card.id) return null;
                                        return (
                                          <option key={ac.cardId} value={ac.cardId}>
                                            {ac.cardTitle} ({ac.stepTitle})
                                          </option>
                                        );
                                      })}
                                    </select>
                                  )}
                                </div>
                              </div>

                              {/* Google Form Mapping Row */}
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                <FileCode className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span className="font-mono text-[11px] text-slate-500">
                                  Google Form Key:
                                </span>
                                <input
                                  type="text"
                                  value={field.entryCode}
                                  onChange={(e) =>
                                    handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                      entryCode: e.target.value,
                                    })
                                  }
                                  placeholder="entry.12345678"
                                  className="font-mono text-xs text-purple-900 bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:border-purple-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(field.entryCode)}
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                  title="Copy Entry Code"
                                >
                                  {copiedCode === field.entryCode ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                <span className="text-[10px] text-slate-400 hidden sm:inline ml-auto">
                                  Type: <span className="font-semibold text-slate-600">{field.type}</span>
                                </span>
                              </div>

                              {/* Option Alignment Setting for Multiple Choice / Checkbox questions */}
                              {(field.type === "radio" ||
                                field.type === "checkbox" ||
                                field.type === "dropdown") && (
                                <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                      <LayoutGrid className="w-3.5 h-3.5 text-purple-600" />
                                      <span>Option Alignment Layout</span>
                                    </span>
                                    <div className="inline-flex rounded-lg border border-purple-200 bg-white p-0.5 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                            optionLayout: "vertical",
                                          })
                                        }
                                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                                          !field.optionLayout || field.optionLayout === "vertical"
                                            ? "bg-purple-600 text-white font-bold"
                                            : "text-slate-600 hover:text-slate-900"
                                        }`}
                                      >
                                        Vertical
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                            optionLayout: "grid-2",
                                          })
                                        }
                                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                                          field.optionLayout === "grid-2"
                                            ? "bg-purple-600 text-white font-bold"
                                            : "text-slate-600 hover:text-slate-900"
                                        }`}
                                      >
                                        2 Columns
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                            optionLayout: "grid-3",
                                          })
                                        }
                                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                                          field.optionLayout === "grid-3"
                                            ? "bg-purple-600 text-white font-bold"
                                            : "text-slate-600 hover:text-slate-900"
                                        }`}
                                      >
                                        3 Columns
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                            optionLayout: "pills",
                                          })
                                        }
                                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                                          field.optionLayout === "pills"
                                            ? "bg-purple-600 text-white font-bold"
                                            : "text-slate-600 hover:text-slate-900"
                                        }`}
                                      >
                                        Pills
                                      </button>
                                    </div>
                                  </div>

                                  {/* List of scraped options */}
                                  <div className="space-y-1 pt-1">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900">
                                      <span>Choice Options ({field.options?.length || 0}):</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = field.options || [];
                                          handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                            options: [...current, `Option ${current.length + 1}`],
                                          });
                                        }}
                                        className="text-purple-700 hover:underline font-bold"
                                      >
                                        + Add Option
                                      </button>
                                    </div>

                                    <div className="space-y-1">
                                      {(field.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-1.5">
                                          <CornerDownRight className="w-3 h-3 text-purple-400 shrink-0" />
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                              const next = [...(field.options || [])];
                                              next[oIdx] = e.target.value;
                                              handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                                options: next,
                                              });
                                            }}
                                            className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5 focus:border-purple-500 focus:outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = (field.options || []).filter(
                                                (_, i) => i !== oIdx
                                              );
                                              handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                                options: next,
                                              });
                                            }}
                                            className="text-slate-400 hover:text-red-600 p-0.5"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Dynamic Input Validation for Text / Paragraph inputs */}
                              {(field.type === "text" || field.type === "paragraph") && (
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Dynamic Validation:</span>
                                  </span>
                                  <select
                                    value={field.validationType || "none"}
                                    onChange={(e) =>
                                      handleUpdateField(activeStepIndex, cardIdx, fieldIdx, {
                                        validationType: e.target.value as FieldValidationType,
                                      })
                                    }
                                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-purple-500"
                                  >
                                    <option value="none">None (Standard text)</option>
                                    <option value="number">Numeric Only (Digits)</option>
                                    <option value="phone">Phone Number (10+ Digits)</option>
                                    <option value="email">Email Address (@)</option>
                                    <option value="url">URL / Web Link (http/https)</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => handleAddCard(activeStepIndex)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-400 text-xs font-bold text-slate-600 hover:text-purple-700 bg-slate-50/50 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-1.5"
            >
              <span>+ Add Sub-Section Card to {currentStep.title}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
