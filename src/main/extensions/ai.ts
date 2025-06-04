import { IPC_CHANNELS } from "@common/constants";
import { ipcMain } from "electron";

export function setupAIEventListeners({
  settings
}: {
  settings: () => { apiKey: string; aiModel: string };
}) {
  const { apiKey, aiModel } = settings();

  ipcMain.handle(IPC_CHANNELS.GET_AI_RESPONSE, async (_, { before, after, language }) => {
    const messages = [
      {
        role: "system",
        content: `You are an expert note-taking assistant. You complete partial thoughts naturally in a short, concise way. You respond in the fewest amount of words necessary to continue or complete a thought. Do not summarize or repeat existing content. The user is writing notes in ${language} format. Do not include any code blocks or formatting in your response. When the language is "math", do not respond with the value of the expression.`
      },
      {
        role: "user",
        content: `Here is the note so far:\n\n${before}<CURSOR>${after}\n\nPlease continue writing from the <CURSOR> position.`
      }
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiModel,
        messages,
        max_tokens: 30,
        temperature: 0.7,
        stop: ["\n\n"]
      })
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("OpenAI API error:", error);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  });
}
