# Aarambhx Technology — Testing Infrastructure (TEST_INFRA.md)

## 1. Overview & Architectural Philosophy

The **Aarambhx Technology E2E Test Suite** provides exhaustive, opaque-box, multi-tier verification for the entire modern SaaS corporate platform (`d:\techboy-sol-web`).

### Core Design Principles
- **Zero-Dependency Standalone Runtime**: Built using native Node.js standard libraries (`http`, `fs`, `path`, `assert`). No heavy browser automation or `npm install` overhead required to run complete structural, layout, theming, contract, and workflow tests.
- **4-Tier Testing Hierarchy**: Organizes verification into (1) Feature Coverage across all 49 specification features, (2) Boundary & Corner Cases, (3) Cross-Feature Interactions & Pairwise Combinations, and (4) Real-World End-to-End Workload Scenarios.
- **Opaque-Box Verification**: Validates visual tokens, responsive geometry, DOM elements, interface contracts (`styles.css`, `main.js`, `config.js`), client-side validation logic, and live HTTP server serving on `http://localhost:3000/`.

---

## 2. Directory Structure & Test Suite Layout

```
d:\techboy-sol-web\
├── package.json                   # NPM script triggers ("npm test", "npm start")
├── server.js                      # Static HTTP Server (port 3000)
├── index.html                     # Primary HTML5 SaaS Document
├── styles.css                     # Design System & Responsive Tokens
├── main.js                        # ES6 Interactivity Engine
├── config.js                      # Central Configuration (TBS_CONFIG)
├── TEST_INFRA.md                  # Test Suite Architecture & Infrastructure Docs
├── TEST_READY.md                  # Test Readiness Matrix & Execution Report
└── tests\
    ├── test-utils.js              # Shared Utilities (DOMParserLite, CSSAnalyzer, Assert, HTTP Fetcher)
    ├── tier1-features.test.js     # Tier 1: 49 Features Coverage (>= 5 assertions per feature)
    ├── tier2-boundaries.test.js   # Tier 2: Boundary, Viewport & Validation Stress Tests
    ├── tier3-interactions.test.js # Tier 3: Pairwise & Cross-Feature Integration Tests
    ├── tier4-scenarios.test.js    # Tier 4: Real-World User Workload Scenarios
    └── run-all-tests.js           # Master Orchestrator & CLI Runner
```

---

## 3. Test Tier Breakdown & Methodology

### Tier 1: Feature Coverage (`tests/tier1-features.test.js`)
Exhaustively validates each of the **49 features** defined in `PROJECT.md` and `ORIGINAL_REQUEST.md`. Every feature contains at least 5 strict assertions verifying existence, styling, accessibility attributes, content fidelity, and behavioral hooks:
- **Navigation (F01–F07)**: Floating Oval Pill Navbar (`border-radius: 9999px`, `top: 16px`, `backdrop-filter: blur(24px)`), Logo badge, Desktop active links, Multi-theme switcher, Header CTA, Mobile glass drawer, CSS variables.
- **Hero & Trust (F08–F15)**: 2-column SaaS hero, Dynamic word rotator (`#wordRotator`), Action CTAs, Capability badges, SaaS command center canvas, Dual division tiles, Floating decorative glass badge, Trust metrics strip (100%, 2, 24/7, End-to-End).
- **Service Discovery & Bento Architecture (F16–F28)**: 10 category discovery cards, About division cards, 7 Software Bento cards (Web dev, Portfolio, Custom software, Featured Excel automation, UI/UX, QA, Maintenance), 4 Hardware Bento cards (Laptop repair, Desktop repair, Featured Custom PC, Upgrades).
- **Infrastructure & Student Lab (F29–F35)**: 5 Networking cards, IoT Architecture Hub, 3 Student project streams, 7 Portfolio filter tabs, 6 Portfolio showcase cards, 6-Step student support roadmap, 7-Step Software-to-Hardware pipeline.
- **Audience, Process, Values (F36–F38)**: 8 Audience segment cards, 8 Value pillar cards, 7-Step work methodology timeline.
- **Diagnostic, FAQ, Contact, Footer (F39–F45)**: 8 Diagnostic problem chips, 9 FAQ accordion items, Frosted glass contact cards (+91 63647 68498, emails, Tumakuru location), Consultation form validation, WhatsApp dispatch URL builder, 5-Column footer, Floating WhatsApp button.
- **Engine, Animation, Server & Tests (F46–F49)**: Zero-overlap responsive engine (320px to 4K), GSAP animations & fallbacks, Local server architecture, E2E test tracking.

### Tier 2: Boundary & Corner Cases (`tests/tier2-boundaries.test.js`)
Tests edge cases and boundary parameters:
- **B01**: 320px–360px ultra-compact mobile viewport scaling and zero-overflow layout.
- **B02**: 1920px+ 4K ultra-wide viewport containment and horizontal centering.
- **B03**: Empty and whitespace-only required form fields validation.
- **B04**: Invalid phone numbers (alphabetic characters, <7 digits, >15 digits, disallowed symbols).
- **B05**: Invalid email formats (missing `@`, missing domain, spaces) vs valid optional emails.
- **B06**: Rapid theme toggling (100+ cycles) and storage state consistency.
- **B07**: Special characters, quotes, HTML tags, and Unicode emojis in inputs and WhatsApp URL encoding.
- **B08**: ESC key drawer dismissal and keyboard accessibility focus management.
- **B09**: Reduced motion accessibility (`prefers-reduced-motion: reduce`) in CSS & JS.

### Tier 3: Cross-Feature Interactions & Pairwise Combinations (`tests/tier3-interactions.test.js`)
Tests multi-module interactions and state cascades:
- **I01**: Theme Toggle + Consultation Form Styling Integration.
- **I02**: Mobile Drawer Open + Anchor Navigation Cascade.
- **I03**: Diagnostic Problem Chip Click + Form Auto-Fill + WhatsApp Redirect.
- **I04**: Portfolio Filter Tabs + Dynamic Card Filtering.
- **I05**: FAQ Accordion Mutex & Sequential Toggles.
- **I06**: Service Discovery Cards Anchor Routing.
- **I07**: Floating WhatsApp CTA + Dynamic Config Sync.
- **I08**: Methodology Timeline + Software-Hardware Pipeline Multi-Domain Flow.

### Tier 4: Real-World Workload Scenarios (`tests/tier4-scenarios.test.js`)
Validates complete end-to-end customer journeys:
- **S01**: Final-Year Engineering Student IoT Project Consultation Journey.
- **S02**: Small Business Commercial Website & Billing CRM Inquiry Journey.
- **S03**: Urgent Laptop Repair & SSD Upgrade Customer Journey.
- **S04**: Small Office Structured LAN & Wi-Fi Network Setup Journey.

---

## 4. Execution Guide

### Running All Tests
```bash
# Using Node.js directly
node tests/run-all-tests.js

# Using NPM script
npm test
```

### Running Individual Tiers
```bash
# Run Tier 1 Feature Coverage
npm run test:t1

# Run Tier 2 Boundaries
npm run test:t2

# Run Tier 3 Interactions
npm run test:t3

# Run Tier 4 Scenarios
npm run test:t4
```

### Starting the Local Development Server
```bash
# Node server (port 3000)
npm start
# or: node server.js

# PowerShell server
powershell -ExecutionPolicy Bypass -File server.ps1
```

---

## 5. Verification & Continuous Integration

- **Pass Criteria**: 100% of test suites across all 4 tiers must pass with 0 errors.
- **Assertion Count**: Over 300 individual assertions verified per full test run.
- **Execution Time**: Less than 100ms on standard developer hardware.
