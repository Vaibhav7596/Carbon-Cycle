# CarbonCycle — Design Specification

## 1. Purpose

This document defines the complete visual, UI, UX, interaction, layout, and design-system requirements for **CarbonCycle**.

CarbonCycle is a premium climate-tech operations platform that connects waste generators with waste-conversion facilities, supports smart facility matching, coordinates collection logistics, tracks waste through processing, and measures estimated net CO₂e impact.

The design must make CarbonCycle feel like **serious climate-tech infrastructure software**, not a generic admin dashboard, environmental NGO site, or college project.

---

# 2. Design Vision

## Core aesthetic

CarbonCycle should combine:

- Stripe-style clarity and restraint
- Linear-style typography, spacing, density, and interaction quality
- Vercel-style minimalism and visual confidence
- Modern logistics software's operational clarity
- Climate/carbon analytics software's data visualization
- GIS interfaces for waste-source, facility, and route visibility

### Brand personality

**Precision over hype.**

The product should communicate:

> We are building software to manage a measurable circular-carbon network.

The environmental identity should come from:

- restrained green accents
- carbon metrics
- waste-flow visualizations
- maps
- operational lifecycle tracking
- impact reporting

It should NOT come primarily from:

- leaves
- trees
- recycling-bin illustrations
- stock environmental photography
- excessive green backgrounds
- decorative sustainability graphics

---

# 3. Reference Sources

The provided visual references should be treated as **inspiration only**.

### Reference 1 — Logistics dashboard

Use for:

- sidebar hierarchy
- KPI presentation
- operational dashboard organization
- tracking history
- data tables
- status badges

### Reference 2 — Logistics SaaS dashboard

Use for:

- whitespace
- clean hierarchy
- map/tracking split layout
- compact navigation
- operational feeling

### Reference 3 — Carbon / emissions dashboard

Use for:

- carbon KPI hierarchy
- emissions trends
- reporting structure
- progress visualization
- impact analytics

Do not inherit its purple-heavy visual identity.

### Reference 4 — Sustainability dashboard

Use for:

- green accent language
- sustainability metrics
- environmental KPI treatment
- progress indicators
- activity layouts

### MyWasteSolution

Use as a **domain and product-concept reference**, particularly for:

- connecting waste generators with service providers/facilities
- material/waste listings
- facility discovery
- capacity/location concepts
- waste-management network behavior

Do not copy its branding, layout, text, assets, or exact UI.

CarbonCycle should feel substantially more minimal, SaaS-oriented, operational, and premium.

---

# 4. Design Principles

## 4.1 Minimalism

Every visible element should have a purpose.

Avoid:

- dashboard soup
- unnecessary cards
- redundant icons
- excessive decorative graphics
- huge illustrations
- unnecessary gradients

## 4.2 Strong hierarchy

Every page must have one primary visual element.

Examples:

- Dashboard → Network Map
- Matching → Recommended Facility
- Logistics → Route Map
- Carbon → Net CO₂e Benefit
- Analytics → Main Trend
- Waste Details → Lifecycle

## 4.3 Data first

CarbonCycle is fundamentally an operations/data product.

Data should be:

- easy to scan
- correctly grouped
- visually prioritized
- easy to compare

## 4.4 Progressive disclosure

Do not show everything at once.

Use:

- drawers
- expandable sections
- tabs
- detail views
- contextual actions

## 4.5 Explainability

Recommendations and calculations must be understandable.

Users should be able to answer:

> Why was this facility recommended?

and:

> How was this CO₂e number calculated?

---

# 5. Color System

Use a mostly neutral UI with a restrained green accent.

## Base colors

```text
Background        #F7F8F6
Surface           #FFFFFF
Surface Muted     #F1F3F0

Primary Text      #17201A
Secondary Text    #68736C
Muted Text        #89928C

Border            #E3E7E3
Subtle Border     #ECEFEC
```

## Green system

```text
Primary Green     #16794A
Dark Green        #0F5A36
Soft Green        #E7F4EC
Bright Green      #25A866
```

