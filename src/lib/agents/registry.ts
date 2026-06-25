export type AgentSlug = "email-agent" | "social-media-agent" | "finance-agent" | "devops-agent" | "lifestyle-agent";

export type AgentMeta = {
  slug: AgentSlug;
  name: string;
  emoji: string;
  description: string;
  category: string;
  status: "active" | "coming_soon";
  installHref?: string;
};

export const AGENTS: AgentMeta[] = [
  {
    slug: "email-agent",
    name: "Agent Email",
    emoji: "📧",
    description: "Lit tes emails, repère les urgences, te prévient au bon moment.",
    category: "Productivité",
    status: "active",
    installHref: "/agents/email/install",
  },
  {
    slug: "social-media-agent",
    name: "Agent Social Media",
    emoji: "📱",
    description: "Génère et planifie tes posts LinkedIn et Instagram automatiquement.",
    category: "Marketing",
    status: "active",
    installHref: "/agents/social/install",
  },
  {
    slug: "finance-agent",
    name: "Agent Finance",
    emoji: "💰",
    description: "Bientôt disponible.",
    category: "Finance",
    status: "coming_soon",
  },
  {
    slug: "devops-agent",
    name: "Agent DevOps",
    emoji: "🛠️",
    description: "Bientôt disponible.",
    category: "Tech",
    status: "coming_soon",
  },
  {
    slug: "lifestyle-agent",
    name: "Agent Lifestyle",
    emoji: "✨",
    description: "Bientôt disponible.",
    category: "Lifestyle",
    status: "coming_soon",
  },
];

export function getAgent(slug: string) {
  return AGENTS.find((a) => a.slug === slug);
}
