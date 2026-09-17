import zlib, struct, math, os

def make_png(width, height, get_pixel):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (none)
        for x in range(width):
            r, g, b, a = get_pixel(x, y, width, height)
            raw_data.extend([int(r), int(g), int(b), int(a)])

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(bytes(raw_data))) + chunk(b'IEND', b'')

def render_hackx_pixel(x, y, w, h):
    # Normalized coordinates (-1 to 1)
    nx = (x / (w - 1)) * 2 - 1
    ny = (y / (h - 1)) * 2 - 1

    # Squircle distance for rounded background
    # (x^4 + y^4)^(1/4)
    squircle_r = (abs(nx)**4.5 + abs(ny)**4.5)**(1/4.5)

    if squircle_r > 0.96:
        # Anti-aliased outer edge
        edge_alpha = max(0.0, min(1.0, (1.0 - squircle_r) / 0.04))
        if edge_alpha <= 0.0:
            return (0, 0, 0, 0)
    else:
        edge_alpha = 1.0

    # Background gradient: deep space blue-black
    bg_factor = (ny + 1) / 2
    r_bg = 11 * (1 - bg_factor) + 4 * bg_factor
    g_bg = 19 * (1 - bg_factor) + 8 * bg_factor
    b_bg = 43 * (1 - bg_factor) + 20 * bg_factor

    # Border glow (around squircle 0.88 to 0.95)
    border_dist = abs(squircle_r - 0.91)
    if border_dist < 0.06:
        border_glow = (1.0 - border_dist / 0.06) * 0.85
        r_bg = r_bg * (1 - border_glow) + 0 * border_glow
        g_bg = g_bg * (1 - border_glow) + 229 * border_glow
        b_bg = b_bg * (1 - border_glow) + 255 * border_glow

    # Distance to diagonal 1 (y = x) and diagonal 2 (y = -x)
    # The X lines
    d1 = abs(nx - ny) / math.sqrt(2)
    d2 = abs(nx + ny) / math.sqrt(2)

    # Within box bounds
    in_x_region = abs(nx) < 0.65 and abs(ny) < 0.65
    min_d = min(d1, d2) if in_x_region else 999.0

    # Distance to center
    center_dist = math.sqrt(nx*nx + ny*ny)

    # Base color starts as background
    r, g, b = r_bg, g_bg, b_bg

    # X blade rendering (stroke width ~ 0.12)
    blade_thick = 0.13
    if min_d < blade_thick * 2.2 and in_x_region:
        # Gradient along X: cyan (top/left) to blue/indigo (bottom/right)
        grad_t = max(0.0, min(1.0, (nx + ny + 1.2) / 2.4))
        blade_r = 0 * (1 - grad_t) + 100 * grad_t
        blade_g = 229 * (1 - grad_t) + 130 * grad_t
        blade_b = 255

        if min_d < blade_thick:
            # Solid core
            blade_intensity = 1.0
        else:
            # Soft neon glow falloff
            blade_intensity = max(0.0, 1.0 - (min_d - blade_thick) / (blade_thick * 1.2))

        r = r * (1 - blade_intensity) + blade_r * blade_intensity
        g = g * (1 - blade_intensity) + blade_g * blade_intensity
        b = b * (1 - blade_intensity) + blade_b * blade_intensity

    # Center white spark / energy core
    if center_dist < 0.12:
        spark = max(0.0, min(1.0, (0.12 - center_dist) / 0.12))
        r = r * (1 - spark) + 255 * spark
        g = g * (1 - spark) + 255 * spark
        b = b * (1 - spark) + 255 * spark

    return (r, g, b, edge_alpha * 255)

def make_ico(png_data):
    # Standard ICO header with 1 image
    # Reserved: 0, Type: 1 (icon), Count: 1
    header = struct.pack('<HHH', 0, 1, 1)
    # Entry: Width, Height, Colors (0), Reserved (0), Planes (1), BitCount (32), Size, Offset
    # For width/height >= 256 use 0, for 32 use 32
    w = 32
    h = 32
    size = len(png_data)
    offset = 6 + 16 # header(6) + 1 entry(16) = 22
    entry = struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, size, offset)
    return header + entry + png_data

# Generate 32x32
png_32 = make_png(32, 32, render_hackx_pixel)
with open('public/favicon-32x32.png', 'wb') as f:
    f.write(png_32)

# Generate 16x16
png_16 = make_png(16, 16, render_hackx_pixel)
with open('public/favicon-16x16.png', 'wb') as f:
    f.write(png_16)

# Generate 180x180 for Apple touch icon
png_180 = make_png(180, 180, render_hackx_pixel)
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(png_180)

# Generate favicon.ico
ico_data = make_ico(png_32)
with open('public/favicon.ico', 'wb') as f:
    f.write(ico_data)

print("Favicon files generated successfully!")
