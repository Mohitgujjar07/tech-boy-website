// ============================================================
// TECH BOY SOLUTIONS — SITE CONFIGURATION
// Edit this file to update all website content.
// ============================================================
//
// HOW TO USE THIS FILE:
// ─────────────────────────────────────────────────────────────
// This is the single source of truth for all website content.
// To update any text, data, or configuration on the site,
// simply edit the relevant value in this file and save.
//
// BEFORE GOING LIVE:
//   1. Replace all 'YOUR_*' placeholders in company{} with
//      your real contact details.
//   2. Add social media profile URLs in company.social{}.
//   3. Add real projects to portfolio.projects[] and set
//      portfolio.comingSoon to false.
//   4. Replace assets/og-image.png with your actual OG image.
//
// DO NOT change the property names (keys) — only the values.
// ─────────────────────────────────────────────────────────────

const TBS_CONFIG = {

  // ----------------------------------------------------------
  // COMPANY INFORMATION
  // ----------------------------------------------------------
  company: {
    name: 'Tech Boy Solutions',
    tagline: 'Your Technology. Our Solution.',
    taglineAlt: 'Software. Hardware. Networking. IoT. IT Support.',
    description: 'Tech Boy Solutions is a complete technology service and solutions company providing software development, digital solutions, hardware services, networking, IoT development, IT support and technology consulting under one roof in Tumakuru, Karnataka.',
    phone: '+91 63647 68498',
    phoneRaw: '6364768498',
    whatsapp: '916364768498',
    whatsappDisplay: '+91 63647 68498',
    whatsappMessage: 'Hello Tech Boy Solutions, I would like to know more about your services.',
    email: 'lalithulalu@gmail.com',
    emailAlt: 'lalithlalu.com@yahoo.com',
    city: 'Tumakuru',
    state: 'Karnataka',
    country: 'India',
    location: 'Tumakuru, Karnataka, India',
    businessHours: 'Mon – Sat: 9:00 AM – 8:00 PM (24/7 Tech Support)',
    social: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      youtube: '',
    },
  },

  // ----------------------------------------------------------
  // SEO & META TAGS
  // ----------------------------------------------------------
  seo: {
    title: 'Tech Boy Solutions | Software, Hardware, Networking & IT Solutions',
    description: 'Tech Boy Solutions provides website development, custom software, computer repair, custom PC builds, networking, Wi-Fi, IoT projects, IT support and technology solutions.',
    keywords: 'Tech Boy Solutions, software solutions, website development, website design, custom software, computer repair, laptop repair, PC repair, custom PC build, networking services, Wi-Fi setup, router configuration, IoT projects, final year projects, Excel solutions, PowerPoint design, IT support, technology solutions',
    ogImage: 'assets/og-image.png',
  },

  // ----------------------------------------------------------
  // TRUST / STATS STRIP
  // ----------------------------------------------------------
  trustStats: [
    { value: '100%', label: 'Customer-Focused', sub: 'Solutions built around your needs' },
    { value: '2', label: 'Technology Divisions', sub: 'Software + Hardware' },
    { value: '24/7', label: 'Technical Support', sub: 'We are here when you need us' },
    { value: 'End-to-End', label: 'Technology Services', sub: 'From planning to deployment' },
  ],

  // ----------------------------------------------------------
  // SERVICE CATEGORIES (used for navigation / filter tabs)
  // ----------------------------------------------------------
  serviceCategories: [
    { id: 'software', icon: 'code-2', label: 'Software & Websites', emoji: '💻' },
    { id: 'repair', icon: 'wrench', label: 'Computer Repair', emoji: '🛠️' },
    { id: 'custom-pc', icon: 'cpu', label: 'Custom PC Build', emoji: '🖥️' },
    { id: 'networking', icon: 'wifi', label: 'Networking & Wi-Fi', emoji: '🌐' },
    { id: 'iot', icon: 'radio', label: 'IoT Projects', emoji: '📡' },
    { id: 'student', icon: 'graduation-cap', label: 'Student Projects', emoji: '🎓' },
    { id: 'office', icon: 'file-spreadsheet', label: 'Excel / Word / PPT', emoji: '📊' },
    { id: 'design', icon: 'palette', label: 'Design', emoji: '🎨' },
    { id: 'testing', icon: 'test-tube-2', label: 'Software Testing', emoji: '🧪' },
    { id: 'support', icon: 'headphones', label: 'IT Support', emoji: '🔧' },
  ],

  // ----------------------------------------------------------
  // SOFTWARE SERVICES
  // ----------------------------------------------------------
  softwareServices: [
    {
      id: 'web-dev',
      icon: 'globe',
      title: 'Website Development',
      description: 'Professional websites built for businesses, institutions, portfolios and every digital need.',
      features: [
        'Business & Corporate Websites',
        'Portfolio & Personal Websites',
        'E-commerce Websites',
        'Landing Pages',
        'Admin Dashboards',
        'Responsive Design',
        'Website Redesign & Maintenance',
        'Educational & Institutional Websites',
      ],
      cta: 'Build My Website',
      ctaSection: 'contact',
    },
    {
      id: 'portfolio',
      icon: 'user-circle',
      title: 'Personal Portfolio Websites',
      description: 'Stand out online with a professional personal website that showcases your skills, projects and professional identity.',
      features: [
        'Students & Graduates',
        'Developers & Designers',
        'Freelancers & Professionals',
        'Job Seekers & Creators',
        'Resume Website',
        'Project Showcase',
        'Domain & Hosting Setup',
      ],
      cta: 'Create My Portfolio',
      ctaSection: 'contact',
    },
    {
      id: 'custom-software',
      icon: 'code-2',
      title: 'Custom Software Development',
      description: 'Purpose-built software solutions designed around your specific business workflow and requirements.',
      features: [
        'Business Management Systems',
        'Inventory & Billing Systems',
        'Attendance Systems',
        'Visitor Management',
        'Student Management Systems',
        'Booking & Scheduling Systems',
        'Data Management Dashboards',
        'Internal Business Tools',
      ],
      cta: 'Discuss My Project',
      ctaSection: 'contact',
    },
    {
      id: 'office-solutions',
      icon: 'file-spreadsheet',
      title: 'Office & Productivity Solutions',
      description: 'We help individuals, students and businesses turn everyday Office tasks into organized, professional and efficient digital workflows.',
      features: [
        'Advanced Excel Sheets & Formulas',
        'Excel Automation & Dashboards',
        'Data Organization & Reports',
        'Professional Word Documents',
        'Document Templates',
        'PowerPoint Presentations',
        'Presentation Design',
        'Business & Academic Documents',
      ],
      cta: 'Get Office Help',
      ctaSection: 'contact',
    },
    {
      id: 'design',
      icon: 'palette',
      title: 'UI/UX & Graphic Design',
      description: 'Visually compelling interfaces and graphics that communicate your brand effectively.',
      features: [
        'Website & App UI Design',
        'Dashboard Design',
        'Mobile Interface Design',
        'Poster & Social Media Graphics',
        'Business Graphics',
        'Presentation Design',
        'Basic Branding & Identity',
      ],
      cta: 'Start a Design Project',
      ctaSection: 'contact',
    },
    {
      id: 'testing',
      icon: 'test-tube-2',
      title: 'Software Testing & QA',
      description: 'Rigorous quality assurance to ensure your software works correctly, consistently and reliably.',
      features: [
        'Functional & UI Testing',
        'Cross-Browser Testing',
        'Responsive Testing',
        'Usability Testing',
        'Bug Identification & Reporting',
        'Regression Testing',
        'Performance Checks',
        'Pre-Deployment Testing',
      ],
      cta: 'Request QA Review',
      ctaSection: 'contact',
    },
    {
      id: 'maintenance',
      icon: 'refresh-cw',
      title: 'Website Maintenance & Support',
      description: 'Keep your website up-to-date, secure and running at its best with ongoing technical support.',
      features: [
        'Bug Fixing & Troubleshooting',
        'Content & Feature Updates',
        'Performance Improvements',
        'Security Updates',
        'Backup Assistance',
        'Hosting & Domain Support',
        'Technical Troubleshooting',
      ],
      cta: 'Maintain My Website',
      ctaSection: 'contact',
    },
  ],

  // ----------------------------------------------------------
  // HARDWARE SERVICES
  // ----------------------------------------------------------
  hardwareServices: [
    {
      id: 'laptop-repair',
      icon: 'laptop',
      title: 'Laptop Repair & Service',
      description: 'Professional diagnosis and repair support for laptop hardware and software issues.',
      features: [
        'Hardware Diagnosis',
        'Software Troubleshooting',
        'OS Installation & Configuration',
        'Performance Optimization',
        'RAM & Storage Upgrades',
        'General Maintenance & Cleaning',
        'Configuration Support',
      ],
      cta: 'Fix My Laptop',
      ctaSection: 'contact',
    },
    {
      id: 'desktop-repair',
      icon: 'monitor',
      title: 'Desktop / PC Repair',
      description: 'Complete desktop computer troubleshooting, servicing and upgrade support.',
      features: [
        'Hardware Diagnosis & Repair',
        'Windows & Software Setup',
        'RAM & SSD Upgrades',
        'Storage Expansion',
        'Power Supply Troubleshooting',
        'Performance Optimization',
        'General Maintenance',
      ],
      cta: 'Fix My Desktop',
      ctaSection: 'contact',
    },
    {
      id: 'custom-pc',
      icon: 'cpu',
      title: 'Custom PC Building',
      description: 'Need a PC built for a specific purpose? We help select compatible components and assemble systems based on your performance requirements and budget.',
      features: [
        'Office & Student PCs',
        'Programming & Design PCs',
        'Video Editing Workstations',
        'Component Selection & Compatibility',
        'Professional Assembly',
        'BIOS & OS Configuration',
        'Driver Installation & Testing',
        'Upgrade Recommendations',
      ],
      cta: 'Build My PC',
      ctaSection: 'contact',
      featured: true,
    },
    {
      id: 'upgrades',
      icon: 'trending-up',
      title: 'Computer Upgrades',
      description: 'Maximize the performance of your existing computer with targeted hardware upgrades.',
      features: [
        'RAM Upgrade',
        'SSD Installation',
        'HDD/SSD Replacement',
        'Storage Expansion',
        'Performance Optimization',
        'OS Fresh Installation',
        'Driver Configuration',
      ],
      cta: 'Upgrade My Computer',
      ctaSection: 'contact',
    },
  ],

  // ----------------------------------------------------------
  // NETWORKING SERVICES
  // ----------------------------------------------------------
  networkingServices: [
    {
      id: 'lan',
      icon: 'network',
      title: 'Network Installation',
      description: 'Complete LAN and office network setup with structured cabling and ethernet wiring.',
      features: [
        'Office & Home Networking',
        'Structured Cabling',
        'Ethernet Wiring',
        'Network Point Installation',
        'Small Business LAN',
      ],
    },
    {
      id: 'router',
      icon: 'router',
      title: 'Router Configuration',
      description: 'Professional router setup and configuration for reliable, secure connectivity.',
      features: [
        'Wi-Fi Router Setup',
        'SSID & Security Configuration',
        'DHCP Configuration',
        'Firmware Updates',
        'Basic Network Configuration',
      ],
    },
    {
      id: 'wifi',
      icon: 'wifi',
      title: 'Wi-Fi Solutions',
      description: 'Improve your wireless coverage, eliminate dead zones and optimize your Wi-Fi network.',
      features: [
        'Wi-Fi Setup & Optimization',
        'Coverage Improvement',
        'Access Point Installation',
        'Dead-Zone Troubleshooting',
        'Multi-Router Configuration',
      ],
    },
    {
      id: 'net-troubleshoot',
      icon: 'search',
      title: 'Network Troubleshooting',
      description: 'Diagnosing and resolving internet, LAN and device connectivity issues.',
      features: [
        'Internet Connectivity Issues',
        'Router & LAN Issues',
        'IP Configuration Problems',
        'Device Connectivity',
        'Network Performance',
      ],
    },
    {
      id: 'office-network',
      icon: 'building-2',
      title: 'Small Office Network Setup',
      description: 'End-to-end office network solutions — from planning to full installation and configuration.',
      features: [
        'Router & Switch Setup',
        'Access Points',
        'Ethernet Cabling',
        'PC & Printer Integration',
        'Full Network Configuration',
      ],
      featured: true,
    },
  ],

  // ----------------------------------------------------------
  // IOT SERVICES (simple list)
  // ----------------------------------------------------------
  iotServices: [
    'IoT Project Development',
    'Sensor-Based Projects',
    'Automation Projects',
    'Arduino & ESP32 Projects',
    'ESP8266 & Raspberry Pi Projects',
    'Sensor Integration',
    'Hardware-Software Integration',
    'IoT Dashboards',
    'Cloud-Connected IoT Systems',
    'Data Monitoring Systems',
    'Prototype Development',
  ],

  // ----------------------------------------------------------
  // STUDENT PROJECT CATEGORIES
  // ----------------------------------------------------------
  studentProjectCategories: [
    {
      icon: 'code-2',
      title: 'Software Projects',
      items: ['Web Applications', 'Mobile App Integration', 'Management Systems', 'AI-Assisted Applications'],
    },
    {
      icon: 'cpu',
      title: 'Hardware Projects',
      items: ['Arduino', 'ESP32 & ESP8266', 'Sensor Systems', 'Embedded Systems'],
    },
    {
      icon: 'radio',
      title: 'IoT Projects',
      items: ['Smart Monitoring', 'Automation Systems', 'Remote Control', 'Cloud-Connected Devices'],
    },
  ],

  // ----------------------------------------------------------
  // WORK PROCESS STEPS
  // ----------------------------------------------------------
  process: [
    {
      step: '01',
      title: 'Understand',
      description: 'We listen carefully to understand the requirement, problem and expected outcome before suggesting any solution.',
    },
    {
      step: '02',
      title: 'Plan',
      description: 'We determine the right technology, components, architecture and approach for the specific requirement.',
    },
    {
      step: '03',
      title: 'Design',
      description: 'We design the interface, system, network or hardware architecture before any build begins.',
    },
    {
      step: '04',
      title: 'Build',
      description: 'We develop, configure or assemble the required solution with quality and precision.',
    },
    {
      step: '05',
      title: 'Test',
      description: 'We test functionality, compatibility, performance and reliability thoroughly.',
    },
    {
      step: '06',
      title: 'Deploy',
      description: 'We install, configure and launch the solution in the target environment.',
    },
    {
      step: '07',
      title: 'Support',
      description: 'We provide ongoing technical assistance, maintenance and improvements after deployment.',
    },
  ],

  // ----------------------------------------------------------
  // WHY CHOOSE US
  // ----------------------------------------------------------
  whyChooseUs: [
    {
      icon: 'layers',
      title: 'One Technology Partner',
      description: 'Software, hardware, networking and IT services under one roof — no need to deal with multiple vendors.',
    },
    {
      icon: 'target',
      title: 'Practical Solutions',
      description: 'We focus on solutions that actually solve the problem, not generic packages applied to every client.',
    },
    {
      icon: 'sliders',
      title: 'Customized Approach',
      description: 'Every customer has different needs. We tailor our approach to fit your requirement, not a template.',
    },
    {
      icon: 'message-circle',
      title: 'Transparent Communication',
      description: 'Clear, honest communication about requirements, scope, timeline and implementation at every stage.',
    },
    {
      icon: 'piggy-bank',
      title: 'Budget-Conscious',
      description: 'We recommend suitable solutions that match your requirements and budget — not the most expensive option.',
    },
    {
      icon: 'shield-check',
      title: 'End-to-End Support',
      description: 'From planning and implementation to troubleshooting and maintenance — we support you throughout.',
    },
    {
      icon: 'zap',
      title: 'Modern Technology',
      description: 'We use appropriate modern technologies and tools to deliver reliable, up-to-date solutions.',
    },
    {
      icon: 'graduation-cap',
      title: 'Learning-Friendly',
      description: 'For students, we explain solutions clearly and encourage understanding rather than simply providing a finished output.',
    },
  ],

  // ----------------------------------------------------------
  // WHO WE SERVE (AUDIENCES)
  // ----------------------------------------------------------
  audiences: [
    {
      icon: 'graduation-cap',
      title: 'Students',
      description: 'Projects, portfolios, presentations, software and IoT development guidance.',
    },
    {
      icon: 'user',
      title: 'Individuals',
      description: 'Personal websites, computer support, portfolio websites and technology assistance.',
    },
    {
      icon: 'store',
      title: 'Small Businesses',
      description: 'Websites, software, networking, computers and IT support.',
    },
    {
      icon: 'briefcase',
      title: 'Offices',
      description: 'Networking, PC setup, software solutions and ongoing maintenance.',
    },
    {
      icon: 'rocket',
      title: 'Startups',
      description: 'Websites, software, branding, infrastructure and digital solutions.',
    },
    {
      icon: 'school',
      title: 'Educational Institutions',
      description: 'Websites, networking, software systems and technology support.',
    },
    {
      icon: 'badge',
      title: 'Professionals',
      description: 'Portfolio websites, presentations, productivity solutions and digital presence.',
    },
    {
      icon: 'building',
      title: 'Organizations',
      description: 'Custom software, infrastructure setup and technical support.',
    },
  ],

  // ----------------------------------------------------------
  // PORTFOLIO
  // ----------------------------------------------------------
  portfolio: {
    categories: ['All', 'Website', 'Software', 'IoT', 'Hardware', 'Networking', 'Design', 'Student Project'],
    projects: [
      {
        id: 'proj-website',
        title: 'Business & Corporate Portal',
        category: 'Website',
        badge: 'Website Solution',
        desc: 'Modern corporate website featuring service catalogs, lead-generation forms, and responsive mobile architecture.',
        tags: ['Website', 'Responsive', 'React', 'SEO Optimized', 'Tailwind'],
        diagram: ['Frontend Client (Responsive Web)', 'Edge CDN & Security', 'REST API Service', 'Database & Lead Store', 'WhatsApp & Email Dispatch'],
        bom: [
          'High-Speed Modern Frontend Architecture',
          'Responsive Cross-Platform UI Components',
          'Automated Contact & Lead Validation Engine',
          'SSL Certificate & Production DNS Setup',
          'Search Console & Analytics Integration'
        ],
        deliverables: [
          'Production-Ready Clean Source Code',
          'Multi-Device Responsive Testing Suite',
          'Admin Documentation & Setup Guide',
          'Speed & Accessibility Optimization Audit',
          '1-Year Maintenance & Bug-Fix Roadmap'
        ]
      },
      {
        id: 'proj-software',
        title: 'Custom Inventory & Billing System',
        category: 'Software',
        badge: 'Software System',
        desc: 'Tailored web dashboard for tracking shop stock, generating GST invoices, and managing customer ledgers.',
        tags: ['Software', 'Dashboard', 'GST Invoicing', 'SQLite / Cloud', 'Reports'],
        diagram: ['Cashier & Admin Terminal', 'Local / Cloud Database Engine', 'Barcode & Receipt Scanner', 'Invoice PDF Generator Engine', 'Automated Daily Sales Summary'],
        bom: [
          'Desktop & Web Runtime Framework',
          'Local & Cloud Synchronized Database',
          'Thermal Receipt Printer Driver Support',
          'GST Calculation & Tax Rules Engine',
          'Automated Daily Backup Script'
        ],
        deliverables: [
          'Complete Source Code & Installer Package',
          'Database Schema & Initial Setup Scripts',
          'User Manual & Video Walkthrough Guide',
          'Data Backup & Restore Routine',
          'Staff Training & Onboarding Assistance'
        ]
      },
      {
        id: 'proj-hardware',
        title: 'Creator & Video Editing PC Assembly',
        category: 'Hardware',
        badge: 'Hardware Build',
        desc: 'Optimized workstation featuring balanced multi-core CPU, fast NVMe Gen4 storage, and thermal cooling.',
        tags: ['Hardware', 'Custom PC', 'Multi-Core CPU', 'NVMe Gen4', 'Thermal Tuned'],
        diagram: ['Clean Power Delivery (80+ Gold PSU)', 'Multi-Core Processor (CPU)', 'Dedicated GPU Acceleration', 'Dual-Channel 32GB RAM', 'Gen4 NVMe 1TB High-Speed Scratch Disk'],
        bom: [
          'Latest Gen AMD Ryzen / Intel Core CPU',
          '32GB / 64GB DDR4/DDR5 Dual-Channel RAM',
          '1TB PCIe 4.0 NVMe SSD (7000 MB/s)',
          'Air / Liquid Cooling Thermal Solution',
          '650W - 850W 80 Plus Gold Modular PSU'
        ],
        deliverables: [
          'Professional Cable Management Assembly',
          'BIOS Configuration & XMP/DOCP Profiling',
          'Clean OS & Driver Installation',
          '24-Hour Stress Testing & Thermal Benchmarks',
          '1-Year Hardware Support & Warranty Tracking'
        ]
      },
      {
        id: 'proj-networking',
        title: 'Multi-Desk Office LAN Infrastructure',
        category: 'Networking',
        badge: 'Network Setup',
        desc: 'Cat6 cabling, Gigabit switch deployment, unified Wi-Fi access points, and shared network storage.',
        tags: ['Networking', 'Wi-Fi', 'Cat6 Ethernet', 'Gigabit Switch', 'Network Security'],
        diagram: ['ISP Fiber Modem', 'Dual-Band Gigabit Router / Firewall', '24-Port Gigabit Ethernet Switch', 'Structured Cat6 Patch Panel', 'Unified Wi-Fi Access Points & Client Desks'],
        bom: [
          'D-Link / TP-Link 16/24 Port Gigabit Switch',
          'D-Link / Ubiquiti Dual-Band Access Points',
          'Cat6 100% Solid Copper Structured Cabling',
          'Patch Panel & RJ45 Modular Keystones',
          'Network Rack & Cable Organizers'
        ],
        deliverables: [
          'Complete Cable Testing & Fluke Certification',
          'Router Firewall & Guest Wi-Fi Isolation',
          'Shared Network Printer & NAS Mapping',
          'Network Topology Diagram Documentation',
          'On-Site Handover & Troubleshooting Guide'
        ]
      },
      {
        id: 'proj-iot',
        title: 'Cloud-Connected IoT Sensor Station',
        category: 'IoT',
        badge: 'IoT Prototype',
        desc: 'ESP32 microcontroller transmitting multi-sensor metrics over MQTT to a live web monitoring dashboard.',
        tags: ['IoT', 'ESP32', 'MQTT', 'Sensor Array', 'Cloud Telemetry'],
        diagram: ['Physical Environmental Sensors', 'ESP32 Microcontroller Firmware', 'Wi-Fi / MQTT Message Broker', 'Cloud REST & WebSocket API', 'Real-Time Web & Mobile Telemetry UI'],
        bom: [
          'ESP32 NodeMCU 30-Pin Wi-Fi/BLE Board',
          'DHT22 High-Precision Temp/Humidity Sensor',
          'MQ-135 Air Quality / Gas Sensor Module',
          '0.96 inch I2C OLED Display',
          '5V Regulated Power Supply & Breadboard / PCB'
        ],
        deliverables: [
          'Circuit Schematic & Eagle/KiCad Files',
          'Clean Commented ESP32 C++ Code',
          'Full Stack Web Dashboard Source Code',
          'Complete IEEE Standard Project Report',
          '1-on-1 Viva Practice & Demonstration Training'
        ]
      },
      {
        id: 'proj-design',
        title: 'Automated Financial Analytics Sheet',
        category: 'Design',
        badge: 'Productivity System',
        desc: 'Dynamic Excel spreadsheet with automated formulas, KPI summary charts, and printable financial reports.',
        tags: ['Excel', 'Automation', 'VBA / Macros', 'Formulas', 'KPI Dashboards'],
        diagram: ['Raw Transaction & Sales Data Sheet', 'Automated Cleaning & Formula Engine', 'Pivot & Aggregate Summary Tables', 'Dynamic Visual KPI Dashboard Cards', 'Automated PDF / Print Report Generator'],
        bom: [
          'Structured Multi-Tab Workbook Architecture',
          'Advanced Dynamic Array Formulas (XLOOKUP, FILTER, SUMIFS)',
          'Interactive Slicers & Timeline Controllers',
          'Automated VBA Refresh & Export Macros',
          'Color-Coded Executive Presentation Layout'
        ],
        deliverables: [
          'Ready-to-Use Protected Excel Model',
          'Formula & Calculation Documentation',
          'Sample Dataset & Test Template',
          'User Instructions & Short Video Walkthrough',
          'Post-Delivery Formula Customization Support'
        ]
      }
    ],
    comingSoon: false,
  },

  // ----------------------------------------------------------
  // TECH PROBLEMS TICKER (rotating headline problems)
  // ----------------------------------------------------------
  techProblems: [
    'I need a website for my business.',
    'My laptop is very slow.',
    'I need Wi-Fi coverage across my entire office.',
    'I want to build a final-year IoT project.',
    'I need a PC built for video editing.',
    'I want an Excel system to manage my business data.',
    'I need a professional portfolio website.',
    'My router is not working properly.',
  ],

  // ----------------------------------------------------------
  // FREQUENTLY ASKED QUESTIONS
  // ----------------------------------------------------------
  faqs: [
    {
      q: 'Do you only develop websites?',
      a: 'No. We provide a full range of technology services including software development, hardware repair, custom PC building, networking, IoT project development and IT support.',
    },
    {
      q: 'Do you repair laptops and PCs?',
      a: 'Yes. We provide laptop and desktop troubleshooting, servicing, hardware upgrades, OS installation and general computer support.',
    },
    {
      q: 'Can you build a custom PC?',
      a: 'Yes. We help select compatible components based on your workload and budget, and assemble, configure and test the system professionally.',
    },
    {
      q: 'Do you provide networking services?',
      a: 'Yes. We provide LAN setup, Wi-Fi installation, router configuration, access point setup and network troubleshooting for homes, offices and small businesses.',
    },
    {
      q: 'Do you develop IoT projects?',
      a: 'Yes. We work on IoT prototypes including Arduino, ESP32, ESP8266 and Raspberry Pi projects with hardware-software integration.',
    },
    {
      q: 'Do you help students with final-year projects?',
      a: 'Yes. We provide project development support, technical guidance, prototyping, debugging, documentation guidance and demonstration preparation for student projects.',
    },
    {
      q: 'Can you create a personal portfolio website?',
      a: 'Yes. We create professional personal portfolio and resume websites for students, graduates, developers, designers, freelancers and professionals.',
    },
    {
      q: 'Do you provide Excel solutions?',
      a: 'Yes. We provide Excel automation, formulas, dashboards, reports, data organization and productivity solutions for individuals, students and businesses.',
    },
    {
      q: 'Can you maintain an existing website?',
      a: 'Yes. We can provide maintenance, updates, bug fixing, troubleshooting and improvements depending on the technology stack used.',
    },
  ],

  // ----------------------------------------------------------
  // CONTACT FORM OPTIONS
  // ----------------------------------------------------------
  contactForm: {
    customerTypes: ['Individual', 'Student', 'Business', 'Office', 'Institution', 'Startup', 'Other'],
    services: [
      'Website Development',
      'Custom Software',
      'Excel / Word / PowerPoint',
      'UI/UX Design',
      'Software Testing',
      'Laptop Repair',
      'PC Repair',
      'Custom PC Build',
      'Computer Upgrade',
      'Networking / LAN',
      'Wi-Fi / Router',
      'IoT Project',
      'Student Project',
      'IT Support',
      'Other',
    ],
    budgetRanges: [
      'Below ₹5,000',
      '₹5,000 – ₹15,000',
      '₹15,000 – ₹30,000',
      '₹30,000 – ₹60,000',
      'Above ₹60,000',
      'Not Sure / Flexible',
    ],
    contactMethods: ['WhatsApp', 'Phone Call', 'Email'],
  },

  // ----------------------------------------------------------
  // FOOTER NAVIGATION LINKS
  // ----------------------------------------------------------
  footerLinks: {
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Our Work', href: '#portfolio' },
      { label: 'Why Choose Us', href: '#why-us' },
      { label: 'Contact', href: '#contact' },
    ],
    software: [
      { label: 'Website Development', href: '#web-dev' },
      { label: 'Custom Software', href: '#custom-software' },
      { label: 'Office Solutions', href: '#office-solutions' },
      { label: 'UI/UX Design', href: '#design' },
      { label: 'Software Testing', href: '#testing' },
    ],
    hardware: [
      { label: 'Laptop Repair', href: '#laptop-repair' },
      { label: 'PC Repair', href: '#desktop-repair' },
      { label: 'Custom PC Build', href: '#custom-pc' },
      { label: 'Computer Upgrades', href: '#upgrades' },
      { label: 'IoT Solutions', href: '#iot' },
    ],
    infrastructure: [
      { label: 'Network Installation', href: '#networking' },
      { label: 'Wi-Fi Solutions', href: '#networking' },
      { label: 'Router Configuration', href: '#networking' },
      { label: 'Student Projects', href: '#student-projects' },
      { label: 'IT Support', href: '#maintenance' },
    ],
  },

};
