import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form";
import { useFormContext } from "react-hook-form";
import { FormInputs } from "./schema";
import { Input } from "../ui/input";

export function KeybindSettings() {
  const form = useFormContext<FormInputs>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keybinds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="vim"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>VIM Keybinds</FormLabel>
                  <FormDescription className="mt-1">Use VIM keybinds in the editor</FormDescription>
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
