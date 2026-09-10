

```markdown
# Role
Act as an Expert React Developer and Creative Technologist specializing in data visualization and canvas rendering.

# Objective
Build a "Population Scale Visualizer." The user types a number (representing followers/people/any large count). The app visualizes that number as a crowd of dots filling up a sequence of real-world locations, starting small (a public square) and progressing through larger and larger real places, so the user viscerally understands how large their number is by comparing it to real, recognizable places.

# Tech Stack
- React (Hooks, Functional Components)
- TypeScript (strict typing)
- HTML Canvas (for ALL crowd-dot rendering — see rendering rules below)
- Framer Motion (only for UI chrome transitions between location stages — NOT for individual dots)
- Tailwind CSS (layout/UI only)

---

# PART 1 — Location Tiers (real-world places, real population figures)

Use these exact confirmed figures. Do not invent your own numbers.

```

const LOCATION\_TIERS = \[
{
name: "Square",
label: "Tahrir Square",
capacity: 250000,
isEstimate: true,
// Source: multiple historical accounts (academic thesis, StudyGuides.com) cite
// Tahrir Square's estimated holding capacity at ~250,000 during major events.
// Widely-cited ESTIMATE, not an official engineered capacity.
},
{
name: "Stadium",
label: "Major Stadium", // TODO: pick a specific real stadium (e.g. Cairo International Stadium)
capacity: 0, // TODO PLACEHOLDER — confirm the exact official seating capacity for
// whichever specific stadium is chosen. Do not guess a number.
isEstimate: false,
},
{
name: "District",
label: "City District", // TODO: pick a specific real district/neighborhood
capacity: 0, // TODO PLACEHOLDER — depends on which district is chosen; look up
// that district's real population once named. Do not guess.
isEstimate: false,
},
{
name: "City",
label: "Greater Cairo",
capacity: 23000000,
isEstimate: false,
// Source: 2026 estimates (Wikipedia, Macrotrends, worldpopulationreview) converge
// around 22-23.5M for Greater Cairo metro area (not just Cairo governorate, ~10.1M alone).
},
{
name: "Country",
label: "Egypt",
capacity: 120101175,
isEstimate: false,
// Source: UN World Population Prospects (2024 revision), cross-confirmed by
// Worldometer, StatisticsTimes, PopulationPyramid.net — mid-2026 estimate.
},
{
name: "Continent",
label: "Africa",
capacity: 1585000000,
isEstimate: false,
// Source: UN World Population Prospects (2024 revision) via Worldometer and
// PopulationPyramid.net — 2026 estimate.
},
{
name: "World",
label: "Earth",
capacity: 8200000000,
isEstimate: true,
// Approximate, commonly-cited current world population figure.
}
];

```

**Rules about this data:**
- Treat Square/City/Country/Continent/World values as final.
- Stadium and District are intentionally `capacity: 0` placeholders — do NOT invent numbers for them. Leave the TODO comments visible so the user can fill them in after picking specific real places.
- Where `isEstimate: true`, the UI must visually mark that figure as approximate (e.g. "~" prefix or "(estimated)" label). Egypt and Africa figures are precise demographic estimates and should NOT be marked as rough.

## Background images: placeholder system (do not hallucinate real photos)
Do NOT generate, hardcode a URL for, or attempt to pull in an actual copyrighted photo of a real location. Add a `backgroundImage: string` field per tier defaulting to a solid placeholder color/gradient (or a placeholder path like `/assets/locations/square.jpg`) that the user will manually replace later. Swapping in a real photo must be a one-line path change per tier.

---

# PART 2 — Crowd Rendering: Canvas-Based Sequential Color-Tier Dot System

## Why this approach (context for the agent)
We cannot render one dot per person once numbers get large (visual clutter + would require unbounded dots). Earlier versions tried a division-based "each dot = N people" label, which worked but felt visually flat. The correct approach: keep every dot representing a fixed value within its own "color tier," and merge lower-tier dots into higher-tier dots as a location's crowd saturates — similar to how currency denominations work (pennies roll up into dollars). Small numbers render as an exact 1 dot = 1 person count; only once a location's crowd is genuinely large does the system start "rolling up" into higher-value dot tiers, and it does so one tier at a time, sequentially, never skipping or mixing more than two tiers at once.

## 1. Single canvas, no per-dot DOM/React nodes (critical performance rule)
Render all dots in ONE `<canvas>` element per location stage using a single draw loop (`for` loop calling `ctx.arc()`/`ctx.fillRect()` per dot). Do NOT create a React component, DOM node, or Framer Motion instance per dot — this exact mistake caused a full browser freeze in an earlier version of this project when thousands of individually-animated DOM nodes were rendered. Canvas draw calls in one paint pass are cheap regardless of dot count; individually-tracked DOM/animated nodes are not.

## 2. Dot cap and color-tier definitions
```