## Semantic colors

```text
Blue              #3B82F6
Amber             #D99422
Red               #C95151
```

## Color usage rule

Approximately:

- 85–90% neutral UI
- 10–15% accent/semantic color

Green should primarily represent:

- successful diversion
- positive carbon impact
- successful processing
- primary CTA
- active sustainable flow

Do NOT color every card, chart, button, icon, and background green.

---

# 6. Typography

Use **Inter** as the primary typeface.

Use Geist only if Inter is unavailable.

## Type scale

```text
Hero               56–72px
Page title         28–32px
Section heading    18–22px
KPI value          28–36px
Body               14–16px
Secondary          13–14px
Metadata           12px
```

Use:

- regular for body
- medium for labels
- semibold for important headings
- bold only when necessary

Avoid excessive heavy typography.

Typography should feel similar in discipline to Linear/Stripe rather than traditional enterprise applications.

---

# 7. Spacing System

Use an 8px-based spacing system.

```text
8px
16px
24px
32px
48px
64px
```

Major page sections should generally use 32–64px spacing.

Do not compress unrelated modules into a small space.

Do not create huge empty gaps without purpose.

---

# 8. Corner Radius

Use restrained radius values.

```text
Small control       6px
Buttons             7–8px
Cards               10–12px
Large containers    12–14px
```

Avoid making everything pill-shaped.

Pills are primarily for:

- status
- tags
- filters
- compact badges

---

# 9. Borders and Elevation

Prefer subtle borders to shadows.

Standard card:

```text
border: 1px solid #E3E7E3
background: #FFFFFF
```

Use shadows sparingly.

Elevation should communicate hierarchy, not decoration.

Avoid:

- heavy card shadows
- floating everything
- excessive drop shadows

---

# 10. Iconography

Use **Lucide React** consistently.

Icon characteristics:

- simple
- thin
- clean
- consistent stroke width
- mostly monochrome

Do not mix:

- emoji
- Material icons
- Font Awesome
- random SVG icon styles

No emoji in the production interface.

---

# 11. Overall Application Layout

Desktop-first layout:

```text
┌────────────────┬────────────────────────────────────┐
│                │ Topbar                             │
│                ├────────────────────────────────────┤
│    Sidebar     │                                    │
│                │ Main Content                       │
│                │                                    │
│                │                                    │
└────────────────┴────────────────────────────────────┘
```

Sidebar width:

**230–250px**

Main content:

**max-width approximately 1440px**

Main content should have generous horizontal padding.

---

# 12. Sidebar

Sidebar should be minimalist.

```text
CARBONCYCLE

OVERVIEW
  Overview

OPERATIONS
  Waste
  Facilities
  Logistics
  Processing

IMPACT
  Carbon
  Analytics
  Reports

SYSTEM
  Notifications
  Settings
```

Bottom area:

```text
Avatar
Organization
Role
Dropdown
```

### Active navigation

Use:

- soft green background
- green icon
- dark text

Do not use a huge dark active block.

---

# 13. Topbar

Keep it simple.

Left:

- breadcrumb
- current page title

Right:

- search
- notifications
- organization selector
- profile

Some pages may additionally contain:

- date range
- export
- primary action

Do not overcrowd the topbar.

---

# 14. Primary Application Navigation

Recommended information architecture:

```text
Overview

Operations
  Waste
  Facilities
  Logistics
  Processing

Impact
  Carbon
  Analytics
  Reports

System
  Notifications
  Settings
```

Admin users may additionally see:

```text
Administration
  Users
  Carbon Factors
  System Data
```

---

# 15. Dashboard Design

The Dashboard is the **main showcase page**.

## Header

Example:

```text
Overview

Monitor waste flows, conversion capacity and carbon impact.

                                      + List Waste
```

Primary CTA should always be visually obvious but compact.

---

## KPI row

Use four primary metrics:

### Total Waste

```text
12,840 t
↑ 12.4%
vs last month
```

### Waste Diverted

```text
8,420 t
65.5%
of total waste
```

