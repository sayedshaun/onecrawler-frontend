import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Radar, ShieldCheck, Sparkles, Zap } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Zap, text: "Deep or shallow link extraction, sitemap discovery, or full crawler mode" },
  { icon: Sparkles, text: "Heuristic or GenAI-powered extraction with structured output schemas" },
  { icon: ShieldCheck, text: "Proxy rotation and human-like behavior to crawl reliably at scale" },
];

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.5), transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.35), transparent 40%)",
          }}
        />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Radar className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">OneCrawler</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <blockquote className="space-y-3">
            <p className="text-2xl font-medium leading-snug">
              Turn any site into structured data — without babysitting a crawler.
            </p>
          </blockquote>

          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-background/80">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background/10">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-background/50">© {new Date().getFullYear()} OneCrawler</p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Radar className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">OneCrawler</span>
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