const CAP = 2000;      // max dots ever drawn on screen at once, per location stage
const BASE = 10;       // how many lower-tier dots merge into one higher-tier dot

const DOT\_TIERS = \[
{ level: 0, color: '#E8E8E8', radius: 2, label: '1 person' },
{ level: 1, color: '#4A90D9', radius: 2.5, label: '10 people' },
{ level: 2, color: '#9B59B6', radius: 3, label: '100 people' },
{ level: 3, color: '#F1C40F', radius: 3.5, label: '1,000 people' },
// extend this array programmatically for any level beyond what's defined here
// (cycle through a palette or generate a new distinguishable color procedurally)
];

```

## 3. Sequential (non-greedy) merge algorithm — EXACT SPEC, implement precisely
At any given population value within a single location stage, only TWO adjacent dot-tier colors may ever be visible simultaneously: the tier currently being "drained" (already fully saturated once) and the tier currently "filling." A higher tier must never show any dots until the tier directly below it has been fully saturated (reached its full 2000/2000 dot count) at least once. Never show 3+ tier colors at once.

```

function getDotComposition(populationInThisStage: number) {
// Find the highest tier fully saturated already (i.e. its full value, CAP \* BASE^tier, has been reached)
let fullTier = -1;
while (CAP \* Math.pow(BASE, fullTier + 1) <= populationInThisStage) {
fullTier++;
}

const lowerTier = fullTier;          // -1 means "no lower tier yet, pure tier-0 phase"
const upperTier = fullTier + 1;
const upperUnitValue = Math.pow(BASE, upperTier);

const consumedByLowerTiers = fullTier >= 0 ? CAP \* Math.pow(BASE, fullTier) : 0;
const remaining = populationInThisStage - consumedByLowerTiers;

const upperDots = Math.min(CAP, Math.floor(remaining / upperUnitValue));
const lowerDots = CAP - upperDots;

return { lowerTier, lowerDots, upperTier, upperDots };
}

```

**Verify your implementation against these exact worked examples before considering this done:**
| population | lowerTier | lowerDots | upperTier | upperDots |
|---|---|---|---|---|
| 500 | -1 | 0 | 0 | 500 |
| 2,000 | -1 | 0 | 0 | 2,000 |
| 5,000 | 0 | 1,700 | 1 | 300 |
| 20,000 | 0 | 0 | 1 | 2,000 |
| 50,000 | 1 | 1,700 | 2 | 300 |

(Reading a row: at population 5,000, render 1,700 dots in Tier-0 color and 300 dots in Tier-1 color — no Tier-2 dots exist at this population. At population 20,000, ALL 2,000 dots are Tier-1 color, none are Tier-0 anymore.)

## 4. Placement algorithm — grid-based "fill from front," not random scatter
- Define a "fillable area" polygon within the location's background image (the ground/crowd area).
- Divide it into a fine grid of cells (e.g. 10x10px).
- Order cells by fill priority, front-to-back (bottom of image = closer to camera = fills first), so the crowd visually builds from the foreground backward like a real photo of a filling crowd.
- Place `lowerDots` count of lower-tier-colored dots and `upperDots` count of upper-tier-colored dots into the highest-priority (frontmost) cells first, each with ±2-3px random jitter so it doesn't look mechanically gridded. Use one consistent simple dot shape (small filled circle) — size only varies by tier per the `DOT_TIERS` radius values.

## 5. Stage transitions (when a location fully fills)
When population in the current location stage would require exceeding its real-world capacity:
- Cap the display at that stage's full capacity, transition to the next location tier with a smooth fade/zoom Framer Motion animation (applied to the background/UI chrome only, never per-dot).
- Compute `remainingPopulation = totalPopulation - sum of all previous stages' capacities`, and run the same dot-composition algorithm fresh for the new stage (dot tiers reset to Tier-0 phase at the start of each new location stage).

