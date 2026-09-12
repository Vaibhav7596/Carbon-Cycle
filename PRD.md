# CarbonCycle — Product Requirements Document

**Version:** 1.0  
**Status:** Hackathon MVP  
**Product:** CarbonCycle — Waste-to-Carbon Decision & Traceability Platform

---

## 1. Product Overview

CarbonCycle is a web platform that helps waste generators determine the best circular-carbon pathway for their waste.

Instead of treating waste as something that simply needs to be disposed of, CarbonCycle evaluates a waste batch and helps determine:

1. What conversion pathway is most suitable.
2. Which facility is the best destination.
3. How the waste should be transported.
4. What indicative carbon impact the conversion can create.
5. What economic value may be generated.
6. How the waste batch can be tracked from source to conversion.
7. How the resulting impact can be summarized in a digital report.

### Core product flow

**Waste → Fingerprint → Pathway Recommendation → Facility Match → Logistics → Conversion → Carbon & Economic Impact → Traceability → Report**

---

## 2. Problem

Organic and industrial waste with potential for conversion into biochar, biogas, or other carbon-negative materials can end up in landfills or otherwise lose its potential value.

The problem is not only waste disposal. A useful circular-carbon workflow requires coordination between:

- Waste generators
- Conversion facilities
- Logistics/collection
- Municipalities and other stakeholders

The platform must make the decision process understandable and measurable rather than merely displaying a list of facilities.

---

## 3. Product Vision

> **Turn every suitable waste batch into an optimized circular-carbon decision.**

CarbonCycle should answer:

> **“Given this waste, what is the best thing to do with it, where should it go, how should it get there, and what carbon and economic value can it create?”**

The product should feel like a **decision engine**, not simply a marketplace or a carbon calculator.

---

## 4. Target Users

### Primary User — Waste Generator

Examples:

- Farms
- Food businesses
- Food-processing industries
- Industrial waste generators
- Municipal waste sources

Primary need:

> Find the most suitable destination and conversion pathway for available waste while understanding expected value and environmental impact.

### Secondary User — Conversion Facility

Examples:

- Biochar facilities
- Biogas plants
- Other suitable conversion facilities

Primary need:

> Discover suitable waste supply and manage incoming waste batches.

### Supporting Users

- Municipalities
- Logistics/collection partners

For the hackathon MVP, these roles do not need fully independent product experiences. The prototype may use a simplified shared/admin-style environment where necessary.

---

## 5. Core Product Concept

### 5.1 Waste Fingerprint

Every waste batch should be represented by a structured profile.

Minimum attributes:

- Waste type
- Quantity
- Location
- Availability
- Moisture level where relevant

The system may use additional attributes when useful, such as:

- Organic fraction
- Contamination level
- Collection window
- Expected price/value

The waste fingerprint is the input to the decision engine.

---

## 6. Circular Decision Engine

The most important product capability is recommending a suitable conversion pathway and facility.

The engine evaluates factors such as:

- Waste compatibility
- Facility capability
- Facility capacity
- Distance
- Logistics requirements
- Indicative carbon benefit
- Estimated economic value

### Example

Input:

```text
Waste Type: Agricultural Residue
Quantity: 10 tonnes
Moisture: 15%
Location: Gandhinagar
Availability: Today
```

Possible outputs:

```text
Recommended Pathway: Biochar

Recommended Facility: GreenBio Facility

Match Score: 94%

Reason:
- High waste compatibility
- Capacity available
- Short transport distance
- Strong indicative carbon benefit
- Attractive estimated value
```

The recommendation must be explainable. Do not present a mysterious “AI score” without showing why the system selected the option.

---

## 7. Facility Matching

Facilities contain:

- Facility name
- Facility type
- Location
- Accepted waste types
- Processing capacity
- Available capacity
- Conversion pathway

The system should filter incompatible facilities first.

Compatible facilities are then ranked using a transparent scoring model.

### Initial scoring model

```text
Match Score =
Compatibility × 40%
+ Distance × 25%
+ Capacity × 20%
+ Carbon Benefit × 15%
```

The exact weights are configurable implementation parameters and may be refined during development.

The score exists to demonstrate intelligent decision-making; it is not intended to represent a certified industrial optimization model.

---

## 8. Conversion Pathway Recommendation

The MVP should support a small, understandable set of pathways.

Examples:

| Waste Type | Candidate Pathway |
|---|---|
| Agricultural residue | Biochar |
| Food waste | Biogas |
| Animal waste | Biogas |
| Wood/biomass waste | Biochar |
| Organic municipal waste | Biogas / other suitable pathway |

For the hackathon MVP, deterministic/rule-based recommendations are acceptable.

The system should describe this as a **Smart Waste-to-Conversion Recommendation Engine**, not claim that a machine-learning model exists when one does not.

---

