import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type EmailClassification = {
  category: "action_required" | "deadline" | "info" | "noise";
  ai_summary: string;
  action_needed: string | null;
  deadline_date: string | null; // YYYY-MM-DD
};

export async function classifyEmail(input: {
  senderName: string;
  senderEmail: string;
  subject: string;
  bodySnippet: string;
}): Promise<EmailClassification> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system:
      "Tu classes des emails pour un utilisateur non-technique. Réponds UNIQUEMENT en JSON valide, sans texte autour.",
    messages: [
      {
        role: "user",
        content: `Classe cet email dans exactement une catégorie: action_required, deadline, info, noise.

- action_required: nécessite une réponse ou décision
- deadline: contient une date ou information sensible au temps
- info: utile mais aucune action nécessaire
- noise: newsletters, notifications automatiques, promotions

Email:
De: ${input.senderName} <${input.senderEmail}>
Sujet: ${input.subject}
Extrait: ${input.bodySnippet.slice(0, 1500)}

Réponds avec ce JSON exact:
{
  "category": "...",
  "ai_summary": "résumé en max 15 mots, en français",
  "action_needed": "phrase courte décrivant l'action nécessaire, ou null",
  "deadline_date": "YYYY-MM-DD si une date est mentionnée, sinon null"
}`,
      },
    ],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  try {
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return {
      category: "info",
      ai_summary: input.subject.slice(0, 80),
      action_needed: null,
      deadline_date: null,
    };
  }
}
