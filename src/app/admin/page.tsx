import Link from "next/link";

export default function AdminDashboardPage() {
  const cards = [
    {
      href: "/admin/newsletter",
      title: "Newsletter subscribers",
      desc: "View emails, inferred location from IP, and remove addresses.",
    },
    {
      href: "/admin/contacts",
      title: "Contact & bookings",
      desc: "Appointment requests: location, mark complete, or delete.",
    },
    {
      href: "/admin/blog",
      title: "New blog post",
      desc: "Publish Markdown to GitHub; deploy runs on push.",
    },
    {
      href: "/admin/blogs",
      title: "Edit or delete posts",
      desc: "List MDX posts in the repo, update content, or remove files.",
    },
    {
      href: "/admin/portfolio",
      title: "Portfolio projects",
      desc: "Edit project data in JSON on GitHub; add or remove case studies.",
    },
    {
      href: "/admin/inventory",
      title: "Parts inventory",
      desc: "Sensors, passives, and lab stock in D1 (Cloudflare).",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-midnight_text dark:text-white mb-2">
        Dashboard
      </h1>
      <p className="text-grey dark:text-SereneGray text-sm mb-10 max-w-xl">
        Internal tools for Haizom Studio. Sign-in is required for all sections
        below.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-sm border border-border dark:border-dark_border bg-section dark:bg-darklight p-6 hover:border-primary/50 transition-colors">
            <h2 className="text-lg font-semibold text-midnight_text dark:text-white group-hover:text-primary mb-2">
              {c.title}
            </h2>
            <p className="text-sm text-grey dark:text-SereneGray">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
