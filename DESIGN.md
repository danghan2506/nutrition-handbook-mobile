# Design System: AURALE — Nutrition Handbook

## 1. Visual Theme & Atmosphere

AURALE is a premium personal wellness app that feels like a quiet, private health companion. Its visual language is warm, editorial, tactile, and precise: the calm of a sunlit kitchen table combined with the clarity of personal analytics.

- **Mood:** Supportive, intelligent, unhurried, personal, and trustworthy.
- **Density:** Daily App Balanced (4/10). One clear priority per screen; use generous breathing room around major blocks.
- **Variance:** Offset Asymmetric (5/10). Favor left-aligned titles, uneven but balanced content groupings, and occasional image-led moments. Never use chaotic composition.
- **Motion:** Fluid and restrained (5/10). Motion clarifies cause and effect; it must not create urgency or reward anxiety.
- **Surface:** Warm bone surfaces with ultra-subtle paper grain. Cards are rare, purposeful, and softly elevated.
- **Data personality:** Show trends as gentle context, not scores to be judged by. Favor quiet lines, slim bars, rings, and concise explanations.

The interface must never feel hospital-clinical, gym-bro, generic bright-green health, or like a futuristic AI dashboard.

## 2. Color Palette & Roles

Use this palette consistently. Terracotta is the single interactive accent. Sage is a calm supporting neutral for positive/data context, never a competing CTA color.

- **Bone Surface** (`#F4F0E8`) — Primary app canvas, sheets, and calm background areas.
- **Soft Paper** (`#FBF9F4`) — Raised surface fill, form fields, and gently separated sections.
- **Charcoal Ink** (`#20211F`) — Primary text, primary icons, key dividers, and dark depth. Never use pure black.
- **Warm Graphite** (`#5E5C56`) — Secondary text, inactive icons, and subdued metadata.
- **Mist Neutral** (`#D9DDD5`) — Borders, skeletons, inactive tracks, and low-emphasis data.
- **Sage Signal** (`#8E9F8B`) — Supportive completion, hydration, stable trends, selected low-emphasis states, and data marks.
- **Terracotta Action** (`#C97B5B`) — The only accent: primary buttons, active critical focus state, and warm emphasis. Use sparingly.
- **Quiet Warning** (`#9B7860`) — Non-alarming caution copy or a near-goal data state; never use aggressive red.

Color rules:

- Use Charcoal Ink on Bone Surface for primary reading contrast.
- Keep accent saturation controlled; no neon, outer glow, rainbow charts, or purple-blue AI gradients.
- Never rely on color alone for progress, error, selection, or chart meaning; pair it with labels, shape, position, or icons.
- Use Sage Signal for supporting health progress and Terracotta Action for a single primary action per screen.

## 3. Typography Rules

Typography should feel editorial but never ornamental. Use a refined contrast between a distinctive modern display face and a highly legible humanist sans.

- **Display:** `Fraunces` or `Instrument Serif` — only for primary screen titles and quiet, short editorial moments. Use 32–40 px on phone screens, tight but readable tracking, 1–3 lines maximum.
- **UI and body:** `Satoshi`, `Geist`, or the configured system sans — use for controls, data, labels, and paragraphs. Preferred body size is 16 px with 1.45–1.6 line height.
- **Data and metadata:** `Geist Mono` or `JetBrains Mono` — only for compact numeric pairs, timestamps, and chart values where alignment matters. Do not overuse mono.
- **Hierarchy:** Create hierarchy with size, weight, spacing, and contrast rather than oversized headings or multiple typefaces.
- **Line length:** Keep body content to roughly 32–42 characters per line on phone screens. Never shrink text to fit more UI.
- **Minimums:** Body copy must be at least 14 px; control labels at least 15 px; primary CTA labels at least 16 px.

Banned: Inter as a default premium face; Times New Roman, Georgia, Garamond, Palatino, generic serif fonts, all-caps paragraph copy, tiny decorative labels, and excessive font-weight variation.

## 4. Component Stylings

### Navigation

- Use a persistent four-item bottom tab bar only for primary signed-in destinations: **Today**, **Insights**, **Learn**, and **You**.
- The active tab uses Charcoal Ink with a Sage Signal indicator or icon treatment; inactive tabs use Warm Graphite.
- Tabs must have a 44 px minimum touch target and clear labels. Do not overload the tab bar or hide core destinations.
- Onboarding and authentication do not show the tab bar. Use a simple back affordance only when it advances a logical stack flow.

### Buttons

- One filled primary action per screen, using Terracotta Action with Bone Surface text.
- Button height: 52 px minimum; corner radius: 16 px; horizontal padding: 20–24 px.
- Secondary actions are text buttons or quiet outlines in Charcoal Ink. Do not use a second filled CTA.
- Press feedback: reduce scale to 0.98 and translate down 1 px using spring motion. No neon glow, bounce, or custom cursor.

### Inputs and forms

