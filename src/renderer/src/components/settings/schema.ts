import { z } from "zod";

export const formSchema = z.object({
  libraryPath: z.string().default(""),
  autoUpdate: z.boolean().default(true),
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  vim: z.boolean().default(true),
  font: z.object({
    fontWeight: z.enum(["normal", "bold"]).default("normal"),
    fontFamily: z.string().default("-apple-system"),
    fontSize: z.number().min(8).max(80).default(14)
  }),
  window: z.object({
    alwaysOnTop: z.boolean().default(false),
    showInDock: z.boolean().default(true)
  }),
  ai: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().min(0).startsWith("sk-").default(""),
    model: z.string().default("gpt-3.5-turbo"),
    features: z.object({
      promptEnabled: z.boolean().default(false),
      autoCompleteEnabled: z.boolean().default(false)
    })
  }),
  keyBindings: z.record(z.string())
});

export type FormInputs = z.infer<typeof formSchema>;
