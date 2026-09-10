# Project: Aarambhx Technology SaaS Platform Redesign & Modernization

## Architecture
- **Tech Stack**: Vanilla Modern Web Stack (HTML5, CSS3 Custom Properties & Grid/Flexbox, ES6+ Modular JavaScript, Local Node.js / PowerShell Static Server).
- **Design Philosophy**: World-Class SaaS Aesthetic — Floating Oval/Pill Glassmorphic Navigation, Pristine Bento Grid Modular Layouts, High-Contrast Multi-Theme Engine (Light SaaS Default vs. Dark Navy Override), Fluid Clamp Typography Engine, and GSAP ScrollTrigger Micro-Animations with native fallbacks.
- **Data Flow & Configuration**: `config.js` (`TBS_CONFIG`) serves as the single source of truth for corporate credentials, contact data, service catalogs, and project definitions; `main.js` binds dynamic events, theme switching, diagnostic auto-population, and WhatsApp message construction; `styles.css` enforces design tokens and responsive zero-overlap geometry.

## Feature Inventory
| # | Feature | Category | Description | Milestone | Source |
|---|---------|----------|-------------|-----------|--------|
| 1 | Floating Oval Glassmorphic Header | Navigation | Pill-shaped navbar (~16px from top, max-width: 1120px, border-radius: 9999px, backdrop-filter: blur(24px)). | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Brand Logo Mark & Badge | Navigation | Vector lettermark logo with TB initials, dark slate container, and emerald circuit accent. | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Desktop Nav Links & Active Pill | Navigation | Streamlined nav items with sliding active pill highlight and smooth anchor scrolling. | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Multi-Theme Switcher | Theme Engine | Light SaaS (default) / Dark Navy switcher with Sun/Moon icon swap and localStorage persistence. | M1 | ORIGINAL_REQUEST §R3 |
| 5 | Header High-Converting CTA | Navigation | "Get Consultation" button in header routing directly to `#contact`. | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Mobile Glass Slide-Out Drawer | Navigation | Responsive glassmorphic drawer (< 1024px) with backdrop blur and touch-optimized nav items. | M1 | ORIGINAL_REQUEST §AC1 |
| 7 | Multi-Theme Design Tokens | Design System | Comprehensive CSS variables (`--bg-deep`, `--accent`, `--glass-*`, `--text-*`, `--shadow-*`). | M1 | ORIGINAL_REQUEST §R3 |
| 8 | High-Impact SaaS Hero Layout | Hero Section | 2-column SaaS layout with punchy copy, gradient headline, and fluid clamp typography. | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Dynamic Word Rotator | Hero Section | Animated value proposition headline word cycler without layout jitter. | M2 | Codebase Survey |
| 10 | Action CTA Strip | Hero Section | Dual/Triad action buttons: "Get a Free Consultation", "Explore Services", "Talk to Us". | M2 | ORIGINAL_REQUEST §R2 |
| 11 | Division Trust Badges | Hero Section | Verified capability badges: Software, Hardware, Networking, IoT, IT Support. | M2 | Codebase Survey |
| 12 | SaaS Command Center Micro-Widget | Hero Section | Interactive live dashboard canvas showcasing software preview & hardware telemetry tabs. | M2 | ORIGINAL_REQUEST §R2 |
| 13 | Live Division Tab Switcher | Micro-Widget | Interactive tabs toggling software code preview vs hardware diagnostic telemetry. | M2 | ORIGINAL_REQUEST §R2 |
| 14 | Floating Decorative Glass Badge | Hero Section | Floating frosted glass badge ("One-Stop Tech Partner") with gentle floating animation. | M2 | ORIGINAL_REQUEST §R2 |
| 15 | Trust Metrics Strip | Trust Stats | 4-column metric cards (100% Focused, 2 Divisions, 24/7 Support, End-to-End Delivery). | M2 | ORIGINAL_REQUEST §R2 |
| 16 | Quick Service Discovery Grid | Discovery | 10 clickable category cards routing to specific division sections. | M3 | Codebase Survey |
| 17 | Dual Division Overview Cards | Architecture | High-contrast overview cards for Software & Digital vs Hardware & Infrastructure. | M3 | ORIGINAL_REQUEST §R2 |
| 18 | Software Bento: Web Development | Software Bento | Full corporate & web application development service card with feature tags. | M3 | ORIGINAL_REQUEST §R2 |
| 19 | Software Bento: Personal Portfolios | Software Bento | Tailored developer/creator portfolio service card with custom domain setup. | M3 | ORIGINAL_REQUEST §R2 |
| 20 | Software Bento: Custom Software & CRM | Software Bento | Business automation, billing, and CRM development service card. | M3 | ORIGINAL_REQUEST §R2 |
| 21 | Software Bento: Excel Automation | Software Bento | Featured card with amber gradient border for advanced Excel/Office automation. | M3 | ORIGINAL_REQUEST §R2 |
| 22 | Software Bento: UI/UX Design | Software Bento | Modern SaaS UI/UX, wireframing, and design system creation card. | M3 | ORIGINAL_REQUEST §R2 |
| 23 | Software Bento: Software QA & Testing | Software Bento | Functional, usability, and pre-deployment testing service card. | M3 | ORIGINAL_REQUEST §R2 |
| 24 | Software Bento: Maintenance & Support | Software Bento | Ongoing maintenance, security patches, and performance tuning card. | M3 | ORIGINAL_REQUEST §R2 |
| 25 | Hardware Bento: Laptop Repair | Hardware Bento | Diagnosis, component servicing, thermal management card. | M3 | ORIGINAL_REQUEST §R2 |
| 26 | Hardware Bento: Desktop PC Repair | Hardware Bento | Power supply, motherboard, and system diagnostics card. | M3 | ORIGINAL_REQUEST §R2 |
| 27 | Hardware Bento: Custom PC Builds | Hardware Bento | Specialist featured card for gaming, workstation, and coding custom PCs. | M3 | ORIGINAL_REQUEST §R2 |
| 28 | Hardware Bento: Hardware Upgrades | Hardware Bento | RAM, NVMe SSD, and performance modernization card. | M3 | ORIGINAL_REQUEST §R2 |
| 29 | Networking Solutions Suite | Infrastructure | 5-card suite: Structured LAN, Cat6, Router setup, Wi-Fi optimization. | M3 | ORIGINAL_REQUEST §R2 |
| 30 | IoT & Smart Tech Architecture Hub | IoT & Smart Tech | Sensor arrays, ESP32/Raspberry Pi, MQTT/REST protocols, and cloud dashboards. | M3 | ORIGINAL_REQUEST §R2 |
| 31 | Final-Year Project Stream Showcase | Student Lab | 3 stream cards (Software, Hardware, IoT/Hybrid) with technical tags. | M4 | ORIGINAL_REQUEST §R2 |
| 32 | Filterable Project Portfolio Showcase | Student Lab | Interactive filter tabs (All, Software, Hardware, IoT, AI) with smooth transitions. | M4 | ORIGINAL_REQUEST §R2 |
| 33 | Interactive Project Detail Modal | Student Lab | Glassmorphic modal displaying architecture diagrams, BOM, and guidance request. | M4 | ORIGINAL_REQUEST §R2 |
| 34 | 6-Step Student Support Roadmap | Student Lab | 6-step roadmap (Idea -> Circuit -> Code -> Test -> Docs -> Viva Prep). | M4 | ORIGINAL_REQUEST §R2 |
| 35 | Software-to-Hardware Pipeline Flow | Process | 7-stage interactive visualization connecting sensors to cloud user interfaces. | M4 | Codebase Survey |
| 36 | "Who We Serve" Audience Grid | Audience | 8 audience segment cards with dedicated value propositions. | M4 | Codebase Survey |
| 37 | "Why Choose Us" Values Grid | Value Prop | 8 pillar cards emphasizing transparency, technical excellence, and budget value. | M4 | Codebase Survey |
| 38 | 7-Step Work Methodology | Process | Structured process timeline from consultation to post-delivery support. | M4 | Codebase Survey |
| 39 | Interactive Problem Diagnostic Bar | Diagnostic | 8 one-click interactive chips populating consultation form and auto-scrolling. | M5 | ORIGINAL_REQUEST §R2 |
| 40 | Interactive FAQ Accordion | FAQ | 9 accessible accordion items with smooth expansion and ARIA controls. | M5 | Codebase Survey |
| 41 | Frosted Glass Contact Cards | Contact | Direct dial (+91 63647 68498), WhatsApp, emails, and Tumakuru location badge. | M5 | ORIGINAL_REQUEST §R2, AC3 |
| 42 | Multi-Field Consultation Form | Consultation | Comprehensive inquiry form with real-time validation for all required fields. | M5 | ORIGINAL_REQUEST §AC3 |
| 43 | WhatsApp Consultation Dispatcher | Consultation | Encodes form payload into WhatsApp URL and redirects to 916364768498 with success alert. | M5 | ORIGINAL_REQUEST §AC3 |
| 44 | 5-Column Corporate Footer | Footer | Brand mark, social links, quick service links, Tumakuru badge, and legal info. | M5 | Codebase Survey |
| 45 | Floating WhatsApp Action Widget | Conversion | Fixed floating WhatsApp button with pulse animation and tooltip. | M5 | Codebase Survey |
| 46 | Zero-Overlap Responsive Engine | Quality & Layout | Fluid clamp typography, flexible bento grids, and zero collisions from 320px to 4K. | M6 | ORIGINAL_REQUEST §R3, AC2 |
| 47 | GSAP Micro-Animations & ScrollTriggers | Animations | Staggered reveal animations with automatic IntersectionObserver fallback. | M6 | ORIGINAL_REQUEST §R3 |
| 48 | Local Server & Zero Console Errors | Infrastructure | Local Node.js HTTP server on http://localhost:3000 with 100% clean console logs. | M6 | ORIGINAL_REQUEST §AC3 |
| 49 | 100% E2E Test Suite & Adversarial Hardening | E2E Testing | Full test execution across Tiers 1-5 verifying all requirements and edge cases. | M6 | Orchestrator Protocol |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Design System, Theme Engine & Floating Oval Glassmorphic Header | Design tokens, Light SaaS / Dark Navy theme engine, floating oval pill navbar, mobile glass drawer, and theme persistence. | none | DONE |
| M2 | Hero Section, Interactive SaaS Dashboard Micro-widget & Trust Strip | High-impact SaaS hero grid, word rotator, interactive division dashboard (live software/hardware tabs), floating glass badge, and trust metrics strip. | M1 | DONE |
| M3 | High-Contrast Bento Grid Architecture (Software & Hardware Divisions) | 12-column bento grids for Software & Digital Solutions and Hardware & IT Infrastructure, specialist featured cards, networking, and IoT hubs. | M1 | DONE |
| M4 | Student Projects & Innovation Lab Interactive Showcase | Project filter tabs, interactive project cards, detail modals, 6-step roadmap, software-to-hardware pipeline, and audience/methodology grids. | M1, M3 | DONE |
| M5 | Diagnostic Bar, Contact Hub & WhatsApp Consultation Dispatch Engine | 8 interactive diagnostic problem chips, frosted glass contact cards (+91 63647 68498, emails, Tumakuru badge), consultation form validation, WhatsApp dispatch URL builder, FAQ accordion, footer, and floating WhatsApp widget. | M1, M2 | DONE |
| M6 | Integration, Zero-Overlap Polish, 100% E2E Test Pass & Adversarial Hardening | End-to-end integration, fluid clamp typography audit, multi-viewport responsive testing (320px-4K), 100% E2E test suite pass (Tiers 1-4), Tier 5 adversarial testing, and forensic audit. | M1, M2, M3, M4, M5 | DONE |