- Place the label above the control; do not use floating labels.
- Inputs use Soft Paper fill, a 1 px Mist Neutral border, 14–16 px radius, and 52 px minimum height.
- Focus state uses a restrained Terracotta Action border or 2 px ring; errors appear in clear inline text below the input.
- Keep sign-in flows airy. Show only fields necessary for the current task.

### Cards, lists, and sections

- Use cards only when elevation communicates a distinct action or information group. Prefer negative space and thin Mist Neutral dividers for ordinary lists.
- Card radius: 20–24 px; padding: 20–24 px; shadow: diffuse, warm-tinted, low opacity. No glassmorphism or stacked-card nesting.
- Meals, habits, and settings use clear rows with aligned values and direct touch targets.
- Primary dashboard modules may use one larger, calm surface; avoid box-in-box layouts.

### Data visualization

- Use gentle line charts for weight, energy, and sleep trends; show 7-day or monthly context and label the time span.
- Use thin horizontal bars for macros and a single ring for hydration or one high-level progress goal.
- Use Sage Signal for steady/supportive data and Terracotta Action only for a meaningful emphasis. Labels explain data state; charts never imply judgment.
- Avoid fake precision, alarm colors, noisy grids, excessive widgets, or dense chart dashboards.

### Loading, empty, and error states

- Use skeletons that match the destination layout; no generic circular spinner as the main loading UI.
- Empty states should show a quiet, composed action: an understated illustration, one helpful sentence, and one next step.
- Errors are calm and inline, explain what happened in plain language, and provide a recovery action where possible.

### Icons and imagery

- Use thin, rounded custom line icons based on the arc, horizon, droplet, leaf, sun, moon, and simple meal motifs. Icons should feel personal, not like a generic library set.
- Photography is editorial still life: water, seasonal fruit, linen, ceramic, gentle daylight, and natural textures. No body transformations, stock gym imagery, medical equipment, or lab scenes.
- When images sit behind text, fade them into Bone Surface or use a soft scrim so copy remains fully readable.

## 5. Layout Principles

- Design mobile-first around real safe areas: status bar, top title zone, bottom tab bar, and home indicator must always have breathing room.
- Use a four-point spacing rhythm: 4, 8, 12, 16, 24, 32, 48 px. Default horizontal screen padding is 20–24 px.
- Keep one primary focal point above the fold. Do not turn a mobile screen into a desktop dashboard compressed into a phone.
- Prefer left-aligned editorial headings and asymmetrical balance. Avoid centered marketing-hero layouts for product screens.
- Use clear zones: title/context, primary task or insight, supporting detail, then navigation or next action.
- Every element occupies its own spatial zone. Do not overlap text, cards, imagery, or controls; avoid absolute-positioned content stacking.
- Use 16–24 px spacing between major sections and 8–12 px between related items.
- Preserve a minimum 44 px touch target for interactive controls.
- On larger screens, increase outer margins and retain a readable single-column content width; never create horizontal scrolling for core content.
- When multiple columns exist on web/tablet, collapse to one column below 768 px with no exceptions.

## 6. Motion & Interaction

Motion communicates reassurance and direct manipulation, never gamified pressure.

- Use spring motion by default: stiffness `100`, damping `20`.
- Animate only `transform` and `opacity`; never animate layout properties such as `top`, `left`, `width`, or `height`.
- Use short 160–240 ms transitions for presses, tab changes, sheets, and disclosure. Use staggered 40–60 ms reveals for lists only when it improves orientation.
- Hydration rings and progress bars may softly animate to their current value once; do not use perpetual, attention-demanding loops for health metrics.
- Use reduced-motion preferences. When reduced motion is enabled, preserve state changes without movement-heavy effects.
- Keep Reanimated or animated code isolated and hardware-accelerated. Avoid filters, large blur animations, and CPU-heavy perpetual effects.

## 7. Anti-Patterns (Banned)

Never do the following:

- No emojis in product UI.
- No pure black (`#000000`), neon glow, oversaturated colors, or purple-blue AI gradients.
- No generic bright-green health styling, hospital/clinical interface, gym-bro language, transformation imagery, or body-shaming feedback.
- No Inter default, generic serif fonts, all-caps filler copy, tiny text, or decorative unreadable labels.
- No generic AI copy such as “Elevate,” “Seamless,” “Unleash,” “Next-Gen,” or motivational filler.
- No “Scroll to explore,” “Swipe down,” bouncing chevrons, or other filler navigation prompts.
- No dense fake dashboards, fake precision, generic round-number claims, or data that implies medical certainty.
- No more than one filled primary CTA per screen.
- No three-equal-card feature rows, excessive pills/tags, nested card stacks, glassmorphism, or overlapping elements.
- No hidden navigation logic: tab, sheet, stack, and modal behavior must be visually clear.
- No color-only meaning; no inaccessible contrast; no touch target below 44 px.
- No stock gym, office, laboratory, or medical images; no broken external image links.
- No secrets, auth tokens, API keys, or AI credentials exposed in mobile UI or client-side code.