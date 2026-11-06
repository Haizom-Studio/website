import portfolioRaw from "@/data/portfolio.json";
import { getImgPath } from "@/utils/image";

export interface PortfolioItem {
    /** First image — card thumbnail and fallback when only one slide exists. */
    image: string;
    /** All gallery images (detail page carousel); defaults to `[image]` for legacy JSON. */
    images: string[];
    alt: string;
    title: string;
    slug: string;
    info: string;
    Class: string;
    description: string;
    deliverables: string[];
    /** Portfolio filter category (e.g. "Power Electronics"). Falls back to `info` when empty. */
    category?: string;
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
    { title: 'Schematic capture & PCB design', Progress: 92 },
    { title: 'Prototyping & bring-up', Progress: 90 },
    { title: 'Web development', Progress: 94 },
    { title: 'App development', Progress: 93 },
    { title: 'UI/UX & dashboards', Progress: 91 },
    { title: 'Firmware & sensor fusion', Progress: 88 },
];

export const servicesinfo: ServiceItem[] = [
    {
        slug: 'schematic-capture-pcb-design',
        icon: getImgPath('/images/services/icons/icon-schematic-pcb.svg'),
        title: 'Schematic capture & PCB design',
        description:
            'Electrical design entry through fabrication-ready PCB layout—stack-up, routing, and manufacturing rules your fab can build.',
        info: 'Hardware · ECAD',
        fullDescription:
            'We take your requirements into schematic capture with sensible library use and a BOM you can source. Layout work follows: controlled impedance where high-speed nets need it, solid power and ground strategy, thermal awareness, and design-for-manufacture so panels come back testable and repeatable.\n\nWe coordinate with mechanical, firmware, and assembly early—connector keep-outs, test points, and layer usage are cheaper to fix before the layout is frozen.\n\nDeliverables include Gerbers or ODB++, drill and fab notes, and documentation your contract manufacturer can quote without guesswork.',
        deliverables: [
            'Schematic capture, libraries & BOM alignment',
            'Stack-up, placement & routing to your constraints',
            'Fab package (Gerber/ODB++, drills, drawings)',
            'Assembly notes, test points & revision history',
            'Layout review with SI/PI/thermal risk called out',
        ],
        image: getImgPath('/images/services/schematic-capture-pcb-design.webp'),
        alt: 'Schematic capture and PCB design',
    },
    {
        slug: 'prototyping-bring-up',
        icon: getImgPath('/images/services/icons/icon-prototyping.svg'),
        title: 'Prototyping & bring-up',
        description:
            'Hardware prototypes, bench bring-up, and debug—staged power-on and measurement so each build answers a clear question.',
        info: 'Hardware · EVT/DVT',
        fullDescription:
            'We help you plan prototype batches with your fab and assembler: what each revision is meant to prove, and what “good enough” looks like before you order larger quantities.\n\nOn the bench we run controlled power-on: current limits, rail checks, shorts, clocks, and programming—so firmware teams are not chasing software bugs on broken hardware.\n\nIssues get triaged with photos, measurements, and revision notes so the next spin is intentional—not a grab bag of unrelated changes.',
        deliverables: [
            'Prototype & quick-turn planning with fab/CM',
            'Staged power-on, rail verification & debug',
            'Test-point strategy & bring-up scripts',
            'Issue triage across electrical / mechanical / firmware',
            'Revision history & handoff for the next spin',
        ],
        image: getImgPath('/images/services/prototyping-bring-up.webp'),
        alt: 'Prototyping and hardware bring-up',
    },
    {
        slug: 'web-development',
        icon: getImgPath('/images/services/icons/icon-web.svg'),
        title: 'Web development',
        description:
            'Websites and web applications—frontend and backend, hosting-aware performance, and integrations your team can operate.',
        info: 'Web engineering',
        fullDescription:
            'We implement marketing sites, dashboards, and customer-facing web apps from agreed designs and APIs: routing, forms, auth, and data loading that behave well on real networks.\n\nPerformance and SEO-friendly delivery matter for public pages; private apps get the same discipline around load times, errors, and security headers.\n\nWe ship with sensible environments, CI where it helps, and documentation so another developer can deploy and extend the project.',
        deliverables: [
            'Stack and hosting fit for your product',
            'UI implementation from design specs',
            'API integration, auth & server routes as needed',
            'Performance, SEO basics & production config',
            'Deploy pipeline notes and handoff docs',
        ],
        image: getImgPath('/images/services/web-development.webp'),
        alt: 'Web development',
    },
    {
        slug: 'app-development',
        icon: getImgPath('/images/services/icons/icon-app.svg'),
        title: 'App development',
        description:
            'iOS and Android apps—implementation, device APIs, store submission, and releases you can repeat.',
        info: 'Mobile engineering',
        fullDescription:
            'We build consumer and B2B mobile apps: navigation, networking, storage, push, and integrations such as Bluetooth or payments where your product needs them.\n\nWe align with Apple and Google review expectations, handle signing and build flavours, and keep dependencies current enough that store updates are boring—not emergencies.\n\nYou get builds you can install on hardware, release notes, and structure so your team can add features without rewriting the foundation.',
        deliverables: [
            'Platform strategy & milestone planning',
            'App implementation & native integrations',
            'Store readiness, signing & release pipelines',
            'Offline, sync & error-handling patterns',
            'Handoff docs & monitoring hooks',
        ],
        image: getImgPath('/images/services/app-development.webp'),
        alt: 'Mobile app development',
    },
    {
        slug: 'ui-ux-dashboards',
        icon: getImgPath('/images/services/icons/icon-ui-dashboard.svg'),
        title: 'UI/UX & dashboards',
        description:
            'User experience and interface design for websites, web apps, and mobile apps—plus dashboard and admin UI when you need data-heavy screens.',
        info: 'Product design',
        fullDescription:
            'We structure and visualise digital products: user flows, wireframes, and high-fidelity UI for responsive websites, web applications, and mobile apps—so navigation, forms, and key tasks are easy to complete.\n\nWe define look-and-feel (typography, colour, spacing), components, and states—loading, empty, error—so developers know what to build. Accessibility and touch targets are part of the brief, not an afterthought.\n\nFor analytics and operations dashboards we emphasise scanability, filters, and layouts that match how people monitor KPIs—without burying actions under decoration.',
        deliverables: [
            'UX flows, sitemap & wireframes',
            'UI design for web and mobile screens',
            'Components, spacing scale & design handoff',
            'Dashboard and admin layouts when required',
            'Design QA support with engineering',
        ],
        image: getImgPath('/images/services/ui-ux-dashboards.webp'),
        alt: 'UI, UX and dashboard design',
    },
    {
        slug: 'firmware-sensor-fusion',
        icon: getImgPath('/images/services/icons/icon-firmware.svg'),
        title: 'Firmware & sensor fusion',
        description:
            'Embedded software on microcontrollers—drivers, RTOS or bare-metal logic, sensor processing, and reliable device behaviour in the field.',
        info: 'Embedded firmware',
        fullDescription:
            'We write firmware that runs on your chosen MCU: peripheral bring-up, scheduling, power modes, and communication over UART, SPI, I²C, CAN, or wireless stacks as required.\n\nWhen your product uses IMUs, environmental, or other analogue/digital sensors, we implement sampling, calibration, filtering, and sensor fusion so readings are stable across temperature and motion—not only on a bench.\n\nBoot, provisioning, secure updates, and logging are designed for production: your team gets build instructions, versioned releases, and hooks for factory test and field diagnostics.',
        deliverables: [
            'MCU/RTOS or bare-metal architecture',
            'Drivers, timing & power-aware scheduling',
            'Sensor bring-up, calibration & fusion layers',
            'Connectivity, provisioning & OTA strategy',
            'Logging, diagnostics & field-debug hooks',
        ],
        image: getImgPath('/images/services/firmware-sensor-fusion.webp'),
        alt: 'Firmware and sensor fusion',
    },
];

