# Game Visual Foundations — Shared Aesthetic Reference

> **Mọi game skill (asset, level, technical artist, shader, narrative, engine) đều tham chiếu document này.** Cung cấp nền tảng lý thuyết thẩm mỹ để đánh giá và tạo ra visuals chất lượng cao.

---

## Mục lục

1. [Color Theory](#1-color-theory)
2. [Shape Language](#2-shape-language)
3. [Composition Principles](#3-composition-principles)
4. [Typography System](#4-typography-system)
5. [Lighting Aesthetics](#5-lighting-aesthetics)
6. [Motion & Easing](#6-motion--easing)
7. [Art Style Guide Workflow](#7-art-style-guide-workflow)
8. [Accessibility & Inclusive Design](#8-accessibility--inclusive-design)
9. [AI Guardrails — Protecting Artistic Intent](#9-ai-guardrails--protecting-artistic-intent)

---

## 1. Color Theory

### 1.1 The 60-30-10 Rule

Nguyên tắc phân chia palette theo tỷ lệ phần trăm:

| Role | % | Purpose | Examples |
|------|---|---------|---------|
| **Dominant** | 60% | Background, environment, base tones | Dark navy bg, muted stone walls |
| **Secondary** | 30% | Structures, NPCs, mid-importance elements | Wooden platforms, enemy armor |
| **Accent** | 10% | Interactive, player, critical info | Player character, treasure, health bar |

**Sai:** Dùng 3 màu với tỷ lệ ngang nhau → visual noise, không có hierarchy.
**Đúng:** Background desaturated → mid-tones structured → accents vivid và isolated.

### 1.2 Color Harmonies

| Harmony | Wheel Position | Khi nào dùng | Ví dụ |
|---------|---------------|--------------|-------|
| **Complementary** | Đối diện (180°) | High contrast, player vs environment | Orange player on blue bg |
| **Analogous** | Kề nhau (±30°) | Harmony, immersion, nature | Greens + yellow-greens for forest |
| **Triadic** | Cách nhau 120° | Vibrant but balanced | RBY toy-like aesthetic |
| **Split-Complementary** | 150°/210° | Contrast without tension | Blue + orange-yellow |

**Quy tắc vàng:** Trong grayscale, player và interactive objects phải nổi rõ ràng khỏi background. **Value (độ sáng) quan trọng hơn Hue (màu).**

### 1.3 Color Psychology in Games

Người chơi đã được conditioning để phản ứng với màu sắc. Dùng color psychology để truyền tải mechanic mà không cần text:

| Color | Primary Meaning | Game Usage | Warning |
|-------|----------------|-----------|---------|
| 🔴 **Red** | Danger, urgency, violence | Enemy highlights, low-health, explosive barrels | Quá nhiều red = chaotic |
| 🟢 **Green** | Safety, nature, healing | Health bars, healing items, safe zones | Neon green = poison/toxic |
| 🔵 **Blue** | Calm, technology, magic | Mana bars, sci-fi holograms, friendly UI | Deep blue = eeriness |
| 🟡 **Gold** | High value, guidance | Treasure, ledges to climb, collectibles | Dùng tiết kiệm |
| 🟣 **Purple** | Mystery, magic, power | Magic effects, rare items, elite enemies | Có thể tạo cảm giác xa lạ |
| ⚫ **Black** | Evil, death, danger | Villain armor, void, darkness | Pure black có thể gây "hole" effect |
| ⚪ **White** | Purity, good, light | Hero robes, sacred places, loading screens | Quá nhiều white = flat |

### 1.4 2D vs 3D Color Considerations

**2D games:** Màu baked trực tiếp vào sprite. Color contrast quyết định object separation.

**3D games:** Lighting engine thay đổi màu gốc. Một vật đỏ dưới blue ambient light có thể trông tím. → Palette phải được thiết kế với game's lighting system trong đầu.

### 1.5 Color Scripts

Art directors tạo "color script" — timeline của palette theo emotional journey của game:

```
Intro (safe): Warm browns, soft greens → Safety, tutorial comfort
Mid-game (tension): Desaturated blues, amber warning tones → Rising stakes
Boss (peak): High contrast, deep blacks + vivid accent → Maximum intensity
Victory: Golden warmth, lush saturation → Achievement, reward
```

### 1.6 HDR Color Management (3D)

Khi thiết kế palette cho 3D:

- Xác định scene mood trước (moody noir vs bright fantasy)
- Màu "sạch" (pure saturated) chỉ dùng cho emissive/accent
- Environment colors nên desaturated và warm/cool shifted
- Post-processing LUT áp dụng unified cinematic grade toàn screen

---

## 2. Shape Language

### 2.1 Primary Shapes & Psychology

Basic geometric shapes carry psychological meaning — dùng trong character silhouette, environment design, và UI:

| Shape | Psychology | Game Usage |
|-------|-----------|-----------|
| ⭕ **Circle** | Innocence, youth, energy, femininity | Friendly NPCs, collectibles, nature, health |
| ◻️ **Square** | Stability, balance, maturity, safety | Buildings, floors, safe zones, UI panels |
| 🔺 **Triangle** | Aggression, masculinity, force, danger | Enemies, weapons, hazards, spikes |
| 💎 **Diamond** | Tension, action, movement | Action buttons, fast enemies, directional indicators |
| ⬡ **Hexagon** | Technology, structure, efficiency | Tech environments, sci-fi, UI grids |

**Nguyên tắc silhouette:** Mỗi character class/entity cần unique silhouette để nhận diện tức thì từ xa. Tham khảo approach của Team Fortress 2.

### 2.2 Dynamic Composition

Sử dụng lines, shapes, và volumes để guide player's focus:

- **Leading lines:** Con đường, rãnh nước, đường ray → dẫn mắt player về phía objective
- **S-curves:** Tạo cảm giác flow tự nhiên (river paths, bridges)
- **Diagonal tension:** Tạo năng lượng, movement, drama (倒塌的柱子, sloping platforms)
- **Radiating shapes:** explosions, boss auras, level-up effects

---

## 3. Composition Principles

### 3.1 Rule of Thirds

Chia frame thành 9 phần bằng 2 đường ngang + 2 đường dọc. Đặt important elements (player, objective, enemy) tại các điểm giao hoặc dọc theo đường:

- **Strong positions:** 4 điểm giao của grid
- **Weak center:** Tránh đặt subject ngay giữa frame (trừ khi cố ý)
- **Horizon line:** Đặt ở ⅓ trên hoặc dưới, không bao giờ giữa

### 3.2 Visual Hierarchy

Điều khiển thứ tự mắt người chơi nhìn vào elements. Nguyên tắc:

1. **Size** — lớn hơn = quan trọng hơn
2. **Contrast** — bright on dark, saturated on muted → nổi bật
3. **Color** — accent color chỉ dùng cho high-priority items
4. **Isolation** — nếu xung quanh desaturated, saturated item tự nổi
5. **Motion** — animated elements thu hút attention trước static

**Scanning patterns:** Người chơi thường scan theo F-pattern (web) hoặc Z-pattern. Đặt core UI ở high-traffic areas.

### 3.3 Atmospheric Perspective (Depth)

Mô phỏng cách mắt người nhìn thấy khoảng cách:

| Distance | Color Shift | Contrast | Detail | Saturation |
|----------|-----------|---------|--------|------------|
| Near | Original hue | High | Full | Full |
| Mid | Shift toward blue/gray | Medium | Reduced | Slightly reduced |
| Far | Heavy blue/gray wash | Low | Silhouette only | Desaturated |

Dùng trong 3D environments và layered 2D parallax backgrounds.

### 3.4 Negative Space

Không gian trống không phải "wasted space" — nó cho phép elements breathing, ngăn visual noise:

- HUD elements cần padding để không đè lên gameplay
- Enemies cần "room" xung quanh để readable
- Quiet areas trong level design tạo contrast với intensity

### 3.5 Visual Weight Balance

Frame cần được cân bằng về visual weight:

- Large dark area = heavy → cân bằng bằng small bright accent
- Asymmetric composition có thể stable nếu optical weight cân bằng
- Player character thường placed off-center để tạo "looking space" phía trước

---

## 4. Typography System

### 4.1 Text Roles

Mỗi role có visual specification riêng:

| Role | Size Range | Weight | Color | Letter Spacing | Use Case |
|------|-----------|--------|-------|---------------|---------|
| **Display** | 36-72px | Bold/Black | Primary accent | 4-8 | Game title, big numbers |
| **Headline** | 24-36px | Bold/SemiBold | Primary text | 2-4 | Section headers, level names |
| **Title** | 18-24px | Medium | Primary text | 1-2 | Card titles, panel headers |
| **Body** | 14-18px | Regular | Primary text | 0-1 | Descriptions, dialog |
| **Label** | 10-14px | Medium/Bold | Muted/accent | 2-4 | HUD labels, buttons, tags |
| **Caption** | 9-12px | Regular | Muted | 0-2 | Hints, timestamps, stats |

### 4.2 Scale Ratio

Dùng mathematical scale để đảm bảo consistency:

| Ratio | Multiplier | Use Case |
|-------|-----------|---------|
| **Minor Third** | 1.2 | Tight UI, dense information |
| **Major Third** | 1.25 | Standard UI |
| **Perfect Fourth** | 1.333 | Premium game UI |
| **Golden Ratio** | 1.618 | Hero sections only |

### 4.3 Font Pairing Rules

- **Tối đa 2 font families** cho toàn bộ game (một display, một body)
- Display font: mang tính đặc trưng, gợi cảm xúc (Outfit, Bebas Neue, etc.)
- Body font: readable, clean (Outfit, Inter, system-ui)
- **Không dùng system fonts** (Times New Roman, Arial) — immediate prototype signal

### 4.4 Kerning, Line Height & Tracking

| Property | Body Text | Headlines | Labels |
|----------|-----------|-----------|--------|
| **Line height** | 1.4-1.6× font size | 1.1-1.3× | Fixed small |
| **Tracking** | 0 | 0-2 | 2-4 |
| **Kerning** | Auto | Manual for logo/display | N/A |

Manual kerning cần cho specific pairs: AV, WA, TY, YA (thường look bad tự động).

### 4.5 Thematic Font Integration

Font có thể reinforce game's narrative:

- Medieval game → serif với texture, hoặc blackletter
- Sci-fi → geometric sans-serif, monospace for tech elements
- Handwritten/diary → script font cho in-game journals
- Horror → condensed sans-serif với distortion effects

---

## 5. Lighting Aesthetics

### 5.1 Lighting as Emotional Tool

Color temperature và intensity của ánh sáng tạo cảm xúc trước khi player đọc bất kỳ text nào:

| Lighting Style | Color Temp | Intensity | Emotional Effect |
|---------------|-----------|---------|-----------------|
| **Golden Hour** | Warm (3000-4000K) | Medium-high | Optimism, nostalgia, safety |
| **Blue Hour** | Cool (6000-9000K) | Low | Calm, mystery, transition |
| **Noon Sun** | Neutral-warm | Very high | Energy, clarity, urgency |
| **Moonlight** | Cool blue | Low | Romance, mystery, quiet danger |
| **Firelight** | Warm orange-red | Flickering | Warmth, comfort, or danger depending on context |
| **Fluorescent** | Greenish-cool | Flat | Uncanny, clinical, industrial |
| **Neon** | Vibrant saturated | High local | Cyberpunk, nightlife, energy |

### 5.2 Three-Point Lighting (3D Foundation)

| Light | Purpose | Typical Position | Color |
|-------|---------|-----------------|-------|
| **Key light** | Primary illumination, defines form | 45° above, 45° side | Warm or neutral |
| **Fill light** | Softens shadows, reduces contrast | Opposite side of key, lower | Cool, 50-70% intensity of key |
| **Rim/Back light** | Separates subject from background | Behind, elevated | Warm or saturated accent |

### 5.3 Environmental Lighting by Genre

| Genre | Lighting Character | Technique |
|-------|-------------------|----------|
| **Fantasy/Adventure** | Warm, volumetric, dappled | Soft shadows, warm bounce light |
| **Horror** | High contrast, desaturated, noir | Single harsh light source, deep blacks |
| **Sci-fi** | Cool, technical, rim-heavy | Blue key, cyan accents, HDR bloom |
| **Cyberpunk** | Neon saturated, deep shadows | RGB rim lights, dark environment |
| **Cozy/Nature** | Soft, warm, golden | Soft global illumination, no harsh shadows |
| **Tactical/Stealth** | Low, blue-tinted, moonlit | Single directional, high shadow density |

### 5.4 Post-Processing Aesthetic Principles

Post-processing là final pass để unify visual style:

| Effect | Aesthetic Purpose | Overuse Warning |
|--------|-----------------|----------------|
| **Bloom** | Emphasize bright/emissive elements | Halo artifacts, washed-out darks |
| **Vignette** | Draw focus to center, cinematic feel | Too strong = tunnel vision |
| **Color grading (LUT)** | Unified cinematic tone | Inconsistent between scenes |
| **Depth of Field** | Separate subject from background | Cut off important info |
| **Motion blur** | Speed, fluidity | Reduces readability of UI |
| **Chromatic aberration** | Lens realism, glitch aesthetics | Eye strain if overdone |
| **Film grain** | Organic texture, vintage feel | Looks like bad encoding if heavy |

**Nguyên tắc:** Post-processing nên reinforce artistic intent, không phải substitute cho nó.

### 5.5 Atmospheric Depth in Lighting

Fog và atmospheric scattering tạo depth và mood:

- **Exponential fog:** Distance fade, good for open worlds
- **Height fog:** Ground-level haze, good for forests/battlefields
- **Volumetric light shafts:** God rays through windows/canopy, dramatic
- **Atmospheric perspective:** Fog color shifts with distance (warm near, cool far)

---

## 6. Motion & Easing

### 6.1 Easing Semantics

Easing curves communicate meaning — không chỉ là animation, mà là ngôn ngữ:

| Easing | Curve Feel | Use Case |
|--------|-----------|---------|
| **ease-in** `cubic-bezier(0.4, 0, 1, 1)` | Heavy, accelerating | Elements entering (drop in, page load) |
| **ease-out** `cubic-bezier(0, 0, 0.2, 1)` | Light, decelerating | Elements exiting (fly out, dismiss) |
| **ease-in-out** `cubic-bezier(0.4, 0, 0.2, 1)` | Natural, balanced | State transitions, toggles |
| **linear** | Mechanical, robotic | Loading bars, progress indicators only |
| **bounce** | Playful, elastic | Celebrations, success feedback |
| **spring** | Physical, organic | Drag-and-drop, character movement |
| **overshoot** | Energetic, impactful | Button press, hits, explosions |

**Quy tắc:** Mọi interactive element phải có easing. Linear = dead, robotic.

### 6.2 Duration Guidelines

| Interaction Type | Duration | Principle |
|-----------------|---------|----------|
| Micro (hover, focus) | 100-200ms | Instant feedback |
| Standard (panel open, toggle) | 200-400ms | Smooth but fast |
| Emphasis (modal, celebration) | 400-700ms | Deliberate, noticeable |
| Dramatic (cutscene transition) | 700-1500ms | Cinematic weight |

Quá nhanh = not noticed. Quá chậm = feels slow. 200-400ms là sweet spot cho UI.

### 6.3 Squash & Stretch

Nguyên tắc animation cổ điển (Disney) vẫn áp dụng trong game:

- **Landing:** Squash vertically on impact, stretch horizontally
- **Jump:** Stretch on ascent, squash on descent
- **Hit:** Flash + squash toward impact direction
- **Pickup:** Brief stretch toward player, squash on collect

### 6.4 Screen Shake Design

Screen shake cần được design có hệ thống, không phải random:

| Intensity | Pixel Range | Use Case | Duration |
|-----------|------------|---------|----------|
| Micro | 1-3px | UI button press | 50-100ms |
| Light | 3-6px | Small impacts, footsteps | 100-200ms |
| Medium | 6-12px | Hits, explosions | 200-400ms |
| Heavy | 12-20px | Boss attacks, crashes | 400-600ms |
| Cinematic | 20px+ | Death, level destruction | 600-1000ms |

**Decay:** Shake nên decay exponentially (mạnh lúc đầu, nhanh chóng calm down).

---

## 7. Art Style Guide Workflow

### 7.1 The Style Guide Pipeline

Từ concept đến production:

```
Research → Mood Board → Style Pillars → Color Script → Style Guide → Gold Standard
```

### 7.2 Mood Board Creation

Mood board là visual exploration ban đầu. Nó không phải production reference, mà là communication tool:

**Nguồn tham khảo:**
- Pinterest boards với mixed sources (game, film, photography, real-world)
- Architecture, fashion, nature — không giới hạn trong game
- Real-world references ground designs in functional reality

**Cần bao gồm:**
- Lighting references (time of day, mood)
- Color palette samples
- Shape language examples
- Texture/material references
- Typography references (fonts, layout)
- Emotional tone (hình ảnh tạo cảm xúc đúng)

### 7.3 Style Pillars

Mỗi game cần 3-5 style pillars — keywords định nghĩa creative direction:

| Example Pillar | What It Means | Design Decisions It Drives |
|---------------|--------------|--------------------------|
| **"Warm Solitude"** | Lonely but comforting | Warm palette, soft lighting, empty spaces that feel peaceful |
| **"Digital Decay"** | Technology falling apart | Glitch effects, flickering lights, corrupted textures |
| **"Organic Geometry"** | Natural forms with hard edges | Round characters in angular environments |
| **"Tactile Toybox"** | Everything looks touchable | Rounded corners, soft shadows, bouncy animations |

### 7.4 Style Guide Gold Standard

Mỗi asset type cần một "gold standard" — definitive reference cho tất cả artists:

**Gold Standard cho mỗi category:**
- Hero character (full turnaround + expression sheet)
- Prop (medium-complexity, labeled parts)
- Environment tile (labeled UV/layout)
- UI element (all states: default, hover, active, disabled)

**Trong gold standard cần định nghĩa:**
- Silhouette shape language
- Color palette với hex codes
- Material/lighting approach
- Detail density level
- Technical constraints (polygon count, texture size)

### 7.5 Common Art Styles

| Style | Characteristics | Pros | Cons |
|-------|----------------|------|------|
| **Pixel Art** | Grid-based, limited colors per sprite | Retro charm, efficient | Animation skill-intensive |
| **Hand-Drawn** | Painterly, organic lines | Unique, artistic | Labor-intensive, inconsistent risk |
| **Low-Poly 3D** | Faceted geometry, clean shapes | Fast to produce, readable at all distances | Can feel sterile |
| **Stylized 3D** | Exaggerated proportions, saturated colors | Brand identity, timeless | Character design skill critical |
| **Realistic** | PBR, anatomically correct | Immersive | Expensive, uncanny valley risk |
| **Flat/Voxel** | 2D planes or cubes, minimal shading | Highly scalable, accessible | Limited expressiveness |

---

## 8. Accessibility & Inclusive Design

### 8.1 Color Blindness Support

8% nam giới có color vision deficiency. Design không được rely hoàn toàn vào color:

| Type | Prevalence | What They See | Design Adaptation |
|------|-----------|--------------|-----------------|
| **Deuteranopia** (red-green) | ~6% males | Reds → browns, greens → olive | Never pair red/green as only differentiator |
| **Protanopia** (red-green) | ~2% males | Reds muted, greens similar | Same as above |
| **Tritanopia** (blue-yellow) | ~0.01% | Blues → green, yellow → pink | Avoid blue/yellow as only contrast |
| **Monochromacy** | Very rare | Grayscale only | Never rely on color alone |

**Always pair color với shape, icon, motion, hoặc pattern.**

### 8.2 Contrast Ratios (WCAG 2.1)

Minimum contrast cho readability:

| Context | Minimum Ratio | Recommended |
|---------|--------------|-------------|
| Normal text (body) | 4.5:1 | 7:1 |
| Large text (≥18px bold or ≥24px) | 3:1 | 4.5:1 |
| UI components (buttons, inputs) | 3:1 | 4.5:1 |
| Decorative/ambient elements | No requirement | — |

Test tool: WebAIM Contrast Checker, Stark plugin (Figma)

### 8.3 Cognitive Accessibility

| Principle | Implementation |
|-----------|---------------|
| **Consistent navigation** | Same UI patterns across all screens |
| **Clear feedback** | Every action has visible + optional audio confirmation |
| **No time pressure (default)** | Timed events have off/opt-out |
| **Predictable interactions** | Controls behave same way throughout |
| **Reduce cognitive load** | Progressive disclosure, no info overload |

### 8.4 Platform-Specific Accessibility

| Platform | Consideration |
|----------|--------------|
| **Mobile** | Support iOS/Android font scaling, bold text |
| **XR/VR** | Text ≥ 1.0m virtual = 20px angular size at arm's length |
| **Desktop** | Screen reader support, keyboard navigation |
| **Console** | Remappable controls, input assistance |

---

## 9. AI Guardrails — Protecting Artistic Intent

> **Critical 2026 rule.** Neural rendering (DLSS 5, FSR 4, etc.) và generative AI có thể overwrite deliberate artistic choices với "mathematically perfect" averages.

### 9.1 The DLSS 5 Problem

When AI upscaling smooths out deliberately rough textures, removes asymmetric character features, và flattens moody lighting → artist intent bị mất.

**Examples of AI bias in game art:**
- Character faces smoothed toward "average" → lost unique identity
- Moody lighting brightened → lost horror/tension atmosphere
- Gritty textures homogenized → lost handcrafted quality

### 9.2 Mandatory Guardrails for Generative AI

Khi dùng AI cho asset creation:

1. **Enforce strict prompt scaffolds** — không để AI tự do generate
2. **Define Atmospheric Intent explicitly** — brightness range, color temperature, grit level
3. **Use AI as scaffolding, not creative director** — human artist reviews every output
4. **Protect character uniqueness** — asymmetric features, scars, distinctive silhouettes phải preserved
5. **Lock lighting mood** — shadow depth, color tint, contrast levels phải specified

### 9.3 Neural Rendering Configuration

Khi sử dụng DLSS/FSR/TSR:

```markdown
## Atmospheric Intent (per scene)
- Shadow depth: Deep (no fill light on faces)
- Color grade: Desaturated teal shadows, warm amber highlights
- Grit level: Visible texture detail in stone/metal (no smoothing)
- Contrast: High (0.95 black, 0.85 white)
- Intent: "Moody noir, handcrafted, no beauty smoothing"
```

### 9.4 NTC (Neural Texture Compression) Considerations

RTX 50-series Blackwell compress textures to 4-7% original VRAM footprint. Scale asset density accordingly.

---

## Quick Reference Card

```
COLOR:     60-30-10 rule | Value > Hue | Color psychology per color
SHAPE:     Circle=safe, Triangle=danger, Square=stable
COMPOSE:   Rule of thirds | Visual hierarchy (size > contrast > color)
TYPE:      2 font max | Scale ratio | Display/Body/Label roles
LIGHT:     Temperature = emotion | Three-point foundation | Post = unify
MOTION:    Easing semantics | 200-400ms UI | Squash/stretch physics
STYLE:     Mood board → Pillars → Guide → Gold standard
ACCESS:    Color + shape/icon pairing | WCAG 4.5:1 min | Test in grayscale
AI GUARD:  Explicit intent lock | No "mathematically perfect" smoothing
```

---

*Document này được tham chiếu bởi: game-asset-vfx, level-designer, technical-artist, unity-shader-artist, unreal-technical-artist, narrative-designer, threejs-engineer, game-designer, game-audio-engineer*
