import { IPC_CHANNELS } from "@common/constants";
import { ipcMain } from "electron";

export function setupAIEventListeners({
  settings
}: {
  settings: () => { apiKey: string; aiModel: string };
}) {
  const { apiKey, aiModel } = settings();

  ipcMain.handle(IPC_CHANNELS.AI_PROMPT, async (_, { content, selectedText, prompt }) => {
    const messages = [
      {
        role: "system",
        content: `You are helping a user write or improve their notes. Here’s the current context:
<content_before_cursor>${content.before}</content_before_cursor>
<content_after_cursor>${content.after}</content_after_cursor>
${selectedText ? `<selected_text>${selectedText}</selected_text> You will be updating or replacing the selected_text based on the user's instruction` : "The user is inserting new content at the cursor."}
Use the content before and after the cursor as context for your response.
What the user is asking for may not be directly related to the content before and after the cursor, so use your best judgment to provide a helpful response.
Do not repeat the existing content before and after the cursor unless it is necessary to complete the thought.
Keep the response concise, relevant, and formatted consistently with the surrounding content.`
      },
      {
        role: "user",
        content: `The Task: ${prompt}`
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
        max_tokens: 4096,
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