## Interface Contracts
### Styling & Theming Contract (`styles.css` ↔ All Components)
- Theme switching sets `data-theme="light"` or `data-theme="dark"` on `document.body`.
- All background, text, border, glass, shadow, and accent colors MUST use CSS custom properties (`var(--bg-deep)`, `var(--text-primary)`, `var(--glass-bg)`, `var(--accent)`, etc.).
- Header container MUST have selector `#navbar` / `.floating-navbar` with `position: fixed`, `top: 16px`, `left: 50%`, `transform: translateX(-50%)`, `border-radius: 9999px`, `backdrop-filter: blur(24px)`.

### Configuration Contract (`config.js` ↔ `main.js` / HTML)
- `TBS_CONFIG.company.name`: `"Aarambhx Technology"`
- `TBS_CONFIG.company.phone`: `"+91 63647 68498"` (raw: `"6364768498"`)
- `TBS_CONFIG.company.whatsapp`: `"916364768498"`
- `TBS_CONFIG.company.email`: `"lalithulalu@gmail.com"`
- `TBS_CONFIG.company.emailAlt`: `"lalithlalu.com@yahoo.com"`
- `TBS_CONFIG.company.location`: `"Tumakuru, Karnataka, India"`

### Interactivity & Form Contract (`main.js` ↔ `index.html`)
- Problem chips call `handleDiagnosticSelection(problemText, targetService, targetCustomerType)` or trigger `click` event populating `#description` and `#service`, scrolling to `#contact`.
- Consultation form `#consultationForm` validates required fields (`#fullName`, `#phone`, `#city`, `#customerType`, `#service`, `#description`), generates WhatsApp link with payload, opens WhatsApp, and shows `#formSuccess`.
- Interactive Dashboard micro-widget tabs `.dashboard-tab` toggle `.software-pane` and `.hardware-pane`.
- Project detail modals open on `.btn-view-project` click with escape key and backdrop click handlers.

## Code Layout
- `d:\techboy-sol-web\index.html`: Main HTML5 document structure, semantic sections, and modal containers.
- `d:\techboy-sol-web\styles.css`: Complete design system, theme definitions, component styles, bento grids, and media queries.
- `d:\techboy-sol-web\main.js`: Modular ES6 client-side interactions, theme manager, form validator, animations, and modal controllers.
- `d:\techboy-sol-web\config.js`: Single source of truth configuration (`TBS_CONFIG`).
- `d:\techboy-sol-web\server.js`: Static Node.js HTTP server for local hosting on port 3000.
- `d:\techboy-sol-web\assets\favicon.svg`: Brand logo SVG asset.
- `d:\techboy-sol-web\tests\`: Opaque-box E2E test suite and test runner scripts.
