"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ServerCog,
  Sparkles,
  Mic,
  Users,
  Radar,
  UserSearch,
  PenLine,
  Scale,
  type LucideIcon,
} from "lucide-react";

type Lang = "fr" | "en";

const copy = {
  fr: {
    nav: { agents: "Agents", pricing: "Tarifs", how: "Comment ça marche" },
    cta: "Essayer — 2 min",
    badge: "PWA · iOS · Android · Desktop",
    h1a: "Tes agents travaillent.",
    h1b: "Toi tu vis.",
    sub: "2minAgent connecte tes outils et fait le travail à ta place — en pilote automatique.",
    ctaMain: "Essayer gratuitement — 2 minutes pour démarrer",
    ctaSub: "Aucune carte. Aucun jargon. Désinstalle en un tap.",
    statusLive: "2 agents en ligne",
    agentsTitle: "Deux agents. Zéro effort.",
    agentsSub: "Chacun résout un problème. Pour de bon. En arrière-plan.",
    emailName: "Agent Email",
    emailTag: "Gmail · Outlook",
    emailDesc:
      "Lit chaque email, repère ce qui mérite ton attention, t'envoie une notif quand ça compte. Briefing chaque matin à 8h.",
    emailBullets: [
      "Classe en 4 catégories : Action · Échéance · Info · Bruit",
      "Push 24h avant chaque échéance détectée",
      "Rappel auto si pas de réponse après 48h",
    ],
    socialName: "Agent Social Media",
    socialTag: "LinkedIn · Instagram",
    socialDesc:
      "Génère tes posts dans ton style. Suggère le bon moment. Tu valides en 1 tap, l'agent publie.",
    socialBullets: [
      "3 posts par semaine, calés sur ton secteur",
      "Apprend ton ton à partir de tes anciens posts",
      "Push : « Ton post est prêt — valide en 1 tap »",
    ],
    soonTitle: "Bientôt",
    soon: [
      { name: "Agent Finance", desc: "Catégorise tes dépenses, repère les abus et optimise ton budget." },
      { name: "Agent DevOps", desc: "Surveille tes services, alerte avant la panne et déploie les patches." },
      { name: "Agent Lifestyle", desc: "Réservations, rappels, vie perso simplifiée sur pilote auto." },
      { name: "Agent Meetings", desc: "Résume chaque call, extrait les actions et prépare la prochaine réunion." },
      { name: "Agent CRM", desc: "Piste tes leads, envoie les relances et remplit ton pipeline tout seul." },
      { name: "Agent Veille", desc: "Surveille la concurrence, les tendances et les levées de fonds 24/7." },
      { name: "Agent Recrutement", desc: "Trie les CVs, planifie les entretiens et suit les candidats." },
      { name: "Agent Content", desc: "Génère articles de blog, newsletters et posts SEO dans ta voix." },
      { name: "Agent Juridique", desc: "Analyse tes contrats, rappelle les échéances légales et rédige les clauses." },
    ],
    howTitle: "2 minutes. Vraiment.",
    steps: [
      { n: "01", t: "Choisis un agent", d: "Email ou Social Media. Plus à venir." },
      { n: "02", t: "Connecte ton compte", d: "OAuth officiel. Aucun mot de passe partagé." },
      { n: "03", t: "C'est fini", d: "L'agent tourne en fond. Tu reçois des pushs quand ça compte." },
    ],
    pricingTitle: "Tarifs simples",
    pricingSub: "Commence gratuit. Passe Pro quand tu veux.",
    plans: [
      {
        name: "Gratuit",
        price: "0$",
        period: "/ pour toujours",
        cta: "Commencer",
        features: ["1 agent installé", "Historique 7 jours", "Briefing quotidien", "Watermark sur les posts"],
      },
      {
        name: "Pro",
        price: "12$",
        period: "/ mois",
        cta: "Passer Pro",
        featured: true,
        features: [
          "Agents illimités",
          "Historique complet",
          "Notifs push temps réel",
          "Sans watermark",
          "Traitement IA prioritaire",
        ],
      },
      {
        name: "Builder",
        price: "49$",
        period: "/ mois",
        cta: "Devenir builder",
        features: ["Tout le Pro", "Accès API marketplace", "Publie tes propres agents", "70% de tes ventes"],
      },
    ],
    closerTitle: "Arrête de gérer tes outils.",
    closerTitle2: "Laisse-les bosser pour toi.",
    closerCta: "Démarrer en 2 minutes",
    footer: "Fait pour les pros qui n'ont pas le temps.",
  },
  en: {
    nav: { agents: "Agents", pricing: "Pricing", how: "How it works" },
    cta: "Try — 2 min",
    badge: "PWA · iOS · Android · Desktop",
    h1a: "Your agents work.",
    h1b: "You live.",
    sub: "2minAgent connects your tools and does the work for you — on autopilot.",
    ctaMain: "Try free — 2 minutes to get going",
    ctaSub: "No card. No jargon. Uninstall in one tap.",
    statusLive: "2 agents live",
    agentsTitle: "Two agents. Zero effort.",
    agentsSub: "Each solves one problem. For real. In the background.",
    emailName: "Email Agent",
    emailTag: "Gmail · Outlook",
    emailDesc: "Reads every email, surfaces what matters, pings you when it counts. Morning brief at 8am.",
    emailBullets: [
      "Sorts into 4 buckets: Action · Deadline · Info · Noise",
      "Push 24h before any detected deadline",
      "Auto-reminder if no reply after 48h",
    ],
    socialName: "Social Media Agent",
    socialTag: "LinkedIn · Instagram",
    socialDesc: "Writes posts in your voice. Picks the best time. You approve in one tap, the agent publishes.",
    socialBullets: [
      "3 posts a week, tuned to your industry",
      "Learns your tone from your past posts",
      "Push: \"Your post is ready — approve in 1 tap\"",
    ],
    soonTitle: "Soon",
    soon: [
      { name: "Finance Agent", desc: "Sorts your spending, flags weird charges and optimizes your budget." },
      { name: "DevOps Agent", desc: "Watches your services, warns before they break and deploys patches." },
      { name: "Lifestyle Agent", desc: "Bookings, reminders, life on full autopilot." },
      { name: "Meetings Agent", desc: "Summarizes every call, extracts action items and preps the next meeting." },
      { name: "CRM Agent", desc: "Tracks your leads, sends follow-ups and fills your pipeline on its own." },
      { name: "Intel Agent", desc: "Monitors competitors, trends and funding rounds 24/7." },
      { name: "Hiring Agent", desc: "Ranks CVs, schedules interviews and tracks candidates." },
      { name: "Content Agent", desc: "Generates blog posts, newsletters and SEO content in your voice." },
      { name: "Legal Agent", desc: "Reviews contracts, reminds you of legal deadlines and drafts clauses." },
    ],
    howTitle: "2 minutes. Really.",
    steps: [
      { n: "01", t: "Pick an agent", d: "Email or Social Media. More coming." },
      { n: "02", t: "Connect your account", d: "Official OAuth. No passwords shared." },
      { n: "03", t: "That's it", d: "It runs in the background. You get pushes when it matters." },
    ],
    pricingTitle: "Simple pricing",
    pricingSub: "Start free. Upgrade when you want.",
    plans: [
      {
        name: "Free",
        price: "$0",
        period: "/ forever",
        cta: "Get started",
        features: ["1 agent installed", "7-day history", "Daily briefing", "Watermark on posts"],
      },
      {
        name: "Pro",
        price: "$12",
        period: "/ month",
        cta: "Go Pro",
        featured: true,
        features: [
          "Unlimited agents",
          "Full history",
          "Real-time push alerts",
          "No watermark",
          "Priority AI processing",
        ],
      },
      {
        name: "Builder",
        price: "$49",
        period: "/ month",
        cta: "Become a builder",
        features: ["Everything in Pro", "Marketplace API access", "Publish your own agents", "70% of your sales"],
      },
    ],
    closerTitle: "Stop managing your tools.",
    closerTitle2: "Let them work for you.",
    closerCta: "Get started in 2 minutes",
    footer: "Built for pros who don't have time.",
  },
} as const;

