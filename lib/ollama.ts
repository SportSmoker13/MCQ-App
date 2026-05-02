// ─── Ollama Chat Helper ────────────────────────────────────────────────────────
// Calls Ollama's OpenAI-compatible REST API.
// Ollama must be running locally: `ollama serve`

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[]; // Base64 encoded images
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
  console.log(`[Ollama] Calling model: ${model}...`);
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        format: "json",
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for structured extraction
          num_predict: 4096, // Increase output token limit
          num_ctx: 8192, // Increase context window for multimodal processing
        },
      }),
    });

    clearTimeout(timeoutId);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Ollama] Model ${model} responded in ${duration}s`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ollama request failed (${response.status}): ${errorText}`,
      );
    }

    const data = (await response.json()) as OllamaChatResponse;
    return data.message.content;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Ollama request timed out after 5 minutes. The model might be too slow for your hardware or still downloading.`);
    }
    throw err;
  }
}
