import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { FormInputs } from "./schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

const CAN_SELECT_THEME = false; // TODO: Enable this when themes are implemented

export function AppearanceSettings() {
  const form = useFormContext<FormInputs>();

  const [fonts, setFonts] = useState<string[]>([]);

  useEffect(() => {
    window.api.getFonts().then(setFonts);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CAN_SELECT_THEME && (
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => {
                return (
                  <FormItem className="pr-4">
                    <FormLabel>Theme</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id={field.name} className="w-full max-w-1/2">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}

          <FormField
            control={form.control}
            name="font.fontFamily"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Font Family</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-apple-system">System</SelectItem>
                        {fonts.map((font) => {
                          return (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="font.fontSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between items-center">Font Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="14"
                    {...field}
                    onChange={(e) => {
                      const isNum = /^\d+$/.test(e.target.value);

                      field.onChange(isNum ? Number(e.target.value) : "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="font.fontWeight"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Font Family</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
