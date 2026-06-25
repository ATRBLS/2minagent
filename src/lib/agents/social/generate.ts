import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type GeneratedPost = {
  platform: "linkedin" | "instagram";
  content: string;
  hashtags: string[];
  format: "insight" | "story" | "question" | "tip";
};

export async function generateWeeklyPosts(profile: {
  industry: string;
  topics: string[];
  goal: string;
  toneDescriptors: string[];
}): Promise<GeneratedPost[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system:
      "Tu es un ghostwriter expert en réseaux sociaux professionnels. Réponds UNIQUEMENT en JSON valide.",
    messages: [
      {
        role: "user",
        content: `Génère 3 posts LinkedIn pour la semaine, dans ce style de voix: ${
          profile.toneDescriptors.join(", ") || "naturel et professionnel"
        }.

Secteur: ${profile.industry}
Sujets: ${profile.topics.join(", ")}
Objectif: ${profile.goal}

Varie les formats: insight, story, question, tip (un de chaque, le 3ème au choix).
Chaque post fait 80-150 mots, en français, prêt à publier sans modification.

Réponds avec ce JSON exact (tableau de 3 objets):
[
  { "platform": "linkedin", "content": "...", "hashtags": ["...", "..."], "format": "insight" },
  ...
]`,
      },
    ],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);

  try {
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return [];
  }
}

export function nextOptimalSlot(weekStart: Date, dayOffset: number) {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(9, 0, 0, 0); // 9am — generic optimal B2B posting time
  return date.toISOString();
}

export const POSTING_SLOTS = [1, 3, 5]; // Tue, Thu, Sat offsets from Monday
