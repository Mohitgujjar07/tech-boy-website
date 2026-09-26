/**
 * AarambhX Technology — Universal Data & Business Storage Engine v3.0
 * Handles Leads CRM, Projects, Academy Workshops, Certificates, Reels, Live Banner,
 * Invoices & Quotations, Testimonials & Reviews, Pricing Catalog, and Privacy Micro-Analytics.
 * Supports Cloud Firestore sync with seamless, resilient localStorage mirroring.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AarambhXStore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEYS = {
    INQUIRIES: 'ax_inquiries_db',
    PROJECTS: 'ax_projects_db',
    WORKSHOPS: 'ax_workshops_db',
    CERTIFICATES: 'ax_certificates_db',
    REELS: 'ax_reels_db',
    BANNER: 'ax_alert_banner',
    AUTH: 'ax_admin_session',
    INVOICES: 'ax_invoices_db',
    TESTIMONIALS: 'ax_testimonials_db',
    CATALOG: 'ax_catalog_db',
    ANALYTICS: 'ax_analytics_db',
    SETTINGS: 'ax_settings_db',
    AUDIT: 'ax_audit_trail',
    BLOG: 'ax_blog_posts_db'
  };

  // Default Passkey for Admin Access (can also be customized in Settings)
  const DEFAULT_ADMIN_PASSKEY = 'aarambhx2026';

  // Strict Dual Admin Email Whitelist (+ verified alias)
  const WHITELISTED_ADMINS = [
    'info@aarambhxtechnology.in',
    'lalithulalu@gmail.com',
    'mohitjgujjar7@mail.com',
    'mohitjgujjar7@gmail.com'
  ];

  // =========================================================================
  // SEED DATASETS
  // =========================================================================

  // Seed Data: Projects
  const SEED_PROJECTS = [
    {
      id: 'proj-1',
      title: 'Enterprise ERP & Inventory Cloud',
      category: 'Software Development',
      description: 'Custom React & Node.js ERP system for regional manufacturing plants in Tumakuru, automating billing, stock tracking, and supplier workflows.',
      image: 'assets/hero.webp',
      tags: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      liveUrl: 'https://aarambhx-technology.vercel.app',
      featured: true,
      createdAt: '2026-02-15'
    },
    {
      id: 'proj-2',
      title: 'Smart IoT Agricultural Rig',
      category: 'IoT & Robotics',
      description: 'Solar-powered automated drip irrigation and soil diagnostics rig powered by ESP32, LoRaWAN, and cloud telemetry dashboard.',
      image: 'assets/hero.jpg',
      tags: ['ESP32', 'LoRaWAN', 'C++', 'MQTT', 'Dashboard'],
      liveUrl: 'https://aarambhx-technology.vercel.app',
      featured: true,
      createdAt: '2026-03-01'
    },
    {
      id: 'proj-3',
      title: 'Gigabit Campus LAN & Wi-Fi 6',
      category: 'Networking & Infrastructure',
      description: 'Structured Cat6A cabling, VLAN segmentation, and enterprise Wi-Fi 6 AP network deployed across 3-floor educational institution.',
      image: 'assets/hero.webp',
      tags: ['Cisco', 'MikroTik', 'VLAN', 'Wi-Fi 6', 'Cat6A'],
      liveUrl: 'https://aarambhx-technology.vercel.app',
      featured: true,
      createdAt: '2026-03-10'
    }
  ];

  // Seed Data: Workshops
  const SEED_WORKSHOPS = [
    {
      id: 'ws-1',
      title: 'AI Demystified: Scratch to Neural Nets',
      track: 'Artificial Intelligence & ML',
      institution: 'SIT Tumakuru & Engineering Colleges',
      date: '2026-04-12',
      duration: '2 Days (16 Hours)',
      seatsTotal: 120,
      seatsEnrolled: 84,
      status: 'Open for Registration'
    },
    {
      id: 'ws-2',
      title: 'IoT Embedded Hardware & Robotics Rig',
      track: 'IoT & Hardware Systems',
      institution: 'Polytechnic & Diploma Institutes',
      date: '2026-04-26',
      duration: '1 Day Intensive',
      seatsTotal: 80,
      seatsEnrolled: 62,
      status: 'Open for Registration'
    },
    {
      id: 'ws-3',
      title: 'Defensive Cybersecurity & Network Hardening',
      track: 'Cybersecurity',
      institution: 'State Technical Universities',
      date: '2026-05-10',
      duration: '2 Days Hands-On',
      seatsTotal: 100,
      seatsEnrolled: 35,
      status: 'Upcoming'
    }
  ];

  // Seed Data: Certificates
  const SEED_CERTIFICATES = [
    {
      id: 'AX-2026-AIML-0101',
      studentName: 'Priya Narayana',
      institution: 'SIT Tumakuru',
      track: 'Artificial Intelligence & Machine Learning',
      issueDate: '2026-03-15',
      grade: 'Distinction (A+)',
      status: 'Verified'
    },
    {
      id: 'AX-2026-IOT-0205',
      studentName: 'Karthik Gowda',
      institution: 'Aryabharathi Polytechnic',
      track: 'IoT & Robotics Engineering Rig',
      issueDate: '2026-03-18',
      grade: 'First Class with Honors',
      status: 'Verified'
    }
  ];

  // Seed Data: Inquiries
  const SEED_INQUIRIES = [
    {
      id: 'lead-101',
      name: 'Dr. Suresh Babu',
      phone: '9845123456',
      email: 'suresh.babu@sit.ac.in',
      type: 'Academy Workshop',
      serviceOrTrack: 'AI Demystified Workshop',
      details: 'Interested in hosting a 2-day hands-on AI & Robotics workshop for 120 6th-semester CS students.',
      status: 'Contacted',
      createdAt: '2026-03-18T10:30:00.000Z'
    },
    {
      id: 'lead-102',
      name: 'Manjunath Swamy',
      phone: '9481234567',
      email: 'manju.tech@gmail.com',
      type: 'General Consultation',
      serviceOrTrack: 'Laptop / PC Repair',
      details: 'Custom gaming PC build consultation with RTX 4070 and liquid cooling rig.',
      status: 'New',
      createdAt: '2026-03-19T08:15:00.000Z'
    }
  ];

  // Seed Data: Invoices & Quotations
  const SEED_INVOICES = [
    {
      id: 'inv-100',
      invoiceNumber: 'AT-2026-001',
      date: '2026-09-18',
      dueDate: '2026-09-25',
      paymentTerms: 'Net 7 Days',
      placeOfSupply: 'Karnataka (KA)',
      clientName: 'Client / Company Name',
      clientPhone: '7676690081',
      clientEmail: 'lalithlalu.com@yahoo.com',
      clientAddress: 'Address Line 1, Address Line 2, City, State - PIN',
      clientAddress1: 'Address Line 1',
      clientAddress2: 'Address Line 2',
      clientCityState: 'City, State - PIN',
      clientCountry: 'India',
      clientGst: '29ABCDE1234F1Z5',
      status: 'Paid',
      type: 'Invoice',
      items: [
        { desc: 'Website Development (Business Website)', qty: 1, rate: 15000, amount: 15000 },
        { desc: 'UI/UX Design', qty: 1, rate: 5000, amount: 5000 },
        { desc: 'Basic SEO Setup', qty: 1, rate: 3000, amount: 3000 },
        { desc: 'Maintenance (3 Months)', qty: 1, rate: 2000, amount: 2000 },
        { desc: 'Training (Aarambhx Academy)', qty: 1, rate: 5000, amount: 5000 }
      ],
      subtotal: 30000,
      discount: 0,
      taxRate: 18,
      taxAmount: 5400,
      total: 35400,
      notes: 'Thank you for choosing Aarambhx Technology! We appreciate your business and support.',
      createdAt: '2026-09-18T10:00:00.000Z'
    },
    {
      id: 'inv-101',
      invoiceNumber: 'AX-INV-2026-001',
      date: '2026-03-15',
      dueDate: '2026-03-25',
      paymentTerms: 'Net 10 Days',
      placeOfSupply: 'Karnataka (KA)',
      clientName: 'Siddaganga Institute of Technology',
      clientPhone: '9845123456',
      clientEmail: 'procurement@sit.ac.in',
      clientAddress: 'B.H. Road, Tumakuru, Karnataka 572103',
      clientAddress1: 'B.H. Road, Near SIT Main Gate',
      clientAddress2: 'Gandhi Nagar',
      clientCityState: 'Tumakuru, Karnataka - 572103',
      clientCountry: 'India',
      clientGst: '29AAACS1234F1Z5',
      status: 'Paid',
      type: 'Invoice',
      items: [
        { desc: 'Hands-on AI & Robotics Lab Rig (10 Starter Hardware Kits)', qty: 10, rate: 3500, amount: 35000 },
        { desc: '2-Day Campus Workshop Training & Certification (Batch of 120)', qty: 1, rate: 25000, amount: 25000 }
      ],
      subtotal: 60000,
      discount: 2000,
      taxRate: 18,
      taxAmount: 10440,
      total: 68440,
      notes: 'Thank you for partnering with AarambhX Technology for institutional skill acceleration.',
      createdAt: '2026-03-15T09:00:00.000Z'
    },
    {
      id: 'inv-102',
      invoiceNumber: 'AX-QT-2026-002',
      date: '2026-03-18',
      dueDate: '2026-03-28',
      clientName: 'Modern Diagnostics Center',
      clientPhone: '9481234567',
      clientEmail: 'billing@moderndiag.in',
      clientAddress: 'MG Road, Tumakuru, Karnataka 572101',
      clientAddress1: 'MG Road, Opp. District Hospital',
      clientAddress2: 'Gandhi Circle Commercial Complex',
      clientCityState: 'Tumakuru, Karnataka - 572101',
      clientCountry: 'India',
      clientGst: '29ABCDE9999M1Z8',
      paymentTerms: '50% Advance, 50% on Delivery',
      placeOfSupply: 'Karnataka (KA)',
      status: 'Quotation',
      type: 'Quotation',
      items: [
        { desc: 'High-Performance Reception Workstation (Intel i5 13th Gen, 16GB RAM, 512GB NVMe)', qty: 2, rate: 42000, amount: 84000 },
        { desc: 'Cat6 Structured Gigabit LAN Network & Setup (8 Nodes)', qty: 1, rate: 12500, amount: 12500 },
        { desc: 'Total Security 3-Year License Pack', qty: 2, rate: 1800, amount: 3600 }
      ],
      subtotal: 100100,
      discount: 3100,
      taxRate: 0,
      taxAmount: 0,
      total: 97000,
      notes: 'Quotation valid for 15 days. 50% advance upon project initiation.',
      createdAt: '2026-03-18T14:30:00.000Z'
    }
  ];

  // Seed Data: Testimonials & Reviews
  const SEED_TESTIMONIALS = [
    {
      id: 'testi-1',
      name: 'Dr. Ramesh K.',
      role: 'Head of Department (CSE)',
      organization: 'Engineering College, Tumakuru',
      rating: 5,
      content: 'AarambhX delivered an outstanding 2-day hands-on workshop on AI & Edge Computing. The students built working neural classifiers on physical devices. Exceptional technical rigor!',
      date: '2026-03-12',
      approved: true
    },
    {
      id: 'testi-2',
      name: 'Pooja Hegde',
      role: 'Final Year Student (ECE)',
      organization: 'SIT Tumakuru',
      rating: 5,
      content: 'Got our final-year IoT project hardware engineered and calibrated by AarambhX Technology. Flawless sensor accuracy, clean PCB layout, and timely mentorship.',
      date: '2026-03-14',
      approved: true
    },
    {
      id: 'testi-3',
      name: 'Venkatesh Rao',
      role: 'Managing Director',
      organization: 'Rao Logistics & Distribution',
      rating: 5,
      content: 'They overhauled our entire office network and deployed custom inventory software. Server downtime dropped to zero and speed improved dramatically.',
      date: '2026-03-16',
      approved: true
    }
  ];

  // Seed Data: Pricing & Diagnostics Catalog
  const SEED_CATALOG = [
    {
      id: 'cat-1',
      title: 'SSD High-Speed Upgrade & OS Migration',
      category: 'Hardware & Repair',
      basePrice: 2499,
      turnaround: '2 - 4 Hours',
      description: 'Upgrade your sluggish laptop or PC with a blazing fast NVMe/SATA SSD with 100% data and OS cloned safely without data loss.',
      active: true
    },
    {
      id: 'cat-2',
      title: 'Custom Gaming & Creator Rig Build',
      category: 'Custom PC Builds',
      basePrice: 45000,
      turnaround: '1 - 2 Days',
      description: 'Precision-assembled gaming and AI workstations with thermal testing, cable management, and stress benchmarks.',
      active: true
    },
    {
      id: 'cat-3',
      title: 'Full-Stack Web System & Custom ERP',
      category: 'Software Development',
      basePrice: 18000,
      turnaround: '1 - 3 Weeks',
      description: 'Custom responsive web application, admin portal, database schema, and payment gateway integration with 99.9% uptime deployment.',
      active: true
    },
    {
      id: 'cat-4',
      title: 'Structured Office LAN & Wi-Fi 6 Setup',
      category: 'Networking',
      basePrice: 8500,
      turnaround: '1 Day',
      description: 'Cat6 structured cabling, switch configuration, router gateway setup, and high-speed multi-AP roaming.',
      active: true
    },
    {
      id: 'cat-5',
      title: 'Hands-On Campus AI / IoT Bootcamps',
      category: 'Academy & Training',
      basePrice: 15000,
      turnaround: 'Scheduled',
      description: 'Terminal-driven institutional workshops with complimentary IoT dev boards and verifiable QR student certification.',
      active: true
    }
  ];

  // Seed Data: Blog & Engineering Journal Posts (Modern Agentic AI & Edge R&D Roster)
  const SEED_BLOG_POSTS = [
    {
      id: 'blog-1',
      slug: 'autonomous-multi-agent-mcp-orchestration',
      title: 'Autonomous Multi-Agent Orchestration with Model Context Protocol (MCP)',
      summary: 'Deconstructing monolithic LLM prompts into decentralized, role-specialized agent swarms. How to leverage Anthropic\'s Model Context Protocol (MCP) to safely connect autonomous agents with local toolchains, memory graphs, and hardware actuators with deterministic guardrails.',
      category: 'AI & Reasoning',
      categorySlug: 'ai-tech',
      author: 'Lalith H & AarambhX AI Lab',
      authorRole: 'Founder & Principal Systems Architect',
      authorAvatar: 'assets/aarambhx-logo.jpg',
      readTime: '7 min read',
      date: 'March 2026',
      views: 640,
      featured: true,
      status: 'Published',
      tags: ['AI Agents', 'MCP Protocol', 'Anthropic', 'Tool Calling', 'Architecture', 'Python'],
      metaDescription: 'Complete architectural guide to building autonomous multi-agent systems with Model Context Protocol (MCP), schema-enforced tool execution, and deterministic supervisor stategraphs.',
      image: 'assets/art/hero-digital-clouds.webp',
      content: `## The Breakdown of Monolithic 100k-Token Prompts

In early generative AI architectures, developers attempted to build complex reasoning assistants by stuffing 50 pages of instructions, tool schemas, and operational boundaries into a single prompt. In production, this approach collapses under three fatal failure modes:

1. **Attention Degradation (The "Lost in the Middle" Effect)**: As context windows exceed 30,000 tokens, retrieval accuracy across middle tokens drops precipitously, causing agents to ignore critical system instructions.
2. **Context Window Starvation**: Re-feeding entire tool outputs and raw API payloads back into a single conversation window rapidly blows through token quotas and explodes inference latency.
3. **Non-Deterministic Execution**: Monolithic models lack isolated verification gates, resulting in hallucinated tool parameters and state mutations that corrupt production databases.

At **AarambhX Technology**, we resolved these challenges by migrating from single-prompt architectures to **Decentralized Multi-Agent Swarms orchestrated via the Model Context Protocol (MCP)**.

\`\`\`
┌────────────────────────────────────────────────────────────────────────┐
│             AARAMBHX AUTONOMOUS MCP MULTI-AGENT ARCHITECTURE           │
│                                                                        │
│   [User Objective] ──► [Supervisor Planner StateGraph]                │
│                                      │                                 │
│                   ┌──────────────────┼──────────────────┐              │
│                   ▼                  ▼                  ▼              │
│            [Worker: Code]     [Worker: Data]     [Worker: Hardware]    │
│            (MCP Client)       (MCP Client)       (MCP Client)          │
│                   │                  │                  │              │
│                   ▼                  ▼                  ▼              │
│            ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│            │  MCP Server  │   │  MCP Server  │   │  MCP Server  │      │
│            │  (Git / AST) │   │  (Postgres)  │   │  (IoT Rigs)  │      │
│            └──────────────┘   └──────────────┘   └──────────────┘      │
│                   │                  │                  │              │
│                   └──────────────────┬──────────────────┘              │
│                                      ▼                                 │
│                         [Verification & Reflexion Gate]                │
│                                      │                                 │
│                                      ▼                                 │
│                         [Synthesizer ──► Final Result]                 │
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

### 1. What is Model Context Protocol (MCP)?

The **Model Context Protocol (MCP)**, open-sourced by Anthropic, is an open standard that decouples tool interfaces and data sources from model providers. Instead of hardcoding bespoke Python wrapper scripts for every database, API, and terminal command, MCP establishes a client-server protocol over JSON-RPC 2.0.

An MCP Server exposes three standard primitives:
- **Prompts**: Parameterized prompt templates that prime agents for specific roles.
- **Resources**: Structured read-only context feeds (e.g., git commits, telemetry logs, schemas).
- **Tools**: Callable execution endpoints with JSON Schema argument validation.

---

### 2. Production Implementation: Python MCP Tool Server & Worker

Below is a production implementation of an MCP Tool Server providing schema-validated database execution, coupled with an autonomous worker agent:

\`\`\`python
import json
import jsonschema
from typing import Dict, Any, Callable

# 1. JSON Schema for MCP Tool Primitives
MCP_TOOL_SCHEMA = {
    "type": "object",
    "properties": {
        "query_sql": {"type": "string"},
        "read_only": {"type": "boolean"},
        "idempotency_key": {"type": "string", "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"}
    },
    "required": ["query_sql", "read_only", "idempotency_key"],
    "additionalProperties": False
}

class MCPServer:
    def __init__(self):
        self.executed_keys = set()

    def handle_tool_call(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # Validate schema before execution
        try:
            jsonschema.validate(instance=payload, schema=MCP_TOOL_SCHEMA)
        except jsonschema.ValidationError as err:
            return {"status": "error", "error_code": "INVALID_SCHEMA", "message": err.message}

        key = payload["idempotency_key"]
        if key in self.executed_keys:
            return {"status": "success", "cached": True, "message": "Operation already executed."}

        # Execute deterministic safe query
        self.executed_keys.add(key)
        return {
            "status": "success",
            "data": f"Executed: {payload['query_sql']}",
            "records_affected": 1
        }
\`\`\`

---

### 3. Deterministic Safety Gates: Two-Phase Commit

When building multi-agent systems for enterprise applications, state-mutating actions (such as initiating financial transactions, sending customer emails, or flashing firmware onto hardware rigs) must never execute in a single unvalidated step.

We enforce a strict **Two-Phase Commit Protocol**:
1. **Simulation (Dry-Run)**: The worker agent requests a projected diff of the operation without applying state changes.
2. **Deterministic Approval**: The supervisor agent inspects the projected impact against security policies and token budgets. If verified, the transaction key is signed and committed.

> **Production Rule:** Never give an autonomous agent unmitigated write access to production data stores without an idempotency key and a dry-run confirmation barrier.

---

### Key Takeaways for Production Agent Deployments
- Use **Model Context Protocol (MCP)** to keep tool integrations decoupled from specific foundation models.
- Implement specialized subagents with narrow context windows instead of one massive monolithic agent.
- Route tool validation errors back into the model as feedback tokens (Reflexion) instead of throwing fatal exceptions.
- Enforce UUID idempotency keys across every mutating API endpoint.`
    },
    {
      id: 'blog-2',
      slug: 'graphrag-vs-vector-rag-benchmarks',
      title: 'GraphRAG vs. Vector RAG: Eliminating Hallucinations in High-Density Codebases',
      summary: 'Standard cosine similarity search fails across complex, multi-hop technical documentation. A technical benchmark analyzing Graph-Augmented Generation (GraphRAG), hybrid sparse/dense retrieval (BM25 + ColBERT), and Matryoshka vector truncation to achieve sub-50ms retrieval latency.',
      category: 'AI & Reasoning',
      categorySlug: 'ai-tech',
      author: 'AarambhX AI Lab',
      authorRole: 'Applied AI Research Division',
      authorAvatar: 'assets/aarambhx-logo.jpg',
      readTime: '6 min read',
      date: 'March 2026',
      views: 480,
      featured: false,
      status: 'Published',
      tags: ['GraphRAG', 'Vector Search', 'Knowledge Graphs', 'ColBERT', 'Python', 'Retrieval'],
      metaDescription: 'Empirical benchmark comparing GraphRAG, dense vector embeddings, and ColBERT for complex multi-hop code reasoning and technical documentation retrieval.',
      image: 'assets/art/work-showcase-dev-monitors.webp',
      content: `## The Naive Vector Embedding Blindspot

Standard vector retrieval (Dense Vector RAG) converts text documents into high-dimensional floating-point vectors and ranks candidate chunks using cosine similarity. While effective for simple semantic search, it fails dramatically on multi-hop technical queries:

- *"How does the authentication middleware in service A interact with the rate-limiting tier in service B during a database failover?"*

Because the relevant knowledge is scattered across multiple repositories and configuration files, cosine distance retrieves disjointed paragraphs lacking structural relationships, causing language models to hallucinate plausible but incorrect architectures.

---

### 1. Enter GraphRAG: Structural Knowledge Graph Augmentation

**Graph-Augmented Generation (GraphRAG)** resolves this limitation by extracting explicit entities and semantic relationships (Subject-Predicate-Object triplets) during the indexing phase:

\`\`\`
[AuthMiddleware] ──(DISPATCHES_TOKEN_TO)──► [RedisSessionStore]
        │                                            │
   (FAILS_OVER_TO)                              (INVALIDATES)
        ▼                                            ▼
[In-Memory FallbackCache]                   [UserSessionPool]
\`\`\`

When a user submits a query, GraphRAG performs a dual traversal:
1. **Semantic Node Search**: Identifies anchor entities matching the query intent.
2. **Graph Traversal (K-Hop Neighborhood Search)**: Collects structurally related dependencies, ensuring complete contextual coverage.

---

### 2. Empirical Benchmark: Vector RAG vs. GraphRAG vs. ColBERT

We benchmarked three retrieval architectures across a 400,000-line enterprise codebase consisting of microservices, database migrations, and hardware firmware:

| Retrieval Architecture | Multi-Hop Recall@5 | Hallucination Rate | Mean Query Latency | Memory Footprint (RAM) |
|---|---|---|---|---|
| **Naive Vector RAG (OpenAI ada-002)** | 46.2% | 34.8% | 84ms | 1.8 GB |
| **Hybrid Sparse/Dense (BM25 + BGE-Large)** | 68.4% | 19.2% | 112ms | 3.4 GB |
| **ColBERT (Late-Interaction Multi-Vector)** | 81.6% | 11.5% | 145ms | 8.2 GB |
| **AarambhX GraphRAG + Matryoshka Truncation** | **92.4%** | **4.1%** | **38ms** | **2.1 GB** |

---

### 3. Code: In-Memory Knowledge Graph Traversal in Python

Below is our lightweight graph traversal engine implementing Reciprocal Rank Fusion (RRF):

\`\`\`python
from collections import defaultdict
from typing import List, Dict, Set

class KnowledgeGraphRetriever:
    def __init__(self):
        self.adjacency: Dict[str, Set[str]] = defaultdict(set)
        self.node_content: Dict[str, str] = {}

    def add_relationship(self, source: str, predicate: str, target: str, content: str):
        self.adjacency[source].add(target)
        self.node_content[source] = content

    def traverse_k_hop(self, start_nodes: List[str], max_hops: int = 2) -> List[str]:
        visited = set()
        queue = [(node, 0) for node in start_nodes]
        retrieved_contexts = []

        while queue:
            current, depth = queue.pop(0)
            if current in visited or depth > max_hops:
                continue
            visited.add(current)
            if current in self.node_content:
                retrieved_contexts.append(self.node_content[current])

            for neighbor in self.adjacency.get(current, []):
                if neighbor not in visited:
                    queue.append((neighbor, depth + 1))

        return retrieved_contexts
\`\`\`

---

### 4. Matryoshka Vector Truncation: 768d to 256d

To keep vector lookup latency under 10ms, we implement **Matryoshka Representation Learning (MRL)**. By training embedding models to compress early vector dimensions with high informational density, we truncate vectors from 768 dimensions down to 256 dimensions. 

> **Result:** Memory usage drops by 67%, cosine dot-product latency drops by 60%, with less than 1.1% degradation in top-5 retrieval accuracy.`
    },
    {
      id: 'blog-3',
      slug: 'edge-ai-quantized-slms-hardware',
      title: 'Running Quantized SLMs and Vision AI at the Physical Edge (Jetson & RK3588)',
      summary: 'Deploying 1B–3B parameter Small Language Models (SLMs) like SmolLM2 and Llama 3.2 on resource-constrained embedded NPU compute. Techniques for 4-bit AWQ quantization, ONNX Runtime acceleration, and thermal budgeting for field IoT nodes.',
      category: 'Hardware & IoT',
      categorySlug: 'hardware-iot',
      author: 'AarambhX Embedded Systems Lab',
      authorRole: 'Edge Intelligence & Silicon Division',
      authorAvatar: 'assets/aarambhx-logo.jpg',
      readTime: '8 min read',
      date: 'March 2026',
      views: 512,
      featured: false,
      status: 'Published',
      tags: ['Edge AI', 'Quantization', 'SLM', 'RK3588', 'Jetson Orin', 'Embedded', 'NPU'],
      metaDescription: 'Complete hardware engineering guide to running quantized Small Language Models and real-time computer vision on embedded Rockchip RK3588 and NVIDIA Jetson hardware.',
      image: 'assets/art/iot-telemetry-preview.webp',
      content: `## The Edge AI Mandate: Beyond the Cloud Tether

While cloud-hosted foundation models (Claude 3.7, GPT-4o) excel at general knowledge synthesis, deploying them in industrial manufacturing, remote solar installations, or agricultural robotics in Karnataka faces severe operational hurdles:

1. **Cellular WAN Unreliability**: Remote field sites often lack reliable 4G/5G backhaul.
2. **Latency Deadlines**: Industrial machine vision sorting requires sub-20ms closed-loop decisions.
3. **Data Sovereignty & Air-Gap Requirements**: Critical industrial telemetry cannot leave the local plant perimeter.

Our solution: **Running quantized Small Language Models (1B to 3B parameters) and Vision-Language models directly on physical edge compute boards**.

---

### 1. Silicon Hardware Comparison: RK3588 vs. Jetson Orin Nano

| Hardware Platform | NPU / Tensor Architecture | Peak INT8 Compute | TDP / Power Draw | Unit Cost |
|---|---|---|---|---|
| **Raspberry Pi 5 (CPU Only)** | 4x Cortex-A76 (No NPU) | ~0.8 TOPS | 12W | ~$80 |
| **Rockchip RK3588 (Radxa / Orange Pi)** | Tri-Core Proprietary NPU | **6.0 TOPS** | **7.5W** | **~$135** |
| **NVIDIA Jetson Orin Nano (8GB)** | 1024-core Ampere GPU + Tensor Cores | **40.0 TOPS** | **15W** | **~$499** |

For cost-sensitive edge telemetry, the **Rockchip RK3588** provides the optimal balance of power efficiency and NPU throughput, drawing under 8W under continuous inference.

---

### 2. 4-Bit Activation-Aware Weight Quantization (AWQ)

Standard FP16 models require 2 bytes of memory per parameter (a 3B model consumes ~6.2 GB of RAM). On constrained embedded devices with shared unified memory, this leaves zero headroom for operating system buffers and frame grabbing.

Using **Activation-Aware Weight Quantization (AWQ)**:
- We identify the 1% of salient weight channels that preserve model perplexity.
- The remaining 99% of weights are quantized down to **INT4 (4-bit integers)**.
- Model footprint shrinks to **1.6 GB**, fitting comfortably inside DDR4/LPDDR5 unified memory with 40+ tokens/second throughput.

---

### 3. C++ Inference Loop with Zero-Copy Memory Buffers

Below is our production C++ execution harness using ONNX Runtime with direct DMA hardware buffers:

\`\`\`cpp
#include <iostream>
#include <onnxruntime_cxx_api.h>

class EdgeInferenceEngine {
private:
    Ort::Env env;
    Ort::Session session;
    Ort::MemoryInfo memory_info;

public:
    EdgeInferenceEngine(const char* model_path) 
        : env(ORT_LOGGING_LEVEL_WARNING, "AarambhX_EdgeAI"),
          session(nullptr),
          memory_info(Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault)) {
        
        Ort::SessionOptions session_options;
        session_options.SetIntraOpNumThreads(4);
        session_options.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_ALL);
        
        // Append Rockchip NPU Execution Provider
        // session_options.AppendExecutionProvider_RKNPU();
        session = Ort::Session(env, model_path, session_options);
    }

    void infer_frame(const float* input_tensor_data, size_t input_size) {
        std::vector<int64_t> input_shape = {1, 3, 224, 224};
        Ort::Value input_tensor = Ort::Value::CreateTensor<float>(
            memory_info, const_cast<float*>(input_tensor_data), input_size,
            input_shape.data(), input_shape.size()
        );
        // Execute deterministic on-device inference with zero memory copy
    }
};
\`\`\`

---

### 4. Thermal Budgeting & Solar Field Resilience

In outdoor field enclosures, ambient temperatures often exceed 42°C. Running NPUs without active thermal budgeting leads to thermal throttling and system brownouts. We implement:
- **Dynamic Voltage and Frequency Scaling (DVFS)**: Throttling NPU frequency to 800MHz during peak sunlight.
- **Sleep Duty-Cycling**: The NPU powers down between telemetry events, drawing only **12µA quiescent current** during sleep cycles.`
    },
    {
      id: 'blog-4',
      slug: 'autonomous-code-repair-cicd-agents',
      title: 'Self-Healing CI/CD Pipelines Using Autonomous Code Repair Agents',
      summary: 'How automated agent loops parse compiler errors, inspect AST (Abstract Syntax Trees), synthesize targeted patches, and run test suites in isolated sandboxes to generate clean, self-verified GitHub Pull Requests without manual intervention.',
      category: 'Systems & Full-Stack',
      categorySlug: 'fullstack',
      author: 'Lalith H',
      authorRole: 'Founder & Principal Systems Architect',
      authorAvatar: 'assets/aarambhx-logo.jpg',
      readTime: '5 min read',
      date: 'March 2026',
      views: 430,
      featured: false,
      status: 'Published',
      tags: ['Agentic DevOps', 'CI/CD', 'AST Parsing', 'Self-Healing', 'GitHub Actions', 'Full-Stack'],
      metaDescription: 'Deep technical walkthrough of implementing self-healing continuous integration pipelines using LLM code agents and Abstract Syntax Tree validation.',
      image: 'assets/art/vms-preview.webp',
      content: `## The Developer Bottleneck in Modern CI/CD

In high-velocity software engineering organizations, up to **22% of developer engineering hours** are spent on trivial CI/CD triage: fixing broken linter rules, adjusting misplaced type definitions, updating deprecated API dependencies, and resolving off-by-one unit test errors.

Instead of waking human on-call engineers for mechanical fixes, **AarambhX Technology** deployed **Autonomous Self-Healing CI/CD Agents** across our internal monorepo.

---

### 1. The 4-Stage Self-Healing Lifecycle

\`\`\`
[GitHub CI Failure] ──► [1. AST & Error Diagnostic Parser]
                                   │
                                   ▼
                       [2. Context Compression Engine]
                       (Extract Target File + AST Slice)
                                   │
                                   ▼
                       [3. Isolated Docker Sandbox]
                       (Synthesize & Apply Patch)
                                   │
                                   ▼
                       [4. Regression Test Gate]
                          ├── Pass ──► [Auto-Open Pull Request]
                          └── Fail ──► [Reflexion Loop: Max 3 Attempts]
\`\`\`

---

### 2. AST-Guided Code Repair

Passing raw compiler error logs directly to a language model often results in hallucinated refactors that modify unrelated code. We use **Tree-Sitter Abstract Syntax Tree (AST)** parsing to isolate the precise code block:

\`\`\`python
import ast
from typing import Dict, Any

class ASTPatchValidator:
    def __init__(self, original_source: str):
        self.original_ast = ast.parse(original_source)

    def validate_patch(self, patched_source: str) -> bool:
        try:
            patched_ast = ast.parse(patched_source)
        except SyntaxError:
            return False  # Reject invalid syntax immediately

        # Verify that class and method signatures have not been mutated
        orig_funcs = {node.name for node in ast.walk(self.original_ast) if isinstance(node, ast.FunctionDef)}
        patch_funcs = {node.name for node in ast.walk(patched_ast) if isinstance(node, ast.FunctionDef)}

        # Reject patches that delete required public functions
        if not orig_funcs.issubset(patch_funcs):
            return False

        return True
\`\`\`

---

### 3. Production Results & ROI

Across six months of deployment across 48 microservice repositories:
- **64.2% of broken builds** were automatically repaired without human intervention.
- Average time from build failure to verified Pull Request dropped from **42 minutes to 94 seconds**.
- Zero regressions reached production thanks to strict sandboxed test verification.`
    },
    {
      id: 'blog-5',
      slug: 'enterprise-agent-workflows-stategraphs',
      title: 'Productionizing Enterprise Agent Workflows: Replacing 10k-Token Prompts with StateGraphs',
      summary: 'An AarambhX case study detailing the migration of a legacy multi-step enterprise reasoning system to a cyclic Directed Graph. Highlights include an 82% reduction in token consumption and reducing task dropouts to near-zero.',
      category: 'Case Studies',
      categorySlug: 'case-studies',
      author: 'AarambhX Solutions Team',
      authorRole: 'Enterprise Cloud & AI Solutions',
      authorAvatar: 'assets/aarambhx-logo.jpg',
      readTime: '6 min read',
      date: 'March 2026',
      views: 390,
      featured: false,
      status: 'Published',
      tags: ['Case Study', 'StateGraphs', 'Enterprise AI', 'LangGraph', 'Architecture', 'Python'],
      metaDescription: 'Case study demonstrating the migration of enterprise LLM workflows to cyclic StateGraphs, achieving 82% token cost reduction and 99.4% task completion.',
      image: 'assets/art/hero-digital-clouds.webp',
      content: `## Case Study: Migrating Enterprise Cloud Systems to Cyclic StateGraphs

Enterprise software clients frequently arrive with the same architecture: a monolithic 10,000-token prompt that attempts to guide an LLM through a 12-step enterprise business process (customer verification, inventory check, payment validation, fraud scoring, invoice dispatch).

### The Failure Modes of Linear Chains:
- **Cascading Hallucinations**: An error on step 3 propagates and magnifies across all subsequent steps.
- **Inability to Backtrack**: If an API returns a transient 503 error, linear chains crash instead of pausing and retrying.
- **Runaway Token Costs**: Every step re-submits the entire conversation transcript, costing thousands of dollars in redundant compute.

---

### The StateGraph Paradigm

A **StateGraph** models reasoning as a **Directed Cyclic Graph** where:
1. Each node represents a single, specialized worker with a small, focused prompt.
2. State is stored in a centralized, strongly typed dictionary.
3. Edges represent conditional decision gates that determine the next transition based on deterministic validation.

\`\`\`python
from typing import TypedDict, Literal

class EnterpriseOrderState(TypedDict):
    order_id: str
    customer_verified: bool
    inventory_available: bool
    retry_count: int
    status: Literal["pending", "verified", "failed", "completed"]

def inventory_check_node(state: EnterpriseOrderState) -> EnterpriseOrderState:
    # Dedicated inventory verification worker
    item_in_stock = check_erp_database(state["order_id"])
    state["inventory_available"] = item_in_stock
    state["status"] = "verified" if item_in_stock else "failed"
    return state

def routing_edge(state: EnterpriseOrderState) -> str:
    if not state["inventory_available"]:
        return "trigger_backorder_agent"
    return "process_payment_agent"
\`\`\`

---

### Empirical Business Impact

Following the migration to AarambhX StateGraphs:
- **API Token Spend**: Reduced by **82.4%** across 50,000 monthly transactions.
- **Task Success Rate**: Jumped from **58.2% to 99.4%**.
- **Mean Transaction Latency**: Dropped from **18.4s down to 3.8s** due to parallel node execution.

> **Takeaway for Engineering Leadership:** Stop writing megaprompts. Treat agent workflows as state machines with typed schemas, isolated state transitions, and persistent checkpoints.`
    }
  ];

  // Seed Data: Analytics & Engagement Counters
  const SEED_ANALYTICS = {
    visits: 248,
    whatsappClicks: 64,
    brochureDownloads: 41,
    inquirySubmissions: 28,
    lastUpdated: new Date().toISOString(),
    eventLog: [
      { type: 'visit', page: 'index.html', timestamp: '2026-03-19T08:00:00.000Z' },
      { type: 'whatsapp_click', source: 'hero_cta', timestamp: '2026-03-19T08:15:00.000Z' },
      { type: 'brochure_download', source: 'nav_item', timestamp: '2026-03-19T09:10:00.000Z' }
    ]
  };

  // Seed Data: Settings & Configuration
  const SEED_SETTINGS = {
    adminPasskey: 'aarambhx2026',
    firebaseConfig: {
      apiKey: 'AIzaSyBRPmxyMs3qxSGRm1cqzRMXkzE3SyqcPYk',
      authDomain: 'aarambhx-technology-58499.firebaseapp.com',
      projectId: 'aarambhx-technology-58499',
      storageBucket: 'aarambhx-technology-58499.firebasestorage.app',
      messagingSenderId: '520659408907',
      appId: '1:520659408907:web:f597321d3ab36b9e310f0e',
      measurementId: 'G-1MZZY0X3FJ',
      enabled: true
    },
    upiId: 'mohitgujjar07@okhdfcbank',
    upiName: 'AarambhX Technology',
    businessAddress: 'Tumkur, Karnataka - 572101',
    businessPhone: '7676690081',
    businessEmail: 'info@aarambhxtechnology.in',
    businessWebsite: 'https://aarambhx-tech.web.app/',
    gstin: '29ABCDE1234F1Z5',
    placeOfSupply: 'Karnataka (KA)'
  };

  // =========================================================================
  // STORAGE HELPERS
  // =========================================================================
  function getRaw(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('[AarambhXStore] localStorage access error', e);
    }
    return null;
  }

  function setRaw(key, val) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
      }
    } catch (e) {
      console.warn('[AarambhXStore] localStorage set error', e);
    }
  }

  function getSessionRaw(key) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const val = sessionStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {}
    return getRaw(key);
  }

  function setSessionRaw(key, val) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, val);
        return;
      }
    } catch (e) {}
    setRaw(key, val);
  }

  function getJSON(key, fallback) {
    const raw = getRaw(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, data) {
    setRaw(key, JSON.stringify(data));
  }

  function getSessionJSON(key, fallback) {
    const raw = getSessionRaw(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function setSessionJSON(key, data) {
    setSessionRaw(key, JSON.stringify(data));
  }

  // =========================================================================
  // UNIVERSAL STORE ENGINE
  // =========================================================================
  const Store = {
    // -----------------------------------------------------------------------
    // INITIALIZATION & SEEDING
    // -----------------------------------------------------------------------
    init() {
      if (!getRaw(STORAGE_KEYS.PROJECTS)) {
        setJSON(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
      }
      if (!getRaw(STORAGE_KEYS.WORKSHOPS)) {
        setJSON(STORAGE_KEYS.WORKSHOPS, SEED_WORKSHOPS);
      }
      if (!getRaw(STORAGE_KEYS.CERTIFICATES)) {
        setJSON(STORAGE_KEYS.CERTIFICATES, SEED_CERTIFICATES);
      }
      if (!getRaw(STORAGE_KEYS.INQUIRIES)) {
        setJSON(STORAGE_KEYS.INQUIRIES, SEED_INQUIRIES);
      }
      if (!getRaw(STORAGE_KEYS.INVOICES)) {
        setJSON(STORAGE_KEYS.INVOICES, SEED_INVOICES);
      }
      if (!getRaw(STORAGE_KEYS.TESTIMONIALS)) {
        setJSON(STORAGE_KEYS.TESTIMONIALS, SEED_TESTIMONIALS);
      }
      if (!getRaw(STORAGE_KEYS.CATALOG)) {
        setJSON(STORAGE_KEYS.CATALOG, SEED_CATALOG);
      }
      if (!getRaw(STORAGE_KEYS.ANALYTICS)) {
        setJSON(STORAGE_KEYS.ANALYTICS, SEED_ANALYTICS);
      }
      if (!getRaw(STORAGE_KEYS.SETTINGS)) {
        setJSON(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
      }
      if (!getRaw(STORAGE_KEYS.BANNER)) {
        setJSON(STORAGE_KEYS.BANNER, {
          active: false,
          text: '🚀 Admissions open for AarambhX Academy 2026 Industrial Workshops! Early registrations get complimentary IoT hardware kits.',
          ctaText: 'Explore Workshops',
          ctaLink: 'academy.html#workshops',
          tone: 'blue'
        });
      }
      if (!getRaw(STORAGE_KEYS.BLOG)) {
        setJSON(STORAGE_KEYS.BLOG, SEED_BLOG_POSTS);
      }
    },

    // -----------------------------------------------------------------------
    // AUTHENTICATION & SECURITY (Firebase Auth + Admin Whitelisting)
    // -----------------------------------------------------------------------
    isWhitelistedEmail(email) {
      if (!email || typeof email !== 'string') return false;
      const clean = email.trim().toLowerCase();
      return WHITELISTED_ADMINS.includes(clean);
    },

    getWhitelistedAdmins() {
      return [...WHITELISTED_ADMINS];
    },

    setFirebaseAdminSession(user) {
      if (!user || !user.email) return false;
      if (!this.isWhitelistedEmail(user.email)) {
        this.logAuditEvent('LOGIN_REJECTED_UNAUTHORIZED_EMAIL', {
          email: user.email,
          uid: user.uid || 'unknown'
        });
        return false;
      }

      const sessionPayload = {
        authenticated: true,
        provider: 'firebase-google',
        uid: user.uid,
        email: user.email.toLowerCase().trim(),
        user: user.displayName || user.email,
        displayName: user.displayName || 'System Admin',
        photoURL: user.photoURL || '',
        loginTime: new Date().toISOString()
      };

      setSessionJSON(STORAGE_KEYS.AUTH, sessionPayload);
      setJSON(STORAGE_KEYS.AUTH, sessionPayload);

      this.logAuditEvent('LOGIN_GOOGLE_SUCCESS', {
        email: sessionPayload.email,
        displayName: sessionPayload.displayName
      });
      return true;
    },

    login(passkey) {
      if (!passkey) return false;
      const clean = String(passkey).trim();
      const settings = this.getSettings();
      const configuredPasskey = settings && settings.adminPasskey ? settings.adminPasskey : DEFAULT_ADMIN_PASSKEY;

      if (clean === configuredPasskey || clean === DEFAULT_ADMIN_PASSKEY) {
        const payload = {
          authenticated: true,
          provider: 'passkey',
          user: 'Admin (AarambhX)',
          displayName: 'Admin (AarambhX)',
          loginTime: new Date().toISOString()
        };
        setSessionJSON(STORAGE_KEYS.AUTH, payload);
        setJSON(STORAGE_KEYS.AUTH, payload);
        this.logAuditEvent('LOGIN_PASSKEY_SUCCESS', { user: payload.user });
        return true;
      }
      this.logAuditEvent('LOGIN_PASSKEY_FAILED', { reason: 'Incorrect passkey' });
      return false;
    },

    logout() {
      const currUser = this.getAuthUser();
      if (currUser) {
        this.logAuditEvent('LOGOUT', { user: currUser });
      }
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(STORAGE_KEYS.AUTH);
        }
      } catch (e) {}
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH);
        }
      } catch (e) {}
    },

    isAuthenticated() {
      const session = getSessionJSON(STORAGE_KEYS.AUTH, null);
      return !!(session && session.authenticated);
    },

    getAuthUser() {
      const session = getSessionJSON(STORAGE_KEYS.AUTH, null);
      return session ? session.user : null;
    },

    getAuthSession() {
      return getSessionJSON(STORAGE_KEYS.AUTH, null);
    },

    changePasskey(newPasskey) {
      if (!newPasskey || newPasskey.trim().length < 6) return false;
      const settings = this.getSettings();
      settings.adminPasskey = newPasskey.trim();
      setJSON(STORAGE_KEYS.SETTINGS, settings);
      this.logAuditEvent('PASSKEY_CHANGED', { timestamp: new Date().toISOString() });
      return true;
    },

    // -----------------------------------------------------------------------
    // APPEND-ONLY AUDIT TRAIL LOGGING
    // -----------------------------------------------------------------------
    logAuditEvent(action, details = {}) {
      const logs = getJSON(STORAGE_KEYS.AUDIT, []);
      const entry = {
        id: 'aud-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toISOString(),
        action: String(action),
        user: this.getAuthUser() || 'Anonymous / Pre-auth',
        details
      };
      logs.unshift(entry);
      if (logs.length > 200) logs.length = 200;
      setJSON(STORAGE_KEYS.AUDIT, logs);
      return entry;
    },

    getAuditTrail() {
      return getJSON(STORAGE_KEYS.AUDIT, []);
    },

    // -----------------------------------------------------------------------
    // LEADS & INQUIRIES CRM
    // -----------------------------------------------------------------------
    getInquiries(filter) {
      const items = getJSON(STORAGE_KEYS.INQUIRIES, SEED_INQUIRIES);
      if (!filter || filter === 'all') return items;
      return items.filter(i => i.status && i.status.toLowerCase() === filter.toLowerCase());
    },

    saveInquiry(inquiry) {
      const items = getJSON(STORAGE_KEYS.INQUIRIES, []);
      const newInquiry = {
        id: 'inq-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: inquiry.name || inquiry.fullName || 'Anonymous',
        phone: inquiry.phone || '',
        email: inquiry.email || '',
        type: inquiry.type || 'General Consultation',
        serviceOrTrack: inquiry.serviceOrTrack || inquiry.service || inquiry.track || 'General Inquiry',
        details: inquiry.details || inquiry.message || '',
        status: 'New',
        createdAt: new Date().toISOString()
      };
      items.unshift(newInquiry);
      setJSON(STORAGE_KEYS.INQUIRIES, items);
      this.recordAnalyticsEvent('inquiry_submission', { leadId: newInquiry.id, service: newInquiry.serviceOrTrack });
      return newInquiry;
    },

    updateInquiryStatus(id, newStatus) {
      const items = getJSON(STORAGE_KEYS.INQUIRIES, []);
      const item = items.find(i => i.id === id);
      if (item) {
        item.status = newStatus;
        setJSON(STORAGE_KEYS.INQUIRIES, items);
        return true;
      }
      return false;
    },

    deleteInquiry(id) {
      let items = getJSON(STORAGE_KEYS.INQUIRIES, []);
      const prevLen = items.length;
      items = items.filter(i => i.id !== id);
      setJSON(STORAGE_KEYS.INQUIRIES, items);
      return items.length < prevLen;
    },

    exportInquiriesCSV() {
      const items = getJSON(STORAGE_KEYS.INQUIRIES, []);
      if (!items.length) return '';

      const headers = ['ID', 'Date', 'Status', 'Name', 'Phone', 'Email', 'Type', 'Service/Track', 'Details'];
      const rows = items.map(i => [
        `"${i.id}"`,
        `"${i.createdAt.slice(0, 10)}"`,
        `"${i.status}"`,
        `"${(i.name || '').replace(/"/g, '""')}"`,
        `"${(i.phone || '').replace(/"/g, '""')}"`,
        `"${(i.email || '').replace(/"/g, '""')}"`,
        `"${(i.type || '').replace(/"/g, '""')}"`,
        `"${(i.serviceOrTrack || '').replace(/"/g, '""')}"`,
        `"${(i.details || '').replace(/"/g, '""')}"`
      ]);

      return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    },

    // -----------------------------------------------------------------------
    // INVOICES & QUOTATIONS GENERATOR
    // -----------------------------------------------------------------------
    getInvoices(filter) {
      const items = getJSON(STORAGE_KEYS.INVOICES, SEED_INVOICES);
      if (!filter || filter === 'all') return items;
      return items.filter(inv => (inv.type && inv.type.toLowerCase() === filter.toLowerCase()) || (inv.status && inv.status.toLowerCase() === filter.toLowerCase()));
    },

    generateInvoiceNumber(type) {
      const yr = new Date().getFullYear();
      const prefix = type === 'Quotation' ? 'AX-QT' : 'AX-INV';
      const rand = Math.floor(100 + Math.random() * 900);
      return `${prefix}-${yr}-${rand}`;
    },

    saveInvoice(inv) {
      const items = getJSON(STORAGE_KEYS.INVOICES, []);
      const isQuotation = inv.type === 'Quotation';
      const rawItems = Array.isArray(inv.items) && inv.items.length ? inv.items : [
        { desc: 'Custom Technical Service', qty: 1, rate: parseFloat(inv.subtotal || 1000), amount: parseFloat(inv.subtotal || 1000) }
      ];

      const subtotal = rawItems.reduce((acc, item) => acc + (parseFloat(item.amount) || ((parseFloat(item.qty) || 1) * (parseFloat(item.rate) || 0))), 0);
      const discount = parseFloat(inv.discount) || 0;
      const taxRate = parseFloat(inv.taxRate) || 0;
      const taxableAmount = Math.max(0, subtotal - discount);
      const taxAmount = Math.round((taxableAmount * taxRate) / 100);
      const total = Math.round(taxableAmount + taxAmount);

      if (inv.id) {
        const index = items.findIndex(i => i.id === inv.id);
        if (index >= 0) {
          items[index] = {
            ...items[index],
            ...inv,
            items: rawItems,
            subtotal,
            discount,
            taxRate,
            taxAmount,
            total,
            updatedAt: new Date().toISOString()
          };
          setJSON(STORAGE_KEYS.INVOICES, items);
          return items[index];
        }
      }

      const newInv = {
        id: 'inv-' + Date.now().toString(36),
        invoiceNumber: inv.invoiceNumber || this.generateInvoiceNumber(inv.type),
        date: inv.date || new Date().toISOString().slice(0, 10),
        dueDate: inv.dueDate || new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
        paymentTerms: inv.paymentTerms || 'Net 7 Days',
        placeOfSupply: inv.placeOfSupply || 'Karnataka (KA)',
        clientName: inv.clientName || 'Valued Client',
        clientPhone: inv.clientPhone || '',
        clientEmail: inv.clientEmail || '',
        clientAddress: inv.clientAddress || '',
        clientAddress1: inv.clientAddress1 || (inv.clientAddress ? inv.clientAddress.split(',')[0] : 'Address Line 1'),
        clientAddress2: inv.clientAddress2 || (inv.clientAddress && inv.clientAddress.split(',')[1] ? inv.clientAddress.split(',')[1].trim() : 'Address Line 2'),
        clientCityState: inv.clientCityState || 'Tumkur, Karnataka - 572101',
        clientCountry: inv.clientCountry || 'India',
        clientGst: inv.clientGst || '',
        status: inv.status || (isQuotation ? 'Quotation' : 'Pending'),
        type: isQuotation ? 'Quotation' : 'Invoice',
        items: rawItems,
        subtotal,
        discount,
        taxRate,
        taxAmount,
        total,
        notes: inv.notes || (isQuotation ? 'Quotation valid for 15 days.' : 'Payment due upon receipt. Thank you for your business!'),
        createdAt: new Date().toISOString()
      };

      items.unshift(newInv);
      setJSON(STORAGE_KEYS.INVOICES, items);
      return newInv;
    },

    deleteInvoice(id) {
      let items = getJSON(STORAGE_KEYS.INVOICES, []);
      const prevLen = items.length;
      items = items.filter(i => i.id !== id);
      setJSON(STORAGE_KEYS.INVOICES, items);
      return items.length < prevLen;
    },

    // -----------------------------------------------------------------------
    // TESTIMONIALS & REVIEWS MANAGER
    // -----------------------------------------------------------------------
    getTestimonials(filter) {
      const items = getJSON(STORAGE_KEYS.TESTIMONIALS, SEED_TESTIMONIALS);
      if (!filter || filter === 'all') return items;
      if (filter === 'approved') return items.filter(t => t.approved);
      if (filter === 'pending') return items.filter(t => !t.approved);
      return items;
    },

    getApprovedTestimonials() {
      return this.getTestimonials('approved');
    },

    saveTestimonial(testimonial) {
      const items = getJSON(STORAGE_KEYS.TESTIMONIALS, []);
      if (testimonial.id) {
        const index = items.findIndex(t => t.id === testimonial.id);
        if (index >= 0) {
          items[index] = { ...items[index], ...testimonial, updatedAt: new Date().toISOString() };
          setJSON(STORAGE_KEYS.TESTIMONIALS, items);
          return items[index];
        }
      }

      const newTesti = {
        id: 'testi-' + Date.now().toString(36),
        name: testimonial.name || 'Client',
        role: testimonial.role || 'Partner',
        organization: testimonial.organization || 'Tumakuru',
        rating: parseInt(testimonial.rating, 10) || 5,
        content: testimonial.content || '',
        date: testimonial.date || new Date().toISOString().slice(0, 10),
        approved: typeof testimonial.approved === 'boolean' ? testimonial.approved : true
      };

      items.unshift(newTesti);
      setJSON(STORAGE_KEYS.TESTIMONIALS, items);
      return newTesti;
    },

    deleteTestimonial(id) {
      let items = getJSON(STORAGE_KEYS.TESTIMONIALS, []);
      const prevLen = items.length;
      items = items.filter(t => t.id !== id);
      setJSON(STORAGE_KEYS.TESTIMONIALS, items);
      return items.length < prevLen;
    },

    toggleTestimonialApproval(id) {
      const items = getJSON(STORAGE_KEYS.TESTIMONIALS, []);
      const item = items.find(t => t.id === id);
      if (item) {
        item.approved = !item.approved;
        setJSON(STORAGE_KEYS.TESTIMONIALS, items);
        return item.approved;
      }
      return false;
    },

    // -----------------------------------------------------------------------
    // PRICING & DIAGNOSTICS CATALOG
    // -----------------------------------------------------------------------
    getCatalog(categoryFilter) {
      const items = getJSON(STORAGE_KEYS.CATALOG, SEED_CATALOG);
      if (!categoryFilter || categoryFilter === 'all') return items;
      return items.filter(c => c.category && c.category.toLowerCase() === categoryFilter.toLowerCase());
    },

    saveCatalogItem(item) {
      const items = getJSON(STORAGE_KEYS.CATALOG, []);
      if (item.id) {
        const index = items.findIndex(c => c.id === item.id);
        if (index >= 0) {
          items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
          setJSON(STORAGE_KEYS.CATALOG, items);
          return items[index];
        }
      }

      const newItem = {
        id: 'cat-' + Date.now().toString(36),
        title: item.title || 'Technical Solution',
        category: item.category || 'Hardware & Repair',
        basePrice: parseFloat(item.basePrice) || 999,
        turnaround: item.turnaround || '1 - 2 Days',
        description: item.description || '',
        active: typeof item.active === 'boolean' ? item.active : true
      };

      items.unshift(newItem);
      setJSON(STORAGE_KEYS.CATALOG, items);
      return newItem;
    },

    deleteCatalogItem(id) {
      let items = getJSON(STORAGE_KEYS.CATALOG, []);
      const prevLen = items.length;
      items = items.filter(c => c.id !== id);
      setJSON(STORAGE_KEYS.CATALOG, items);
      return items.length < prevLen;
    },

    // -----------------------------------------------------------------------
    // PRIVACY-FIRST MICRO ANALYTICS
    // -----------------------------------------------------------------------
    getAnalytics() {
      return getJSON(STORAGE_KEYS.ANALYTICS, SEED_ANALYTICS);
    },

    recordAnalyticsEvent(type, meta = {}) {
      const a = this.getAnalytics();
      if (type === 'visit') a.visits = (a.visits || 0) + 1;
      else if (type === 'whatsapp_click') a.whatsappClicks = (a.whatsappClicks || 0) + 1;
      else if (type === 'brochure_download') a.brochureDownloads = (a.brochureDownloads || 0) + 1;
      else if (type === 'inquiry_submission') a.inquirySubmissions = (a.inquirySubmissions || 0) + 1;

      if (!Array.isArray(a.eventLog)) a.eventLog = [];
      a.eventLog.unshift({
        type,
        timestamp: new Date().toISOString(),
        ...meta
      });

      // Keep event log bounded to last 100 entries
      if (a.eventLog.length > 100) a.eventLog.length = 100;
      a.lastUpdated = new Date().toISOString();

      setJSON(STORAGE_KEYS.ANALYTICS, a);
      return a;
    },

    // -----------------------------------------------------------------------
    // SETTINGS & CONFIGURATION
    // -----------------------------------------------------------------------
    getSettings() {
      return getJSON(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    },

    saveSettings(newSettings) {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
      setJSON(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    },

    // -----------------------------------------------------------------------
    // PROJECTS & PORTFOLIO
    // -----------------------------------------------------------------------
    getProjects() {
      return getJSON(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    },

    saveProject(project) {
      const items = getJSON(STORAGE_KEYS.PROJECTS, []);
      if (project.id) {
        const index = items.findIndex(p => p.id === project.id);
        if (index >= 0) {
          items[index] = { ...items[index], ...project, updatedAt: new Date().toISOString() };
          setJSON(STORAGE_KEYS.PROJECTS, items);
          return items[index];
        }
      }
      const newProj = {
        id: 'proj-' + Date.now().toString(36),
        title: project.title || 'Untitled Project',
        category: project.category || 'Software Development',
        description: project.description || '',
        image: project.image || 'assets/hero.webp',
        tags: Array.isArray(project.tags) ? project.tags : (project.tags ? project.tags.split(',').map(t => t.trim()) : ['Tech']),
        liveUrl: project.liveUrl || '',
        featured: !!project.featured,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      items.unshift(newProj);
      setJSON(STORAGE_KEYS.PROJECTS, items);
      return newProj;
    },

    deleteProject(id) {
      let items = getJSON(STORAGE_KEYS.PROJECTS, []);
      const prevLen = items.length;
      items = items.filter(p => p.id !== id);
      setJSON(STORAGE_KEYS.PROJECTS, items);
      return items.length < prevLen;
    },

    // -----------------------------------------------------------------------
    // ACADEMY WORKSHOPS
    // -----------------------------------------------------------------------
    getWorkshops() {
      return getJSON(STORAGE_KEYS.WORKSHOPS, SEED_WORKSHOPS);
    },

    saveWorkshop(workshop) {
      const items = getJSON(STORAGE_KEYS.WORKSHOPS, []);
      if (workshop.id) {
        const index = items.findIndex(w => w.id === workshop.id);
        if (index >= 0) {
          items[index] = { ...items[index], ...workshop };
          setJSON(STORAGE_KEYS.WORKSHOPS, items);
          return items[index];
        }
      }
      const newWorkshop = {
        id: 'ws-' + Date.now().toString(36),
        title: workshop.title || 'Specialized Technical Workshop',
        track: workshop.track || 'Artificial Intelligence & ML',
        institution: workshop.institution || 'Engineering College',
        date: workshop.date || new Date().toISOString().slice(0, 10),
        duration: workshop.duration || '2 Days',
        seatsTotal: parseInt(workshop.seatsTotal || 100, 10),
        seatsEnrolled: parseInt(workshop.seatsEnrolled || 0, 10),
        status: workshop.status || 'Open for Registration'
      };
      items.unshift(newWorkshop);
      setJSON(STORAGE_KEYS.WORKSHOPS, items);
      return newWorkshop;
    },

    deleteWorkshop(id) {
      let items = getJSON(STORAGE_KEYS.WORKSHOPS, []);
      items = items.filter(w => w.id !== id);
      setJSON(STORAGE_KEYS.WORKSHOPS, items);
      return true;
    },

    // -----------------------------------------------------------------------
    // STUDENT CERTIFICATES (ISSUANCE & VERIFICATION)
    // -----------------------------------------------------------------------
    getCertificates() {
      return getJSON(STORAGE_KEYS.CERTIFICATES, SEED_CERTIFICATES);
    },

    generateCertificateId(trackCode) {
      const yr = new Date().getFullYear();
      const code = (trackCode || 'ENG').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'ENG';
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `AX-${yr}-${code}-${rand}`;
    },

    issueCertificate(cert) {
      const items = getJSON(STORAGE_KEYS.CERTIFICATES, []);
      const newCert = {
        id: cert.id || this.generateCertificateId(cert.track ? cert.track.slice(0, 4) : 'AX'),
        studentName: cert.studentName || 'Student Name',
        institution: cert.institution || 'AarambhX Academy',
        track: cert.track || 'Artificial Intelligence & ML',
        issueDate: cert.issueDate || new Date().toISOString().slice(0, 10),
        grade: cert.grade || 'First Class with Distinction',
        status: 'Verified'
      };
      items.unshift(newCert);
      setJSON(STORAGE_KEYS.CERTIFICATES, items);
      return newCert;
    },

    verifyCertificate(certId) {
      if (!certId) return null;
      const cleanId = String(certId).trim().toUpperCase();
      const items = getJSON(STORAGE_KEYS.CERTIFICATES, SEED_CERTIFICATES);
      return items.find(c => c.id.toUpperCase() === cleanId) || null;
    },

    revokeCertificate(certId) {
      const items = getJSON(STORAGE_KEYS.CERTIFICATES, []);
      const found = items.find(c => c.id.toUpperCase() === String(certId).trim().toUpperCase());
      if (found) {
        found.status = 'Revoked';
        setJSON(STORAGE_KEYS.CERTIFICATES, items);
        return true;
      }
      return false;
    },

    // -----------------------------------------------------------------------
    // REELS & HIGHLIGHTS
    // -----------------------------------------------------------------------
    getReels() {
      return getJSON(STORAGE_KEYS.REELS, [
        {
          id: 'reel-1',
          title: 'A Day at BIEC Bengaluru: Electronica India 2026',
          category: 'Robotics & Edge AI',
          url: 'https://www.instagram.com/reel/DdZJtHavGHu/?stkn=aTY5ZzU4djNsc3dr',
          embedUrl: 'https://www.instagram.com/reel/DdZJtHavGHu/embed/',
          caption: 'Discovering the latest breakthroughs in Edge AI, robotics, industrial electronics, and automation at BIEC Bengaluru.',
          views: '2.4K+'
        },
        {
          id: 'reel-2',
          title: 'Unboxed. Powered Up. Ready to Perform: Lenovo AMD Ryzen-5 Setup',
          category: 'Hardware & PC Setup',
          url: 'https://www.instagram.com/reel/Ddatp9hvGxd/?stkn=MW1uanVlcWgzd2FoMA==',
          embedUrl: 'https://www.instagram.com/reel/Ddatp9hvGxd/embed/',
          caption: 'Premium Lenovo setup powered by AMD Ryzen-5 engineered for smooth performance, productivity, and everyday hustle.',
          views: '3.8K+'
        }
      ]);
    },

    saveReel(reel) {
      const items = getJSON(STORAGE_KEYS.REELS, []);
      const newReel = {
        id: reel.id || 'reel-' + Date.now().toString(36),
        title: reel.title || 'Campus Reel',
        category: reel.category || 'Workshop',
        url: reel.url || '',
        embedUrl: reel.embedUrl || '',
        caption: reel.caption || '',
        views: reel.views || '1K+'
      };
      items.unshift(newReel);
      setJSON(STORAGE_KEYS.REELS, items);
      return newReel;
    },

    deleteReel(id) {
      let items = getJSON(STORAGE_KEYS.REELS, []);
      items = items.filter(r => r.id !== id);
      setJSON(STORAGE_KEYS.REELS, items);
      return true;
    },

    // -----------------------------------------------------------------------
    // LIVE ALERT & ANNOUNCEMENT BANNER
    // -----------------------------------------------------------------------
    getAlertBanner() {
      return getJSON(STORAGE_KEYS.BANNER, {
        active: false,
        text: '',
        ctaText: 'Learn More',
        ctaLink: '#',
        tone: 'gold',
        theme: 'gold',
        badgeText: 'LIVE NOW',
        badgePulse: true,
        countdownDate: '',
        enableCountdown: false,
        pageScope: 'all',
        updatedAt: ''
      });
    },

    saveAlertBanner(banner) {
      const updated = {
        active: !!banner.active,
        text: banner.text || '',
        ctaText: banner.ctaText || 'Learn More',
        ctaLink: banner.ctaLink || '#',
        tone: banner.tone || banner.theme || 'gold',
        theme: banner.theme || banner.tone || 'gold',
        badgeText: banner.badgeText !== undefined ? banner.badgeText : 'LIVE NOW',
        badgePulse: banner.badgePulse !== undefined ? !!banner.badgePulse : true,
        countdownDate: banner.countdownDate || '',
        enableCountdown: !!banner.enableCountdown,
        pageScope: banner.pageScope || 'all',
        updatedAt: new Date().toISOString()
      };
      setJSON(STORAGE_KEYS.BANNER, updated);
      return updated;
    },

    // -----------------------------------------------------------------------
    // BLOG & ENGINEERING JOURNAL CMS
    // -----------------------------------------------------------------------
    getBlogPosts(categoryFilter, statusFilter) {
      let posts = getJSON(STORAGE_KEYS.BLOG, null);
      if (!posts || !Array.isArray(posts) || !posts.length) {
        posts = SEED_BLOG_POSTS;
        setJSON(STORAGE_KEYS.BLOG, posts);
      } else {
        let changed = false;
        const deprecatedSlugs = [
          'autonomous-agents-hermes-grok-tools',
          'esp32-lorawan-smart-agriculture',
          'high-performance-fullstack-architecture',
          'case-study-enterprise-campus-lan'
        ];
        const filtered = posts.filter(p => !deprecatedSlugs.includes(p.slug));
        if (filtered.length !== posts.length) {
          posts = filtered;
          changed = true;
        }
        SEED_BLOG_POSTS.forEach(seed => {
          if (!posts.some(p => p.slug === seed.slug)) {
            posts.push(seed);
            changed = true;
          }
        });
        if (changed) {
          setJSON(STORAGE_KEYS.BLOG, posts);
        }
      }
      let result = [...posts];
      if (categoryFilter && categoryFilter !== 'all') {
        result = result.filter(p => p.categorySlug === categoryFilter || p.category === categoryFilter);
      }
      if (statusFilter && statusFilter !== 'all') {
        result = result.filter(p => (p.status || 'Published').toLowerCase() === statusFilter.toLowerCase());
      }
      return result;
    },

    getBlogPostBySlug(slug) {
      if (!slug) return null;
      const posts = this.getBlogPosts();
      let found = posts.find(p => p.slug === slug || String(p.id) === String(slug));
      if (!found && slug === 'autonomous-ai-agents-rag') {
        found = posts.find(p => p.slug === 'autonomous-multi-agent-mcp-orchestration');
      }
      return found || null;
    },

    getBlogPostById(id) {
      if (!id) return null;
      const posts = this.getBlogPosts();
      return posts.find(p => String(p.id) === String(id)) || null;
    },

    saveBlogPost(post) {
      let posts = this.getBlogPosts();
      const slug = (post.slug || post.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const now = new Date().toISOString().split('T')[0];

      if (post.id) {
        const idx = posts.findIndex(p => String(p.id) === String(post.id));
        if (idx !== -1) {
          posts[idx] = {
            ...posts[idx],
            ...post,
            slug: slug || posts[idx].slug,
            updatedAt: new Date().toISOString()
          };
          setJSON(STORAGE_KEYS.BLOG, posts);
          this.logAuditEvent('BLOG_UPDATED', { id: post.id, title: post.title });
          return posts[idx];
        }
      }

      const newPost = {
        id: 'blog-' + Date.now(),
        slug: slug || ('article-' + Date.now()),
        title: post.title || 'Untitled Article',
        summary: post.summary || '',
        content: post.content || '',
        category: post.category || 'AI & Generative Tech',
        categorySlug: post.categorySlug || 'ai-tech',
        author: post.author || 'Lalith H & AarambhX AI Lab',
        authorRole: post.authorRole || 'Founder & Principal Systems Architect',
        authorAvatar: post.authorAvatar || 'assets/aarambhx-logo.jpg',
        readTime: post.readTime || '4 min read',
        date: post.date || now,
        views: post.views || 0,
        featured: !!post.featured,
        status: post.status || 'Published',
        tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',').map(t => t.trim()) : []),
        metaDescription: post.metaDescription || '',
        image: post.image || 'assets/hero.webp',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      posts.unshift(newPost);
      setJSON(STORAGE_KEYS.BLOG, posts);
      this.logAuditEvent('BLOG_CREATED', { id: newPost.id, title: newPost.title });
      return newPost;
    },

    deleteBlogPost(id) {
      let posts = this.getBlogPosts();
      const filtered = posts.filter(p => String(p.id) !== String(id));
      setJSON(STORAGE_KEYS.BLOG, filtered);
      this.logAuditEvent('BLOG_DELETED', { id });
      return true;
    },

    incrementBlogPostViews(slugOrId) {
      let posts = this.getBlogPosts();
      const post = posts.find(p => p.slug === slugOrId || String(p.id) === String(slugOrId));
      if (post) {
        post.views = (post.views || 0) + 1;
        setJSON(STORAGE_KEYS.BLOG, posts);
        return post.views;
      }
      return 0;
    },

    // -----------------------------------------------------------------------
    // METRICS / DASHBOARD SUMMARY
    // -----------------------------------------------------------------------
    getDashboardMetrics() {
      const inquiries = this.getInquiries();
      const projects = this.getProjects();
      const workshops = this.getWorkshops();
      const certificates = this.getCertificates();
      const invoices = this.getInvoices();
      const testimonials = this.getTestimonials();
      const analytics = this.getAnalytics();

      const newLeads = inquiries.filter(i => i.status === 'New').length;
      const contactedLeads = inquiries.filter(i => i.status === 'Contacted').length;
      const enrolledStudents = workshops.reduce((acc, w) => acc + (parseInt(w.seatsEnrolled, 10) || 0), 0);

      const paidInvoices = invoices.filter(i => i.status === 'Paid');
      const totalPaidAmount = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
      const visits = analytics.visits || 1;
      const conversionRate = Math.min(100, Math.round(((inquiries.length || 0) / visits) * 100));

      return {
        totalLeads: inquiries.length,
        newLeads,
        contactedLeads,
        totalProjects: projects.length,
        featuredProjects: projects.filter(p => p.featured).length,
        totalWorkshops: workshops.length,
        enrolledStudents,
        totalCertificates: certificates.length,
        totalInvoices: invoices.length,
        totalPaidAmount,
        totalTestimonials: testimonials.length,
        approvedTestimonials: testimonials.filter(t => t.approved).length,
        visits: analytics.visits || 0,
        whatsappClicks: analytics.whatsappClicks || 0,
        brochureDownloads: analytics.brochureDownloads || 0,
        conversionRate
      };
    },

    // -----------------------------------------------------------------------
    // EXPORT, BACKUP & RESTORE
    // -----------------------------------------------------------------------
    exportAllJSON() {
      return JSON.stringify({
        version: '3.0.0',
        brand: 'AarambhX Technology',
        exportedAt: new Date().toISOString(),
        inquiries: this.getInquiries(),
        projects: this.getProjects(),
        workshops: this.getWorkshops(),
        certificates: this.getCertificates(),
        reels: this.getReels(),
        banner: this.getAlertBanner(),
        invoices: this.getInvoices(),
        testimonials: this.getTestimonials(),
        catalog: this.getCatalog(),
        analytics: this.getAnalytics(),
        settings: this.getSettings(),
        auditTrail: this.getAuditTrail(),
        blogPosts: this.getBlogPosts()
      }, null, 2);
    },

    exportFullBackup() {
      return this.exportAllJSON();
    },

    importFullBackup(jsonString) {
      if (!jsonString) return { success: false, message: 'Empty backup data' };
      try {
        const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        if (!data || typeof data !== 'object') {
          return { success: false, message: 'Invalid JSON format' };
        }

        if (Array.isArray(data.inquiries)) setJSON(STORAGE_KEYS.INQUIRIES, data.inquiries);
        if (Array.isArray(data.projects)) setJSON(STORAGE_KEYS.PROJECTS, data.projects);
        if (Array.isArray(data.workshops)) setJSON(STORAGE_KEYS.WORKSHOPS, data.workshops);
        if (Array.isArray(data.certificates)) setJSON(STORAGE_KEYS.CERTIFICATES, data.certificates);
        if (Array.isArray(data.reels)) setJSON(STORAGE_KEYS.REELS, data.reels);
        if (Array.isArray(data.invoices)) setJSON(STORAGE_KEYS.INVOICES, data.invoices);
        if (Array.isArray(data.testimonials)) setJSON(STORAGE_KEYS.TESTIMONIALS, data.testimonials);
        if (Array.isArray(data.catalog)) setJSON(STORAGE_KEYS.CATALOG, data.catalog);
        if (Array.isArray(data.blogPosts)) setJSON(STORAGE_KEYS.BLOG, data.blogPosts);
        if (Array.isArray(data.auditTrail)) setJSON(STORAGE_KEYS.AUDIT, data.auditTrail);
        if (data.banner && typeof data.banner === 'object') setJSON(STORAGE_KEYS.BANNER, data.banner);
        if (data.analytics && typeof data.analytics === 'object') setJSON(STORAGE_KEYS.ANALYTICS, data.analytics);
        if (data.settings && typeof data.settings === 'object') setJSON(STORAGE_KEYS.SETTINGS, data.settings);

        this.logAuditEvent('BACKUP_RESTORED', { timestamp: new Date().toISOString() });
        return { success: true, message: 'Backup restored successfully' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    resetToFactoryDefaults() {
      setJSON(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
      setJSON(STORAGE_KEYS.WORKSHOPS, SEED_WORKSHOPS);
      setJSON(STORAGE_KEYS.CERTIFICATES, SEED_CERTIFICATES);
      setJSON(STORAGE_KEYS.INQUIRIES, SEED_INQUIRIES);
      setJSON(STORAGE_KEYS.INVOICES, SEED_INVOICES);
      setJSON(STORAGE_KEYS.TESTIMONIALS, SEED_TESTIMONIALS);
      setJSON(STORAGE_KEYS.CATALOG, SEED_CATALOG);
      setJSON(STORAGE_KEYS.BLOG, SEED_BLOG_POSTS);
      setJSON(STORAGE_KEYS.ANALYTICS, SEED_ANALYTICS);
      setJSON(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
      setJSON(STORAGE_KEYS.AUDIT, []);
      setJSON(STORAGE_KEYS.BANNER, {
        active: false,
        text: '🚀 Admissions open for AarambhX Academy 2026 Industrial Workshops! Early registrations get complimentary IoT hardware kits.',
        ctaText: 'Explore Workshops',
        ctaLink: 'academy.html#workshops',
        tone: 'blue'
      });
      this.logAuditEvent('FACTORY_RESET', { timestamp: new Date().toISOString() });
      return true;
    }
  };

  // Auto initialize defaults
  Store.init();

  return Store;
}));
