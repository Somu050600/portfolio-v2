import { profile } from "@/lib/profile.config";

const footerLinks = [
  { label: "GitHub", href: profile.contact.github },
  { label: "LinkedIn", href: profile.contact.linkedin },
  { label: "Resume", href: profile.contact.resumeUrl },
] as const;

export default function HomeFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-border-color px-5 py-8 lg:hidden">
      <a
        href={`mailto:${profile.contact.email}`}
        className="w-fit [font-family:var(--font-home-poppins)] text-[13.5px] leading-none font-medium text-ink transition-colors hover:text-accent"
      >
        Email me
      </a>
      <div className="flex flex-wrap gap-4 [font-family:var(--font-home-poppins)] text-[12.5px] leading-none font-medium text-ink-dim">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