## 6. Beyond World capacity
If population exceeds Earth's ~8.2 billion: don't render anything further. Show text: `"That's Nx the population of planet Earth"` where `N = totalPopulation / 8_200_000_000`, formatted readably.

## 7. Dynamic color legend
Show a small legend near the progress bar listing only the tier colors currently present in the active stage (e.g. "⚪ = 1 person, 🔵 = 10 people"), updating live as tiers change. Don't show tier colors with zero dots currently on screen.

---

# UI Requirements
- Current stage name prominently displayed (e.g. "Egypt — 45,000,000 / 120,101,175").
- Progress bar/percentage for the current stage's fill ratio.
- Breadcrumb of passed/current/upcoming stages (e.g. "✓ Square ✓ Stadium ✓ District → City (in progress)").
- Dynamic color legend (per above).
- Estimate indicators ("~") on Square and World figures.
- Input accepts arbitrarily large numbers without lag (dot count on canvas stays capped at 2000 regardless of input size).

# Component Structure
1. `PopulationVisualizer`: top-level state — input population, active location tier, remaining population, stage-transition triggers.
2. `LocationStage`: renders background (placeholder) + the crowd `<canvas>`, using the grid-fill + dot-composition logic above.
3. `StageProgressBar`: stage name, numeric progress, percentage, estimate indicators.
4. `StageBreadcrumb`: sequence of stages.
5. `DotColorLegend`: currently-active tier colors and their meaning.

# Deliverables — build in this order
1. Pure, testable logic functions (no React): `getDotComposition()` exactly as specified (verify against the worked examples table), the location-tier lookup/remainder calculator, and the grid-based fill-placement generator.
2. React components wiring the above to canvas rendering and Framer Motion stage transitions.
3. Clear comments marking where the user should (a) pick real places and confirm figures for Stadium/District, (b) replace placeholder backgrounds with real licensed images, (c) extend the `DOT_TIERS` palette if desired.

# Explicitly out of scope / do not add
- Do not use the old village-builder building-icon tier system (trees/huts/castles) — fully replaced by this dot system.
- Do not generate or hardcode real photo URLs.
- Do not invent population/capacity figures beyond the confirmed values given — leave Stadium/District as flagged placeholders.
- Do not create per-dot DOM nodes, React components, or Framer Motion instances under any circumstances.
- Never show 3+ dot-tier colors simultaneously in one stage.

# Test criteria before confirming done
1. Verify `getDotComposition()` output against all 5 worked examples in the table above exactly.
2. Type 1 → exactly 1 dot, Tier-0 color.
3. Type 100 → exactly 100 dots, Tier-0 color.
4. Type 2,000 → exactly 2,000 dots, all Tier-0, screen fully saturated.
5. Type 2,500,000 → confirm no lag/freeze, confirm at most 2 dot-tier colors visible, confirm correct location stage is active.
6. Type 150,000,000 → confirm correct stage transition through Square → Stadium → District → City → Country, landing partway through Egypt.
7. Type 50,000,000,000 → confirm the "Nx Earth's population" fallback text appears instead of further rendering attempts.
```