### Estimated CO₂e Benefit

```text
4,820
tCO₂e
↑ 18.2%
```

### Active Facilities

```text
36
+4
this month
```

Avoid stuffing large icons and excessive trend graphics into every KPI.

---

# 16. Dashboard Hero — Network Map

The largest visual element on the dashboard should be the **interactive ecosystem map**.

Recommended layout:

```text
┌─────────────────────────────────────────────────────┐
│ Waste Network                                       │
│                                                     │
│                       MAP                           │
│                                                     │
│       ●──────────→──────────◆                      │
│                                                     │
│                                                     │
│                                         Filters     │
└─────────────────────────────────────────────────────┘
```

The map must communicate:

```text
Waste Source
     ↓
Collection Route
     ↓
Conversion Facility
```

---

# 17. Map Semantics

Use different markers for:

### Waste Source

Circular marker.

### Facility

Distinct facility marker.

### Active route

Thin line.

Use a muted map background.

Do not allow the map colors to overpower the application UI.

---

# 18. Map Interaction

Clicking a waste marker should open a compact information panel:

```text
Food Processing Unit

Food Waste
1.2 tons available

Matched
Green BioEnergy

14.2 km
```

Clicking a facility should show:

```text
Green BioEnergy

Biogas Facility

7.2 t available

Accepts:
Food Waste
Manure
Organic Waste
```

Clicking a route should show:

```text
Pickup #PK-1024

14.2 km
1.0 ton

In Transit
```

---

# 19. Dashboard Secondary Content

Below the map:

```text
┌─────────────────────────────┬──────────────────────┐
│ Waste Diversion Trend       │ Recent Activity      │
│                             │                      │
│ chart                       │ ✓ Waste matched      │
│                             │ 🚚 Pickup scheduled   │
│                             │ ✓ Waste processed     │
└─────────────────────────────┴──────────────────────┘
```

Then:

```text
┌──────────────────────────────────────────────────────┐
│ Waste Flow                                            │
│                                                      │
│ Farms ───────────┐                                   │
│                  ├──→ Biochar Facility               │
│ Markets ─────────┘                                   │
│                                                      │
│ Restaurants ─────┐                                   │
│                  ├──→ Biogas Facility                │
│ Industries ──────┘                                   │
└──────────────────────────────────────────────────────┘
```

Do not overload the dashboard with tiny charts.

---

# 20. Waste Page

The Waste page should feel like a modern SaaS data-management page.

Header:

```text
Waste Lots

Track all waste entering the CarbonCycle network.

                                      + List Waste
```

Filter/search row:

```text
Search
Waste Type
Status
Location
Date
```

Use a clean table.

Columns:

```text
ID
Type
Quantity
Generator
Facility
Status
Created
```

Rows should have:

- generous height
- subtle separators
- hover state
- no vertical borders
- right-aligned numeric values

---

# 21. Waste Lot Detail Page

Waste Lot detail is an **operations tracking page**.

Top:

```text
← Waste Lots

WL-1024
Food Waste · 1,000 kg

MATCHED
```

## Lifecycle component

```text
LISTED
  ✓
ANALYZED
  ✓
MATCHED
  ●
PICKUP
  ○
DELIVERED
  ○
PROCESSING
  ○
COMPLETED
```

Keep this visually central.

---

# 22. Waste Detail Layout

Use a two-column structure.

Left:

```text
Waste Information

Type
Food Waste

Quantity
1,000 kg

Source
Ahmedabad Food Market

Availability
12 Sep · 10:00–18:00
```

Right:

```text
Estimated Impact

0.93 tCO₂e

Estimated net benefit

View calculation →
```

Do not create nested cards unnecessarily.

---

# 23. Create Waste Flow

The Create Waste experience should use **progressive disclosure**.

Recommended steps:

```text
1. Waste type
2. Quantity
3. Availability
4. Characteristics
5. Location
6. Review / submit
```

Do not display 15 fields at once.

---

# 24. Form Design

Example:

```text
List waste

Waste type
[ Food Waste                  ]

Quantity
[ 1,000 ] [ kg ]

Availability
[ 12 Sep ] [ 10:00 ] — [ 18:00 ]

Location
[ Search location             ]

                         Continue →
```

Forms should have:

- clear labels
- compact inputs
- visible validation
- helpful hints
- focused primary CTA

Do not use default browser styling.

---

# 25. Waste Analysis

After Waste Lot submission, show:

```text
Analyzing waste...
```

Then:

```text
Food Waste
1,000 kg

Suitable pathways

Biogas        92%
Compost       76%
Biochar       41%
```

Keep the presentation clean and data-driven.

These are **suitability scores**, not scientific guarantees.

---

# 26. Matching Screen

The Matching screen should feel like a **recommendation engine** rather than a normal table.

Header:

```text
Find the best conversion facility
```

Waste summary:

```text
Food Waste
1,000 kg
Ahmedabad
```

---

# 27. Recommended Facility Card

Primary recommendation:

```text
#1

Green BioEnergy                    94% Match

Biogas Facility

14.2 km
7.2 t capacity
₹1,240 estimated transport

✓ Compatible
✓ High capacity
✓ Low transport distance

                          Select Facility
```

The 94% match should be visually prominent but not displayed as an oversized circular gauge.

Use large text + subtle horizontal score bar.

---

# 28. Alternative Facilities

Show 2–3 alternatives below or beside the primary recommendation.

Example:

```text
EcoGas Plant              87%
BioCycle Facility         79%
```

Do not give every facility the same visual prominence.

---

# 29. Explain Match

Add:

**Why this match?**

Expandable panel:

```text
Compatibility       ██████████ 100
Capacity             █████████  92
Distance             ████████   84
Cost                 ███████    78
```

Text:

> Recommended based on waste compatibility, available capacity, transportation distance and estimated cost.

The matching system must feel explainable.

---

# 30. Facility Directory

Facility discovery combines:

**network marketplace + operations platform**

Header:

```text
Conversion Facilities

Find facilities that can process your waste.
```

Search:

```text
Search facility, city or waste type
```

Filters:

```text
Process
Distance
Capacity
Waste type
```

Facility cards should contain:

```text
Green BioEnergy

Biogas Facility

Ahmedabad

Accepts:
Food Waste
Manure
Organic Waste

7.2 t available

14.2 km away

View Facility
```

Do not make them look like e-commerce cards.

---

# 31. Facility Details

Use a split layout.

Left:

- facility information
- accepted waste
- capacity
- cost
- status

Right:

- location map

Example:

```text
Green BioEnergy
Biogas Facility

Available capacity
7.2 t

Processing cost
₹X / ton

Status
Active
```

---

# 32. Facility Request UX

After facility selection:

```text
Waste Lot
      +
Facility
      ↓
Match Request
```

Status:

```text
Pending Facility Approval
```

Facility sees:

```text
Food Waste
1,000 kg
14.2 km away

[ Accept ] [ Reject ]
```

Rejected requests should return to matching.

---

# 33. Logistics Screen

Use a clean split-screen layout.

```text
┌─────────────────────────────┬──────────────────────────┐
│ Pickup details              │                          │
│                             │                          │
│ Source                      │          MAP             │
│ Destination                 │                          │
│ Quantity                    │          ROUTE           │
│ Vehicle                     │                          │
│ Distance                    │                          │
│ Cost                        │                          │
│ Transport CO₂               │                          │
└─────────────────────────────┴──────────────────────────┘
```

This page should strongly reflect the logistics references.

---

# 34. Pickup Lifecycle

Display:

```text
SCHEDULED
    ↓
DRIVER ASSIGNED
    ↓
EN ROUTE
    ↓
PICKED UP
    ↓
DELIVERED
```

For the MVP, use action buttons:

```text
Start Pickup
Mark Picked Up
Mark Delivered
```

No real-time GPS is required.

---

# 35. Processing Screen

Processing should feel like an operations queue.

Header metrics:

```text
Incoming      3
Processing    7
Completed    42
```

Example item:

```text
Food Waste
1,000 kg
Green BioEnergy

Biogas

Processing
████████░░ 82%

View →
```

Completed:

```text
✓ Processed
1,000 kg → 245 m³ biogas
```

---

# 36. Carbon Impact Screen

This is the second visual hero of the product.

Header:

```text
Carbon Impact

Waste Lot WL-1024
```

Hero value:

```text
0.93
tCO₂e

NET ESTIMATED BENEFIT
```

Keep this area uncluttered.

---

# 37. Carbon Contribution Breakdown

Display:

```text
Landfill emissions avoided     +0.84
Carbon stored                  +0.22
Transport emissions            -0.05
Processing emissions           -0.08
────────────────────────────────────
Net estimated benefit           0.93
```

Use:

- green for positive contribution
- muted amber/red for emissions

A clean waterfall chart is preferred if implemented well.

---

# 38. Carbon Calculation Drawer

Click:

**View calculation**

Open a right-side drawer.

Show:

```text
Calculation

Waste quantity
1,000 kg

Landfill factor
0.84 kgCO₂e/kg

Landfill avoidance
840 kgCO₂e

Transport distance
14.2 km

Transport emissions
50 kgCO₂e

Processing emissions
80 kgCO₂e

Estimated stored carbon
220 kgCO₂e

────────────────────────

Net benefit
930 kgCO₂e
```

This is preferable to navigating away.

---

# 39. Carbon Language

Always use:

**Estimated CO₂e Benefit**

Do not describe estimates as:

- certified carbon credits
- verified offsets
- guaranteed sequestration

Use the disclaimer:

> Carbon values are estimates based on configurable emission factors and are intended for impact tracking, not certified carbon-credit issuance.

Keep the disclaimer visible but visually subtle.

---

# 40. Analytics Screen

Analytics should feel like a serious climate-data product.

Header:

```text
Analytics

Understand waste flows, diversion and carbon impact.

                              Sep 2026 ▾
```

Use 3–4 meaningful visualizations.

### Chart 1

Waste diverted over time.

### Chart 2

Carbon benefit over time.

### Chart 3

Waste by conversion pathway.

### Chart 4

Waste source → facility flow.

Avoid filling the page with many tiny charts.

---

# 41. Chart Style

Charts should be minimal.

Avoid:

- 3D
- heavy gridlines
- excessive colors
- gradients everywhere
- oversized legends

Preferred chart palette:

- green
- dark neutral
- light neutral
- one secondary semantic color

Every chart should have:

- title
- short context line
- visualization
- time/source indicator where relevant

---

# 42. Waste Flow Visualization

This is an important differentiator.

Represent the ecosystem visually:

```text
Farm A ────────┐
Farm B ────────┼──→ Biochar Facility
Farm C ────────┘

Restaurant A ──┐
Restaurant B ──┼──→ Biogas Facility
Market C ───────┘
```

The goal is to communicate:

**waste source → logistics → conversion → impact**

A Sankey-style visualization is ideal, but a simple flow diagram is acceptable if more reliable.

---

# 43. Reports

Reports page should be understated.

```text
Reports

September 2026

Waste Diversion Report
Carbon Impact Report
Facility Processing Report

Export PDF
Export CSV
```

Do not turn reports into another dashboard.

---

# 44. Landing Page

The landing page should feel like a premium climate-tech startup site.

Do not duplicate the dashboard.

## Hero

Large typography:

> **Turn waste into carbon value.**

Subheadline:

> Connect waste generators with conversion facilities, optimize collection, and measure the impact of every ton diverted from landfill.

Buttons:

**Get Started**

**Explore the Network**

---

# 45. Hero Visual

Instead of stock photography, show a product-oriented ecosystem visualization:

```text
Waste Source
     ↓
Match
     ↓
Route
     ↓
Facility
     ↓
CO₂e Impact
```

Prefer UI/product visualization over decorative illustrations.

---

# 46. Landing Page Structure

Recommended:

```text
Hero

↓
Key numbers / proof

↓
How CarbonCycle works

↓
Product preview

↓
Smart matching

↓
Logistics

↓
Carbon impact

↓
Municipality dashboard

↓
Final CTA
```

Show the actual product UI early.

Visitors should understand within seconds that CarbonCycle is software.

---

# 47. How CarbonCycle Works Section

Use five steps:

```text
01
List waste

02
Find the right facility

03
Optimize collection

04
Convert

05
Measure impact
```

Each step should have:

- number
- short title
- 1–2 line description

Avoid giant illustrations.

---

# 48. Buttons

### Primary

```text
Background: #16794A
Text: white
Radius: 7–8px
```

### Secondary

```text
Background: white
Text: dark
Border: #E3E7E3
Radius: 7–8px
```

### Tertiary

Text-only.

Buttons should be compact and confident.

Avoid oversized “hero buttons”.

---

# 49. Tables

Tables should resemble Linear/Stripe quality.

Rules:

- subtle header
- spacious rows
- horizontal separators
- no vertical borders
- hover state
- aligned numeric values
- sticky header for long lists

Status badges should be compact.

---

# 50. Status System

Use consistent statuses:

```text
Listed        Neutral
Matching      Blue/Neutral
Matched       Green
Scheduled     Amber
In Transit    Blue
Processing    Neutral/Purple
Completed     Green
Rejected      Red
```

Keep colors muted.

Status should support scanning, not dominate the interface.

---

# 51. Notifications

Use in-app toast + notification center.

Examples:

```text
Waste lot matched with Green BioEnergy.

Facility accepted your request.

Pickup scheduled.

Waste picked up.

Waste delivered.

Processing completed.

Carbon impact calculated:
0.93 tCO₂e.
```

Toasts should be compact.

---

# 52. Loading States

Use skeleton loading.

Skeletons should preserve the final layout.

Avoid replacing important screens with:

> Loading...

for long periods.

Use lightweight transitions.

---

# 53. Empty States

Keep them editorial and useful.

Example:

> No active waste lots
>
> Start your first waste listing to begin a circular flow.
>
> **List waste →**

No giant decorative illustrations.

---

# 54. Error States

Errors should explain what happened and what the user can do.

Example:

> No compatible facility currently has enough capacity.
>
> Try a smaller waste lot or review alternative facilities.

Routing API:

> Route optimization is temporarily unavailable. Showing estimated distance instead.

Never allow external service failure to break the entire page.

---

# 55. Responsive Design

Desktop-first.

## Tablet

- collapse some navigation
- maintain two-column layouts when space permits

## Mobile

Collapse sidebar.

Dashboard order:

```text
KPI
↓
Map
↓
Activity
↓
Charts
```

Logistics:

```text
Details
↓
Map
↓
Status
```

Matching:

```text
Waste summary
↓
Recommended facility
↓
Alternatives
```

Do not simply shrink desktop UI. Recompose the layout.

---

# 56. Interaction and Motion

Use subtle animation only.

Preferred interaction duration:

**150–250ms**

Useful animations:

- drawer open/close
- page transitions
- hover states
- status transition
- KPI number update
- route appearance
- skeleton fade
- success state

Avoid:

- bouncing cards
- flashy particles
- continuous background animations
- exaggerated parallax
- excessive gradients

---

# 57. Dashboard Density

Avoid “dashboard soup”.

Do NOT create:

- 10 KPI cards
- 6 tiny charts
- 5 progress bars
- 3 pie charts
- multiple nested cards

on one viewport.

Target:

**2–4 meaningful sections per viewport.**

---

# 58. Card Usage

Not every section should be a card.

Use cards when information needs:

- grouping
- separation
- emphasis
- interaction

Prefer direct page sections for:

- headings
- tables
- forms
- simple data rows

Avoid:

```text
card
  → card
      → card
          → button
```

---

# 59. Data Hierarchy

For every data block, decide:

1. What should the user notice first?
2. What supports that metric?
3. What can be secondary?

Example:

