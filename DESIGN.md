# Design System: AURALE — Nutrition Handbook

## 1. Visual Theme & Atmosphere

AURALE is a bright, friendly personal health companion for everyday people. The interface should make health tracking feel encouraging, understandable, and low-pressure: a small positive nudge in a busy day, not a performance dashboard.

- **Mood:** Cheerful, kind, optimistic, and approachable; still trustworthy with personal health data.
- **Density:** Daily App Balanced (5/10). Use compact, useful summaries with generous breathing room and one clear primary action per screen.
- **Variance:** Friendly structured (5/10). Use warm visual moments, rounded modules, and occasional illustrated areas, while keeping the navigation and hierarchy predictable.
- **Motion:** Softly playful (6/10). Motion adds delight and feedback, never urgency, streak pressure, or reward anxiety.
- **Surface:** Luminous warm-white canvas, soft sunlit color blocks, and low-contrast shadows. The app should feel open and bright rather than minimal-luxury or clinical.
- **Data personality:** Clear, colorful, and supportive. Treat activity, food, hydration, sleep, and energy as observations to understand — never scores to judge.

The product should be broadly welcoming across ages and health experience levels. It must never feel hospital-clinical, gym-bro, punitive, gloomy, or like a dense futuristic dashboard.

## 2. Color Palette & Roles

Use a cheerful, controlled palette. Apricot is the only interactive accent. Blue, green, and yellow are functional support colors for categories and positive states; they must not compete with the primary CTA.

- **Cloud Canvas** (`#FFF9F0`) — Primary screen background and airy content canvas.
- **Clean Surface** (`#FFFFFF`) — Cards, sheets, form fields, and raised navigation surfaces.
- **Ink Navy** (`#2F3542`) — Primary text, core icons, and high-contrast structure. Never use pure black.
- **Soft Slate** (`#697386`) — Secondary text, metadata, inactive navigation, and quiet dividers.
- **Peach Tint** (`#FFF0E7`) — Friendly highlight surfaces, positive empty-state backgrounds, and gentle content grouping.
- **Apricot Action** (`#FF9E7A`) — The only primary interactive accent: filled buttons, active focus states, and high-priority next actions.
- **Sky Progress** (`#A9D7F5`) — Hydration, informational trends, and calm supporting progress tracks.
- **Leaf Support** (`#9BCB8D`) — Completed habits, checked states, and steady positive progress.
- **Butter Highlight** (`#FFD66B`) — Small celebratory detail, selected meal moment, or visual warmth; never use for dense text.
- **Coral Notice** (`#FF8B78`) — Gentle attention state or an unfinished action; do not use alarming red.
- **Sunrise Wash** (`#FFDC8B`) — Soft sun or warm illustration field in onboarding.
- **Butter Wash** (`#FDE7A9`) — Gentle breakfast and meal-illustration tint.
- **Leaf Wash** (`#EAF0ED`) — Gentle evening and calm meal-illustration tint.
- **Quiet Dot** (`#E7DDD3`) — Inactive onboarding progress dots.
- **Label Slate** (`#758091`) — Small onboarding context labels; retain body copy in Soft Slate.

Color rules:

- Maintain readable contrast between Ink Navy and Cloud Canvas/Clean Surface.
- Use color to organize categories, then reinforce meaning with labels, icons, and position.
- Keep saturation warm and controlled. No neon, outer glow, rainbow charts, or purple-blue AI gradients.
- Use Apricot Action for one filled primary CTA per screen. Do not use Blue, Green, or Yellow as competing primary buttons.

## 3. Typography Rules

Typography is friendly and highly legible, with warmth coming from roundness and spacing rather than luxury serif styling.

- **Display:** `Segoe UI Semibold` or the platform's rounded system sans in a bold weight — use for screen titles and short encouraging statements. Typical onboarding title size: 31–34 px, 1–2 lines maximum.
- **UI and body:** `Segoe UI` or the configured system sans — use for controls, data, labels, and paragraphs. Preferred body size: 16 px with 1.45–1.6 line height.
- **Data and metadata:** `Geist Mono` or `JetBrains Mono` only for aligned numbers, time, and compact measurements. Do not overuse mono.
- **Hierarchy:** Create hierarchy through weight, color, whitespace, and approachable size changes. Do not use decorative display typography for data-heavy views.
- **Line length:** Keep mobile body content to roughly 32–42 characters per line. Do not shrink text to fit more UI.
- **Minimums:** Body copy at least 14 px, control labels at least 15 px, primary CTA labels at least 16 px.

Banned: Inter as a default premium face; generic serif fonts; all-caps paragraphs; tiny decorative labels; and overly condensed text.

## 4. Component Stylings

### Navigation

- Use a persistent four-item bottom tab bar for primary signed-in destinations: **Today**, **Insights**, **Meals**, and **You**.
- The active tab uses Apricot Action plus a soft Peach Tint indicator; inactive tabs use Soft Slate. Each item has a custom friendly line icon and a clear label.
- Tabs must have a 44 px minimum touch target. Keep the tab bar bright, simple, and easy to scan.
- Onboarding and authentication do not show the tab bar. Use a clear progress indicator for onboarding and simple back navigation for stack flows.

### Mascot and illustrations

- Use one small friendly water-drop mascot with a leaf sprout as an optional supportive companion. It appears in encouragement, onboarding, hydration, and empty states only.
- The mascot should never lecture, judge food, celebrate weight loss, or dominate a data screen.
- Supporting illustrations use simple sun, meal, water, leaf, and horizon motifs with soft, hand-drawn polish. Do not use emojis.

