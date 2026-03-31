import { getImgPath } from "@/utils/image";

export interface PortfolioItem {
    image: string;
    alt: string;
    title: string;
    slug: string;
    info: string;
    Class: string;
    description: string;
    deliverables: string[];
}

export interface ServiceItem {
    slug: string;
    icon: string;
    title: string;
    /** Short teaser for cards and meta */
    description: string;
    info: string;
    /** Multi-paragraph body; paragraphs separated by double newlines */
    fullDescription: string;
    deliverables: string[];
    image: string;
    alt: string;
}

export const menuItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Blog", href: "/#blog" },
];

export const count = [
    {
        icon: getImgPath("/images/counter/star.svg"),
        value: "4.8",
        description: "Out of 5 stars from 400 reviews on Fiverr platform",
    },
    {
        icon: getImgPath("/images/counter/admin.svg"),
        value: "300",
        description: "Client testimonials received in the year 2021",
    },
    {
        icon: getImgPath("/images/counter/bag.svg"),
        value: "100k+",
        description: "Revenue generated through new projects & marketing",
    },
];

export const Progress = [
    { title: 'Mobile and Web App Development', Progress: 95 },
    { title: 'PCB Design & Prototyping', Progress: 90 },
    { title: 'IoT & Embedded Systems', Progress: 80 },
    {title:'Firmware Development', Progress: 82},
    {title:'AI & Machine Learning', Progress: 75},
    {title:'DevOps and Cloud Solutions', Progress: 85},
    {title:'UI/UX Design', Progress: 92},
];

export const servicesinfo: ServiceItem[] = [
    {
        slug: 'mobile-and-web-app-development',
        icon: getImgPath('/images/services/ux-design-product_1.svg'),
        title: 'Mobile and Web App Development',
        description:
            'End-to-end product engineering for iOS, Android, and modern web—from discovery through launch and iteration.',
        info: 'Product & engineering',
        fullDescription:
            'We design and build mobile and web experiences that stay fast, accessible, and easy to evolve as your roadmap changes.\n\nOur process pairs clear UX decisions with a pragmatic technical stack, so designers and engineers stay aligned from prototype to production.\n\nWhether you need a greenfield app, a redesign, or ongoing feature work, we ship in tight loops with documentation your team can own.',
        deliverables: [
            'Discovery & technical planning',
            'UI implementation & design systems',
            'API integration & state architecture',
            'App store & deployment pipelines',
            'Performance & accessibility review',
        ],
        image: getImgPath('/images/portfolio/roket-squred.png'),
        alt: 'Mobile and web application development',
    },
    {
        slug: 'pcb-design-prototyping',
        icon: getImgPath('/images/services/perfomance-optimization.svg'),
        title: 'PCB Design & Prototyping',
        description:
            'Schematic through layout, fabrication, and bring-up—boards tuned for reliability, testability, and manufacturing.',
        info: 'Hardware design',
        fullDescription:
            'We translate requirements into schematics and PCB layouts with attention to signal integrity, thermal behaviour, and DFM.\n\nPrototypes are validated with structured test plans so issues surface early, before you commit to larger builds.\n\nDocumentation and revision control keep your designs traceable as the product matures.',
        deliverables: [
            'Schematic capture & BOM',
            'Layout, stack-up, and fabrication files',
            'Prototype assembly support',
            'Bring-up & debug',
            'Design for test & manufacture',
        ],
        image: getImgPath('/images/portfolio/mars.png'),
        alt: 'PCB design and prototyping',
    },
    {
        slug: 'iot-embedded-systems',
        icon: getImgPath('/images/services/ux-design-product_2.svg'),
        title: 'IoT & Embedded Systems',
        description:
            'Connected devices, sensors, and edge logic—architected for security, power, and long-term maintainability.',
        info: 'Embedded & connectivity',
        fullDescription:
            'We help teams ship IoT products that behave predictably in the field, from bootloader to cloud telemetry.\n\nHardware choices, RTOS or bare-metal firmware, and wireless stacks are selected to match your constraints—not generic templates.\n\nSecurity updates, OTA strategy, and monitoring hooks are considered up front so operations stay manageable at scale.',
        deliverables: [
            'System architecture & BOM guidance',
            'Embedded application firmware',
            'Connectivity (Wi‑Fi, BLE, cellular)',
            'Device provisioning & security basics',
            'Field diagnostics & logging',
        ],
        image: getImgPath('/images/portfolio/cozycasa.png'),
        alt: 'IoT and embedded systems',
    },
    {
        slug: 'firmware-development',
        icon: getImgPath('/images/services/ux-design-product_1.svg'),
        title: 'Firmware Development',
        description:
            'Reliable firmware for microcontrollers and SoCs—clean drivers, solid state machines, and maintainable codebases.',
        info: 'Firmware engineering',
        fullDescription:
            'We write firmware that teams can extend: modular layers, consistent error handling, and tests where they matter most.\n\nBring-up, peripheral integration, and performance tuning are handled with clear milestones and measurable criteria.\n\nHandoff includes build systems, flashing instructions, and enough documentation for your engineers to take ownership.',
        deliverables: [
            'Driver & HAL integration',
            'RTOS or bare-metal architectures',
            'Boot & upgrade paths',
            'Unit/integration test hooks',
            'Release notes & developer docs',
        ],
        image: getImgPath('/images/portfolio/humans.png'),
        alt: 'Firmware development',
    },
    {
        slug: 'ai-machine-learning',
        icon: getImgPath('/images/services/perfomance-optimization.svg'),
        title: 'AI & Machine Learning',
        description:
            'Practical ML—from data pipelines and model integration to monitoring—aligned with real product and latency constraints.',
        info: 'ML & data',
        fullDescription:
            'We focus on ML that ships: baselines, evaluation, and deployment paths that match your stack and budget.\n\nWhether you need classical models, deep learning, or LLM-powered features, we scope experiments with clear success metrics.\n\nInference, batch jobs, and retraining workflows are designed so your team can operate them without constant firefighting.',
        deliverables: [
            'Data & labelling strategy',
            'Model training & evaluation',
            'API & edge deployment',
            'Monitoring & drift awareness',
            'Documentation for operators',
        ],
        image: getImgPath('/images/portfolio/panda-logo.png'),
        alt: 'AI and machine learning',
    },
    {
        slug: 'devops-and-cloud-solutions',
        icon: getImgPath('/images/services/ux-design-product_2.svg'),
        title: 'DevOps and Cloud Solutions',
        description:
            'CI/CD, infrastructure as code, and observability—so releases are boring in the best way.',
        info: 'Platform & delivery',
        fullDescription:
            'We automate builds, tests, and deployments so your team spends time on features, not repetitive release rituals.\n\nCloud foundations are defined with security, cost, and recovery in mind—without over-engineering day one.\n\nRunbooks, dashboards, and alerts are part of the deliverable, not an afterthought.',
        deliverables: [
            'CI/CD pipelines',
            'Infrastructure as code',
            'Container & orchestration setup',
            'Secrets & access patterns',
            'Logging, metrics, and alerts',
        ],
        image: getImgPath('/images/portfolio/roket-squred.png'),
        alt: 'DevOps and cloud solutions',
    },
];