```text
0.93 tCO₂e
Net estimated benefit

Landfill avoided
Carbon stored
Transport
Processing
```

Not:

```text
four equally styled numbers
```

---

# 60. Accessibility

Maintain:

- sufficient text contrast
- clear focus states
- keyboard navigability
- semantic headings
- accessible form labels
- meaningful button labels
- non-color-only status indication

Do not rely exclusively on color to communicate status.

---

# 61. Frontend Component Quality

Create reusable UI components for:

- Button
- Input
- Select
- Badge
- Card
- KPI
- Modal
- Drawer
- Toast
- Table
- Timeline
- Map
- Chart
- Empty state
- Skeleton
- Dropdown

All components should follow the same design tokens.

---

# 62. Maps

Use Leaflet + OpenStreetMap.

Maps must:

- be responsive
- support markers
- support routes
- support popups
- support filtering
- have graceful fallback behavior

The map should look integrated with the product, not like an unrelated embedded map.

---

# 63. Map Visual Hierarchy

Map controls should be minimal.

Include only useful controls such as:

- zoom
- layer/filter
- search if needed

Do not cover the map with excessive floating controls.

---

# 64. Demo Experience

The app must be visually optimized for a **3–5 minute hackathon demo**.

The core visual story should be:

```text
1 ton food waste
        ↓
CarbonCycle analyzes
        ↓
Best facility: 94%
        ↓
Route generated
        ↓
Waste collected
        ↓
Converted to biogas
        ↓
0.93 tCO₂e estimated benefit
        ↓
Municipality dashboard updates
```

The interface should make these state changes visually obvious.

---

# 65. Demo Mode UI

Provide:

**Start Demo**

This can load a deterministic seeded scenario.

The demo should not require manual database editing.

Suggested demonstration:

```text
Food Market
1,000 kg Food Waste

↓

Biogas suitability
92%

↓

Green BioEnergy
94% match

↓

14.2 km optimized route

↓

Scheduled
→ En Route
→ Picked Up
→ Delivered

↓

245 m³ biogas

↓

0.93 tCO₂e
estimated benefit
```

---

# 66. Mobile Bottom Navigation

For mobile, use a compact bottom navigation for the most common actions:

```text
Home
Waste
Map
Carbon
More
```

Do not attempt to display the entire desktop sidebar.

---

# 67. Brand Treatment

The CarbonCycle brand should be simple.

Logo direction:

- geometric
- wordmark-focused
- subtle circular/flow concept
- no literal leaf icon required

A possible visual concept is a subtle circular flow mark representing:

```text
Waste → Conversion → Carbon → Cycle
```

Do not make the logo overly illustrative.

---

# 68. Illustration Policy

Prefer:

- UI visualizations
- diagrams
- map data
- product screenshots
- abstract geometry

Avoid:

- stock photos
- generic sustainability illustrations
- smiling people in hard hats
- giant forests
- cartoon recycling bins

---

# 69. Content Tone

Use copy that is:

- direct
- calm
- factual
- concise
- confident

Prefer:

> 8,420 tons diverted from landfill

over:

> 🌱 Amazing! You're saving the planet!

Prefer:

> Estimated CO₂e benefit

over:

> Huge carbon savings!

The voice should match serious B2B software.

---

# 70. Economic Metrics

Economic value should be presented with the same restraint as environmental metrics.

Example:

```text
Estimated ecosystem value

₹2.25L

Material value       ₹1.20L
Avoided disposal     ₹0.80L
Processing value     ₹0.60L
Transport            -₹0.35L
```

Label monetary values as **estimated** where appropriate.

---

# 71. Carbon Transparency

Every carbon result should expose:

- quantity
- emission factors
- avoided landfill component
- stored carbon component
- transportation emissions
- processing emissions
- net result

The goal is to communicate:

**transparent estimate**, not black-box AI.

---

# 72. Product-Level Visual Narrative

CarbonCycle should have three dominant visual stories:

### Story 1 — Network

```text
Where is waste?
Where are facilities?
How does waste move?
```