### Buttons

- One filled primary action per screen, using Apricot Action with Clean Surface text.
- Button height: 52 px minimum; corner radius: 16–18 px; horizontal padding: 20–24 px.
- Secondary actions are text buttons or quiet outlines in Ink Navy; keep them visually subordinate.
- Press feedback: scale to 0.98 and translate down 1 px with a spring. No neon glow, aggressive bounce, or custom cursor.

### Inputs and forms

- Use a label above each field; do not use floating labels.
- Inputs use Clean Surface, a 1 px low-contrast border, 14–16 px radius, and 52 px minimum height.
- Focus state uses a restrained Apricot Action border or 2 px ring. Place plain-language error text below the relevant field.
- Keep authentication and logging flows short and low-pressure.

### Cards, lists, and sections

- Use cards to create friendly groupings, not visual clutter. Limit each screen to one major summary card plus light supporting sections.
- Card radius: 18–20 px; padding: 18–24 px; shadow: soft, warm, and low opacity. Avoid glassmorphism and nested card stacks.
- Use slim divider lines or open space for ordinary lists.
- Meals use a clear three-step row (logged, next meal, later meal) instead of a dense collection of widgets.

### Data visualization

- Use a single large hydration ring, simple meal-progress rows, horizontal macro bars, and quiet trend lines where needed.
- Hydration uses Sky Progress; completed habits use Leaf Support; food context uses Butter Highlight; primary actions stay Apricot Action.
- Energy check-ins use five simple rounded face symbols with readable text labels. They are not emoji and must not imply a “good” or “bad” person.
- Labels explain every visualization. Avoid fake precision, alarm colors, noisy grids, dense chart dashboards, and competitive goal language.

### Loading, empty, and error states

- Use skeletons matching the destination layout; do not use generic circular spinners as the main loading UI.
- Empty states pair one soft illustration or mascot moment with a clear helpful action.
- Errors are calm, inline, and actionable. Explain what happened in plain language without blame.

### Icons and imagery

- Use rounded custom line icons with a consistent medium stroke: water drop, sun, bowl, leaf, chart, and profile.
- Use friendly editorial illustrations or bright still-life food imagery with clean, controlled crops. Avoid body transformation images, stock gym photography, lab scenes, or medical equipment.
- When imagery appears behind copy, use a light fade or solid support surface so text stays fully readable.

## 5. Layout Principles

- Design mobile-first around real safe areas: status bar, title zone, bottom tab bar, and home indicator always receive breathing room.
- Use a spacing rhythm of 4, 8, 12, 16, 24, 32, and 48 px. Default horizontal screen padding is 20–24 px.
- Put one clear primary task or supportive insight above the fold.
- Favor a predictable left-aligned title zone and a friendly visual summary below it. Use asymmetry only to create warmth, not confusion.
- Combine bright content blocks with open canvas space so screens feel cheerful without becoming busy.
- Every element occupies its own spatial zone; do not overlap text, controls, cards, or images.
- Preserve at least 44 px touch targets and make all actions reachable with one hand where practical.
- On tablet and web, retain readable column widths; collapse multi-column content to one column below 768 px with no horizontal overflow.

## 6. Motion & Interaction

Motion is a small moment of encouragement, not a source of urgency.

- Use spring motion by default: stiffness `100`, damping `20`.
- Animate only `transform` and `opacity`; never animate layout properties such as `top`, `left`, `width`, or `height`.
- Use 160–240 ms transitions for presses, tab changes, sheets, and list reveals.
- Hydration rings and progress bars may softly animate to their value once. The mascot may make a brief wave or leaf sway only in supportive contexts; do not use perpetual attention-seeking loops.
- Respect reduced-motion preferences and preserve status changes without motion-heavy effects.
- Keep animated code isolated, hardware-accelerated, and light on battery/CPU.

## 7. Anti-Patterns (Banned)

Never do the following:

- No emojis in product UI; use the custom illustration and icon system instead.
- No pure black (`#000000`), neon glow, oversaturated gradients, or purple-blue AI aesthetics.
- No generic bright-green health style, clinical/hospital interface, gym-bro language, transformation imagery, body-shaming, streak pressure, or calorie punishment.
- No generic pastel wellness template: use the defined mascot, color roles, icon language, and caring copy with restraint.
- No Inter default, generic serif fonts, all-caps filler copy, tiny labels, or unreadable decorative text.
- No AI copywriting clichés such as “Elevate,” “Seamless,” “Unleash,” or “Next-Gen.”
- No filler navigation copy such as “Scroll to explore,” “Swipe down,” or bouncing chevrons.
- No dense fake dashboards, fake precision, generic round-number claims, or data framed as medical certainty.
- No more than one filled primary CTA per screen.
- No three-equal-card feature rows, excessive pills, nested card stacks, glassmorphism, or overlapping elements. Exception: the first onboarding screen may use three equal, non-interactive meal illustration cards for breakfast, lunch, and dinner inside one illustration area; they must not become reusable feature cards elsewhere.
- No hidden navigation logic, color-only meaning, inaccessible contrast, or touch target below 44 px.
- No stock gym, office, laboratory, or medical images; no broken external image links.
- No secrets, auth tokens, API keys, or AI credentials exposed in the mobile client.