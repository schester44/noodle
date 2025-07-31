import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormInputs } from "./schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form";
import { cn } from "@/lib/utils";

export function AISettings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const form = useFormContext<FormInputs>();

  const aiEnabled = form.watch("ai.enabled");

  async function handleConnectionTest() {
    // await window.api.ai.testConnection({
    //   apiKey: form.getValues("ai.apiKey"),
    //   model: form.getValues("ai.model")
    // })
    // Show toast
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>Unleash AI to boost your workflow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="ai.enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Enable AI features</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground font-medium">
                    Use AI for suggestions, summaries, and more
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ai.apiKey"
            render={({ field }) => (
              <FormItem className={aiEnabled ? "" : "opacity-50 pointer-events-none"}>
                <FormLabel className="flex justify-between items-center">
                  OpenAI API Key
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </FormLabel>
                <FormDescription className="text-xs text-muted-foreground font-medium">
                  Your API key is stored locally on your device
                </FormDescription>
                <FormControl>
                  <Input type={showApiKey ? "text" : "password"} placeholder="sk-..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ai.model"
            render={({ field }) => {
              return (
                <FormItem className={aiEnabled ? "" : "opacity-50 pointer-events-none"}>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </CardContent>

        <CardFooter className={aiEnabled ? "" : "opacity-50 pointer-events-none"}>
          <Button variant="outline" className="w-full" onClick={handleConnectionTest}>
            Test API Connection
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="ai.features.promptEnabled"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center justify-between",
                  !aiEnabled && "opacity-50 pointer-events-none"
                )}
              >
                <div>
                  <FormLabel>Prompts</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground font-medium">
                    Prompt AI to assist with your notes
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ai.features.autoCompleteEnabled"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center justify-between",
                  !aiEnabled && "opacity-50 pointer-events-none"
                )}
              >
                <div>
                  <FormLabel>Auto Completions</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground font-medium">
                    Auto-complete sentences and paragraphs
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