## 9. Logistics & Route Visualization

Once a facility is selected, CarbonCycle should visualize the movement of waste.

The map should show:

- Waste source
- Selected facility
- Route
- Distance
- Estimated transport time where available
- Collection/truck representation where useful

### Primary MVP case

```text
Waste Source
     ↓
Selected Facility
```

### Extended case

If time permits:

```text
Farm A
   ↓
Restaurant B
   ↓
Food Facility C
   ↓
Conversion Facility
```

A simple route/nearest-neighbor approach is sufficient for the hackathon MVP. Do not spend excessive development time building a mathematically sophisticated vehicle-routing system unless the core workflow is already reliable.

---

## 10. Carbon Intelligence

CarbonCycle must separate different components of environmental impact.

The MVP should display:

- Waste diverted from landfill
- Indicative landfill emissions avoided
- Indicative carbon stored/sequestered through conversion
- Transport emissions
- Processing emissions where modeled
- Indicative net climate impact

### Conceptual calculation

```text
Indicative Net Climate Impact
=
Landfill Emissions Avoided
+ Carbon Stored
- Transport Emissions
- Processing Emissions
```

Not every term must be implemented in the first build if reliable data is unavailable.

### Important credibility requirement

The prototype must clearly communicate that demo emission factors are **indicative/default factors** and are not a certified carbon-credit methodology.

Do not represent prototype calculations as verified carbon credits or certified sequestration.

---

## 11. Economic Value

Where possible, CarbonCycle should show an indicative economic outcome alongside carbon impact.

Possible inputs:

- Waste value
- Processing value
- Estimated transport cost
- Potential carbon incentive/revenue

Example:

```text
Estimated Waste Value: ₹5,000
Estimated Carbon/Impact Value: ₹3,500
Estimated Transport Cost: -₹1,000

Indicative Net Value: ₹7,500
```

These values are prototype estimates and should be labeled accordingly.

---

## 12. Traceability

Every waste batch receives a unique identifier.

Example:

```text
W2C-2026-00125
```

The platform should provide a visible journey:

```text
Generated
   ↓
Pickup Requested
   ↓
Collected
   ↓
Transporting
   ↓
Received
   ↓
Processed
   ↓
Impact Recorded
```

This creates an auditable-looking digital trail for the prototype.

The system should not claim legal, regulatory, or certified chain-of-custody status unless such verification actually exists.

---

## 13. Digital Impact Report

At the end of a completed journey, the user should be able to view a concise impact report.

Example:

```text
CARBONCYCLE IMPACT REPORT

Batch ID: W2C-2026-00125

Waste Diverted: 10 tonnes
Conversion: Biochar

Landfill Emissions Avoided: 2.5 tCO₂e
Carbon Stored: 4.0 tCO₂e
Transport Emissions: 0.5 tCO₂e

Indicative Net Climate Impact:
6.0 tCO₂e

Status:
Impact Recorded
```

The report is an informational prototype artifact, not a certified carbon-credit certificate.

---

## 14. Primary MVP User Journey

This is the single most important workflow for the hackathon demo.

### Step 1 — Add Waste

User enters:

- Waste type
- Quantity
- Location
- Availability
- Relevant waste characteristics

### Step 2 — Analyze Waste

CarbonCycle creates the waste fingerprint.

### Step 3 — Recommend Pathways

The system presents viable conversion pathways.

### Step 4 — Compare Facilities

Compatible facilities are ranked and explained.

### Step 5 — Select/Confirm Facility

The user chooses the recommended facility or another compatible option.

### Step 6 — Visualize Logistics

The system displays the source-to-facility route.

### Step 7 — Track Journey

The waste batch moves through lifecycle states.

### Step 8 — Calculate Impact

Carbon and economic estimates are displayed.

### Step 9 — View Report

The completed batch has a traceable impact summary.

---

## 15. Core Screens

The MVP should prioritize the following screens.

### 1. Landing / Product Introduction

Purpose:

- Explain the problem
- Explain CarbonCycle
- Show the core workflow
- Provide entry into the application

### 2. Dashboard

Show:

- Waste listed
- Waste diverted
- Carbon impact
- Estimated value
- Active/completed batches
- Important recent activity

### 3. Add Waste

The primary data-entry workflow.

### 4. Waste Intelligence / Recommendations

Show:

- Waste fingerprint
- Recommended pathways
- Reasoning
- Estimated impact/value

### 5. Facility Matching

Show:

- Facility options
- Compatibility
- Distance
- Capacity
- Match score
- Estimated impact/value

### 6. Map / Logistics

Show:

- Source
- Facility
- Route
- Distance
- Logistics information

### 7. Batch Traceability / Impact

Show:

- Batch ID
- Journey status
- Carbon breakdown
- Economic outcome
- Final impact report