const soonIcons: LucideIcon[] = [Wallet, ServerCog, Sparkles, Mic, Users, Radar, UserSearch, PenLine, Scale];

const soonSpans = [
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-3",
];

function LimeDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  );
}

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-[11px] font-bold tracking-tight">2m</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">2minAgent</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#agents" className="transition hover:text-foreground">
              {t.nav.agents}
            </a>
            <a href="#how" className="transition hover:text-foreground">
              {t.nav.how}
            </a>
            <a href="#pricing" className="transition hover:text-foreground">
              {t.nav.pricing}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-border bg-surface p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setLang("fr")}
                className={`rounded-full px-2.5 py-1 transition ${lang === "fr" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                aria-pressed={lang === "fr"}
              >
                FR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`rounded-full px-2.5 py-1 transition ${lang === "en" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>
            <Link
              href="/login"
              className="hidden rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 sm:inline-flex"
            >
              {t.cta}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <LimeDot /> {t.badge}
          </div>
          <h1 className="mx-auto mt-7 max-w-4xl text-balance text-center text-5xl leading-[1.02] tracking-tight sm:text-7xl md:text-[5.5rem]">
            <span className="font-display block">{t.h1a}</span>
            <span className="font-display block italic text-primary">{t.h1b}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-center text-base text-muted-foreground sm:text-lg">
            {t.sub}
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="lime-glow group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px]"
            >
              {t.ctaMain}
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <p className="text-xs text-muted-foreground">{t.ctaSub}</p>
          </div>

          {/* Hero device row */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute inset-x-10 -top-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-2">
              <DeviceFrame image="/agent-email-mock.jpg" alt="Agent Email dashboard" label={t.emailName} tilt="-2deg" />
              <DeviceFrame image="/agent-social-mock.jpg" alt="Agent Social Media dashboard" label={t.socialName} tilt="2deg" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LimeDot /> {t.statusLive}
            </div>
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="agents" className="border-t border-border/60 bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-12 max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">/ agents</div>
            <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight sm:text-5xl">{t.agentsTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.agentsSub}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AgentCard
              icon="📧"
              name={t.emailName}
              tag={t.emailTag}
              desc={t.emailDesc}
              bullets={t.emailBullets}
              image="/agent-email-mock.jpg"
            />
            <AgentCard
              icon="📱"
              name={t.socialName}
              tag={t.socialTag}
              desc={t.socialDesc}
              bullets={t.socialBullets}
              image="/agent-social-mock.jpg"
            />
          </div>

          {/* SOON */}
          <div className="mt-14">
            <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              / {t.soonTitle.toLowerCase()}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-6">
              {t.soon.map((s, i) => {
                const Icon = soonIcons[i];
                return (
                  <div
                    key={s.name}
                    className={`group relative overflow-hidden rounded-2xl border border-dashed border-border bg-surface/40 p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface/60 ${soonSpans[i]}`}
                  >
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    />
                    <div className="absolute right-3 top-3 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {t.soonTitle}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/70 text-primary transition group-hover:border-primary/40">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <div className="mt-4 text-base font-semibold">{s.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-12 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">/ setup</div>
              <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight sm:text-5xl">{t.howTitle}</h2>
            </div>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3">
            {t.steps.map((s) => (
              <div key={s.n} className="bg-background p-7">
                <div className="font-mono text-xs text-primary">{s.n}</div>
                <div className="mt-6 text-xl font-semibold">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-border/60 bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-12 max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">/ pricing</div>
            <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight sm:text-5xl">{t.pricingTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.pricingSub}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {t.plans.map((p) => {
              const featured = "featured" in p && p.featured;
              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col rounded-3xl border p-7 transition ${
                    featured ? "border-primary/60 bg-background lime-glow" : "border-border bg-background hover:border-border/80"
                  }`}
                >
                  {featured && (
                    <div className="absolute -top-3 left-7 rounded-full bg-primary px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-primary-foreground">
                      Popular
                    </div>
                  )}
                  <div className="text-sm font-semibold tracking-tight">{p.name}</div>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-5xl tracking-tight">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`mt-7 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      featured
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "border border-border bg-surface text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLOSER */}
      <section className="border-t border-border/60">
        <div className="relative mx-auto max-w-5xl overflow-hidden px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <h2 className="font-display relative text-balance text-5xl leading-[1.02] tracking-tight sm:text-7xl">
            {t.closerTitle}
            <br />
            <span className="italic text-primary">{t.closerTitle2}</span>
          </h2>
          <Link
            href="/login"
            className="lime-glow relative mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px]"
          >
            {t.closerCta} <span>→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-[10px] font-bold">2m</span>
            </div>
            <span className="text-sm font-semibold">2minAgent</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">— {t.footer}</span>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} · made with ⚡
          </div>
        </div>
      </footer>
    </div>
  );
}

function DeviceFrame({ image, alt, label, tilt }: { image: string; alt: string; label: string; tilt: string }) {
  return (
    <div
      className="group relative mx-auto w-full max-w-[280px] transition-transform duration-500 hover:!rotate-0 sm:max-w-[300px]"
      style={{ transform: `rotate(${tilt})` }}
    >
      <div className="absolute -inset-3 rounded-[2.4rem] bg-gradient-to-b from-primary/30 to-transparent opacity-40 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-2 shadow-2xl">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>{label}</span>
          <LimeDot />
        </div>
        <div className="overflow-hidden rounded-[1.4rem] border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} width={640} height={1024} loading="lazy" className="block h-auto w-full" />
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  icon,
  name,
  tag,
  desc,
  bullets,
  image,
}: {
  icon: string;
  name: string;
  tag: string;
  desc: string;
  bullets: readonly string[];
  image: string;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-background transition hover:border-primary/40">
      <div className="relative flex items-start justify-between gap-4 p-7">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <LimeDot /> {tag}
          </div>
          <h3 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            <span className="mr-2">{icon}</span>
            {name}
          </h3>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <ul className="space-y-2.5 px-7 pb-7 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-muted-foreground">
            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
            {b}
          </li>
        ))}
      </ul>
      <div className="relative mx-7 mb-7 overflow-hidden rounded-2xl border border-border bg-surface/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${name} preview`}
          width={640}
          height={1024}
          loading="lazy"
          className="block h-64 w-full object-cover object-top transition duration-700 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>
    </article>
  );
}
