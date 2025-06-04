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

export function GeneralSettings() {
  const form = useFormContext<FormInputs>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="window.alwaysOnTop"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Always on top</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="window.showInDock"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Show in dock</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            name="libraryPath"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Library Path</FormLabel>
                <FormDescription>The path where your notes are stored.</FormDescription>
                <FormControl>
                  <Input type="text" {...field} />
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