These screens may be combined where doing so creates a better demo experience.

---

## 16. MVP Scope

### Must Have

- Waste registration
- Waste fingerprint
- Demo facility dataset
- Conversion pathway recommendation
- Facility compatibility filtering
- Facility ranking/match score
- Interactive map
- Source-to-facility route visualization
- Waste journey status tracking
- Carbon impact calculation
- Basic economic estimate
- Batch ID
- Impact report
- Responsive, polished UI

### Should Have

- Multiple facility comparison
- What-if pathway/facility comparison
- Route distance and transport emissions
- QR-based batch/report access
- Basic analytics

### Could Have

- Multiple pickup optimization
- Logistics partner role
- Municipality-specific dashboard
- More advanced pathway modeling
- PDF/exportable reports
- Real-time notifications

### Explicitly Out of Scope for MVP

- Real payment processing
- Real carbon-credit issuance
- Legal certification
- Full enterprise authentication/authorization
- Production-grade marketplace contracts
- Complex AI/ML models without training data
- Sophisticated fleet-management system
- Full regulatory compliance workflow
- Blockchain solely for marketing purposes
- Excessive admin functionality
- Features that do not strengthen the core waste-to-carbon workflow

---

## 17. Product Principles

### 1. Decision over decoration

Every major screen should help the user make or understand a decision.

### 2. Explainability

Recommendations should show why they were made.

### 3. Measurable impact

Environmental impact should be represented using visible calculations and assumptions.

### 4. Traceability

A waste batch should have a clear journey from source to conversion.

### 5. Real-world credibility

Do not exaggerate prototype calculations or claim certification that does not exist.

### 6. Demo-first architecture

The most important end-to-end workflow must work reliably before secondary features are added.

### 7. Visual clarity

Maps, comparisons, timelines, and impact metrics should make the concept understandable within seconds.

---

## 18. Demo Data Strategy

The hackathon MVP may use seeded/demo data for:

- Waste generators
- Facilities
- Facility capacities
- Waste types
- Conversion factors
- Economic factors
- Routes

The demo dataset should be realistic enough to demonstrate the system but must be clearly distinguishable from verified production data where appropriate.

A strong default demo scenario is:

```text
Generator:
Farm / agricultural source

Waste:
10 tonnes agricultural residue

Location:
Gandhinagar region

Primary candidate:
Biochar facility

Result:
Best facility selected based on compatibility,
distance, capacity, and indicative impact.

Output:
Route + carbon impact + estimated value +
traceable batch report
```

---

## 19. Success Criteria for the Hackathon MVP

The MVP succeeds if a judge can understand the product without a long explanation and watch one waste batch move through the complete workflow.

Within the demo, the team should be able to show:

1. A waste batch being created.
2. The system understanding its characteristics.
3. Multiple possible pathways/facilities being evaluated.
4. A recommended option with an explainable score.
5. A route being displayed on a map.
6. The waste moving through traceability states.
7. Carbon impact being calculated with visible components.
8. Economic value being displayed.
9. A final impact report being produced.

---

## 20. Definition of Done

The core MVP is considered complete when:

- The application starts reliably.
- The primary workflow can be completed without manual database editing.
- Waste can be created through the UI.
- Matching produces deterministic, understandable results.
- The map displays the relevant locations and route.
- A batch has a persistent ID and lifecycle state.
- Carbon calculations are reproducible from visible inputs.
- Assumptions/default factors are visible.
- The final report reflects the selected waste batch.
- The application is responsive and visually polished.
- The demo can be reset/replayed quickly.
- No broken buttons, dead-end screens, or placeholder functionality remain in the primary workflow.

---

## 21. Non-Functional Requirements

### Performance

The primary workflow should feel immediate during the demo.

### Reliability

The application must tolerate repeated demo runs without corrupting state.

### Usability

A first-time judge should understand the interface quickly.

### Responsiveness

The application should work well on the laptop/browser setup used for judging.

### Visual quality

The interface should feel like a credible environmental technology product rather than a generic CRUD dashboard.

---

## 22. Technical Direction

The PRD intentionally does not prescribe the complete implementation architecture.

The implementation should support:

- Modern web frontend
- API/backend layer
- Persistent or seeded data
- GIS/map visualization
- Deterministic matching logic
- Carbon calculation module
- Traceability state machine
- Report generation

The exact framework, folder structure, database schema, API contracts, and deployment architecture will be defined in separate technical specification documents.

---

## 23. Final Product Definition

CarbonCycle is not merely:

- a waste listing marketplace,
- a facility directory,
- a route planner,
- or a carbon calculator.

It is a **circular-carbon decision and traceability platform**.

Its core promise is:

> **Give us a waste batch. CarbonCycle determines the most suitable circular pathway, finds the right destination, visualizes how it should move, and shows the carbon and economic value created along the way.**
