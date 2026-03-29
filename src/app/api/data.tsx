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

export const Servicebox = [
    {
        icon: getImgPath('/images/services/ux-design-product_1.svg'),
        title: 'Mobile and Web App Development',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        icon: getImgPath('/images/services/perfomance-optimization.svg'),
        title: 'PCB Design & Prototyping',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        icon: getImgPath('/images/services/ux-design-product_2.svg'),
        title: 'Iot & Embedded Systems',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        icon: getImgPath('/images/services/ux-design-product_1.svg'),
        title: 'Firmware Development',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        icon: getImgPath('/images/services/perfomance-optimization.svg'),
        title: 'AI & Machine Learning',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        icon: getImgPath('/images/services/ux-design-product_2.svg'),
        title: 'DevOps and Cloud Solutions',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 
    }
]

export const portfolioinfo: PortfolioItem[] = [
    {
        image: getImgPath('/images/portfolio/cozycasa.png'),
        alt: 'Cozycasa project preview',
        title: 'Cozycasa',
        slug: 'cozycasa',
        info: 'Interior & lifestyle branding',
        Class: 'md:mt-0',
        description:
            'We partnered with Cozycasa to shape a warm, inviting digital presence that mirrors the comfort of home.\n\nThe visual language balances soft neutrals with confident typography so photography and product storytelling stay at the centre of every page.\n\nTogether we delivered a scalable design system the team can extend as their catalogue and retail footprint grow.',
        deliverables: [
            'Art direction',
            'Design system',
            'Web layouts',
            'Component library',
            'Launch support',
        ],
    },
    {
        image: getImgPath('/images/portfolio/mars.png'),
        alt: 'Mars project preview',
        title: 'Mars',
        slug: 'mars',
        info: 'Product & launch experience',
        Class: 'md:mt-24',
        description:
            'Mars needed a bold narrative that could carry a high-energy product story without feeling cluttered or noisy.\n\nWe focused on crisp hierarchy, motion-friendly layouts, and a colour palette that reinforces exploration and momentum.\n\nThe result is a flexible marketing surface that scales from landing pages to campaign microsites.',
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