/** Card grid on home / services listing (includes slug for deep links). */
export const Servicebox = servicesinfo.map((s) => ({
    slug: s.slug,
    icon: s.icon,
    title: s.title,
    description: s.description,
}));

export const portfolioinfo: PortfolioItem[] = [
    {
        image: getImgPath('/images/portfolio/cozycasa.png'),
        alt: 'Cozycasa project preview',
        title: 'Chatbot Ai Solutions',
        slug: 'chatbot-ai-solutions',
        info: 'Chatbot Ai Solutions',
        Class: 'md:mt-0',
        description:
            'We partnered with Cozycasa to shape a warm, inviting digital presence that mirrors the comfort of home.\n\nThe visual language balances soft neutrals with confident typography so photography and product storytelling stay at the centre of every page.\n\nTogether we delivered a scalable design system the team can extend as their catalogue and retail footprint grow.',
        deliverables: [
            'Chatbot Ai Solutions for your business',
        ],
    },
    {
        image: getImgPath('/images/portfolio/mars.png'),
        alt: 'Mars project preview',
        title: 'Healthcare EVV Platform',
        slug: 'healthcare-evv-platform',
        info: 'Healthcare EVV Platform',
        Class: 'md:mt-24',
        description:
            'Healthcare EVV Platform for your business',
        deliverables: [
            'Creative direction',
            'UI design',
            'Responsive layouts',
            'Campaign templates',
            'Handoff documentation',
        ],
    },
    {
        image: getImgPath('/images/portfolio/humans.png'),
        alt: 'Everyday Humans project preview',
        title: 'Everyday Humans',
        slug: 'everyday-humans',
        info: 'Editorial & community',
        Class: 'md:mt-0',
        description:
            'Everyday Humans celebrates real stories; our job was to let those stories breathe through typography and generous whitespace.\n\nWe structured long-form content, contributor profiles, and highlights so readers can move fluidly between articles and calls to action.\n\nAccessibility and readability guided every decision, from type scale to contrast in dark mode.',
        deliverables: [
            'Content architecture',
            'Editorial templates',
            'Typography system',
            'Dark mode patterns',
            'QA & refinement',
        ],
    },
    {
        image: getImgPath('/images/portfolio/roket-squred.png'),
        alt: 'Rocket Squared project preview',
        title: 'Rocket Squared',
        slug: 'rocket-squared',
        info: 'SaaS marketing site',
        Class: 'md:mt-24',
        description:
            'Rocket Squared wanted a confident SaaS presence that could grow with a fast-moving roadmap and shifting feature sets.\n\nWe designed modular sections for product storytelling, social proof, and pricing so marketing could ship updates without rebuilding pages.\n\nEngineering handoff included annotated flows and reusable UI blocks aligned with the existing stack.',
        deliverables: [
            'UX patterns',
            'Marketing pages',
            'Pricing & compare',
            'Illustration direction',
            'Design QA',
        ],
    },
    {
        image: getImgPath('/images/portfolio/panda-logo.png'),
        alt: 'Panda Logo project preview',
        title: 'Panda Logo',
        slug: 'panda-logo',
        info: 'Identity & marks',
        Class: 'md:mt-0',
        description:
            'This engagement centred on a memorable mark that could work across digital, print, and small favicon sizes.\n\nWe explored geometry, negative space, and character before locking a system of primary, secondary, and wordmark lockups.\n\nGuidelines cover clear space, colour usage, and misuse cases so partners stay on brand.',
        deliverables: [
            'Logo exploration',
            'Final mark & wordmark',
            'Colour system',
            'Brand guidelines',
            'Asset export kit',
        ],
    },
    {
        image: getImgPath('/images/portfolio/humans.png'),
        alt: 'Fusion Dynamics project preview',
        title: 'Fusion Dynamics',
        slug: 'fusion-dynamics',
        info: 'Corporate digital',
        Class: 'md:mt-0',
        description:
            'Fusion Dynamics required a polished corporate site that still felt approachable to prospects evaluating complex services.\n\nCase studies, leadership bios, and service pillars were woven into a predictable navigation model for repeat visitors.\n\nWe tuned performance and imagery so the experience stays sharp on large displays and mobile alike.',
        deliverables: [
            'Site map & UX',
            'Visual design',
            'Case study layouts',
            'Iconography',
            'Rollout support',
        ],
    },
    {
        image: getImgPath('/images/portfolio/cozycasa.png'),
        alt: 'InnovateX Ventures project preview',
        title: 'InnovateX Ventures',
        slug: 'innovate-x-ventures',
        info: 'Venture storytelling',
        Class: 'md:mt-24',
        description:
            'InnovateX needed a concise story for founders, LPs, and portfolio teams landing on the same homepage.\n\nWe separated audiences with clear entry points while keeping a single cohesive visual thread across sections.\n\nMotion and scroll cues add depth without distracting from metrics, thesis, and team credibility.',
        deliverables: [
            'Narrative structure',
            'Visual identity touch-up',
            'Web design',
            'Motion specs',
            'Content styling',
        ],
    },
    {
        image: getImgPath('/images/portfolio/mars.png'),
        alt: 'Nebula Holdings project preview',
        title: 'Nebula Holdings',
        slug: 'nebula-holdings',
        info: 'Holdings & investor hub',
        Class: 'md:mt-0',
        description:
            'Nebula Holdings asked for a restrained, trustworthy interface that could host updates and long-term reference material.\n\nWe prioritised legibility, document-style rhythm, and a calm palette suited to financial and strategic content.\n\nThe layout adapts to news, reports, and leadership messaging with minimal structural churn.',
        deliverables: [
            'Information design',
            'UI components',
            'News & insights',
            'Document styling',
            'Accessibility pass',
        ],
    },
    {
        image: getImgPath('/images/portfolio/panda-logo.png'),
        alt: 'Summit Partners project preview',
        title: 'Summit Partners',
        slug: 'summit-partners',
        info: 'Partnership brand',
        Class: 'md:mt-24',
        description:
            'Summit Partners wanted to signal stability and collaboration through typography, photography, and partner spotlights.\n\nWe built repeatable patterns for quotes, timelines, and team grids to speed up future edits.\n\nSubtle gradients and depth cues echo the summit metaphor without overpowering content.',
        deliverables: [
            'Brand refresh',
            'Page templates',
            'Partner grid system',
            'Photography direction',
            'Style guide',
        ],
    },
    {
        image: getImgPath('/images/portfolio/roket-squred.png'),
        alt: 'Apex Strategies project preview',
        title: 'Apex Strategies',
        slug: 'apex-strategies',
        info: 'Strategy consultancy',
        Class: 'md:mt-0',
        description:
            'Apex Strategies needed clarity above all: services, outcomes, and proof points had to scan in seconds.\n\nWe used strong sectioning, iconography, and concise copy blocks to guide busy executives through the story.\n\nContact and consultation flows were simplified to reduce friction on every device.',
        deliverables: [
            'Service modelling',
            'Wireframes',
            'High-fidelity UI',
            'Icon set',
            'Conversion tuning',
        ],
    },
];

export function getPortfolioBySlug(slug: string): PortfolioItem | undefined {
    const normalized = decodeURIComponent(slug).toLowerCase();
    return portfolioinfo.find((p) => p.slug.toLowerCase() === normalized);
}

export function getServiceBySlug(slug: string): ServiceItem | undefined {
    const normalized = decodeURIComponent(slug).toLowerCase();
    return servicesinfo.find((s) => s.slug.toLowerCase() === normalized);
}