Represent through maps and routes.

### Story 2 — Operations

```text
What is the current state of each Waste Lot?
```

Represent through timelines, statuses and queues.

### Story 3 — Impact

```text
What environmental/economic result did the flow create?
```

Represent through CO₂e metrics, charts and impact records.

Every major page should reinforce one or more of these stories.

---

# 73. Do Not Make the Product Look Like an ESG Reporting Tool

CarbonCycle is not primarily:

- emissions reporting software
- corporate ESG compliance software
- generic sustainability dashboard

It is primarily:

**a circular waste network and operations platform with carbon accounting.**

Carbon reporting should support the operational workflow rather than replace it.

---

# 74. Do Not Make the Product Look Like a Waste Marketplace

CarbonCycle is also more than:

- waste classifieds
- facility directory
- disposal listing

The differentiator is:

```text
Waste Supply
+
Facility Matching
+
Logistics
+
Conversion Tracking
+
Carbon Accounting
```

The UI must communicate this integrated system.

---

# 75. Do Not Overuse Green

This is one of the most important design constraints.

Green should be a signal.

Examples:

```text
Primary CTA                 green
Completed status            green
Positive carbon contribution green
Active sustainable flow     green
```

Everything else should generally remain neutral.

---

# 76. Visual Quality Benchmark

Before considering a page complete, ask:

- Does it look like modern SaaS?
- Is there one clear primary action?
- Is there one dominant visual element?
- Can a user understand the page in 3 seconds?
- Are secondary details visually subordinate?
- Is green being used intentionally?
- Are there unnecessary cards?
- Are there unnecessary icons?
- Does the page communicate CarbonCycle's circular workflow?
- Does the page look polished without decoration?

---

# 77. Engineering/Design Integration

Design implementation should use shared tokens.

Centralize:

```text
colors
spacing
radius
typography
shadows
breakpoints
transitions
```

Do not hard-code slightly different versions of the same style across pages.

---

# 78. Final Product Feel

The final CarbonCycle interface should feel approximately like:

```text
Stripe
   +
Linear
   +
Vercel
   +
Modern logistics software
   +
Climate/carbon analytics
   +
GIS
```

but with a distinct CarbonCycle identity.

It should be:

**clean enough to feel premium, operational enough to feel useful, and data-rich enough to feel credible.**

---

# 79. Final Do/Don't Summary

## DO

- Use whitespace
- Use strong typography
- Use subtle borders
- Use restrained green
- Make the map important
- Make Waste Lot lifecycle visual
- Make matching explainable
- Make carbon calculations transparent
- Use clean charts
- Use consistent Lucide icons
- Build responsive layouts
- Use polished loading/empty/error states
- Prioritize the end-to-end workflow

## DON'T

- Use excessive green
- Use generic eco illustrations
- Use stock sustainability imagery
- Use emoji
- Use huge gradients
- Use excessive glassmorphism
- Use giant rounded cards
- Use dozens of tiny charts
- Hide the important map below charts
- Turn every section into a card
- Pretend estimated carbon numbers are certified
- Add fake AI features purely for marketing

---

# 80. Final Priority Order

When making design decisions, prioritize in this exact order:

1. **Overall visual consistency**
2. **Dashboard quality**
3. **Network map**
4. **Waste lifecycle**
5. **Facility matching**
6. **Logistics/route interface**
7. **Carbon impact visualization**
8. **Analytics**
9. **Landing page**
10. **Secondary/admin screens**

If there is a conflict between adding a feature and polishing the core experience, polish the core experience.

---

# 81. Final Implementation Instruction

Implement CarbonCycle using this design specification together with the CarbonCycle PRD.

The PRD defines **what the product does**.

This document defines **how the product should look and feel**.

Do not change the core product workflow simply to fit a visual template.

The central experience must remain:

**Waste → Match → Collect → Convert → Measure → Impact**

The final application should feel like a polished, credible, startup-grade climate-tech product that could be presented to municipalities, waste operators, investors, and hackathon judges.
