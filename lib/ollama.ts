// ─── Ollama Chat Helper ────────────────────────────────────────────────────────
// Calls Ollama's OpenAI-compatible REST API.
// Ollama must be running locally: `ollama serve`

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string | OllamaContentPart[];
}

export interface OllamaContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

interface OllamaChatResponse {
  message: {
    content: string;
  };
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

export async function ollamaChat(
  model: string,
  messages: OllamaMessage[],
): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      format: "json",
      stream: false,
      options: {
        temperature: 0.1, // Low temperature for structured extraction
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ollama request failed (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as OllamaChatResponse;
  return data.message.content;
}