/** Card grid on home / services listing (includes slug for deep links). */
export const Servicebox = servicesinfo.map((s) => ({
    slug: s.slug,
    icon: s.icon,
    title: s.title,
    description: s.description,
}));

function normalizePortfolioImagePath(path: string): string {
    const t = path.trim();
    if (!t) return "/images/services/schematic-capture-pcb-design.webp";
    return t.startsWith("/") ? t : `/${t}`;
}

export const portfolioinfo: PortfolioItem[] = (
    portfolioRaw as (PortfolioItem & { images?: string[] })[]
).map((p) => {
    const paths =
        p.images && p.images.length > 0
            ? p.images
            : [normalizePortfolioImagePath(p.image)];
    const images = paths.map((path) =>
        getImgPath(
            normalizePortfolioImagePath(path).replace(
                /\.(png|jpe?g)$/i,
                ".webp"
            )
        )
    );
    return {
        ...p,
        image: images[0]!,
        images,
    };
});

export function getPortfolioBySlug(slug: string): PortfolioItem | undefined {
    const normalized = decodeURIComponent(slug).toLowerCase();
    return portfolioinfo.find((p) => p.slug.toLowerCase() === normalized);
}

export function getServiceBySlug(slug: string): ServiceItem | undefined {
    const normalized = decodeURIComponent(slug).toLowerCase();
    return servicesinfo.find((s) => s.slug.toLowerCase() === normalized);
}