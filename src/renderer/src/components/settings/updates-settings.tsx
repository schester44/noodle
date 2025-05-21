import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw } from "lucide-react";
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

export function UpdatesSettings() {
  const currentVersion = "1.2.3";
  const latestVersion = "1.2.3";
  const isLatestVersion = currentVersion === latestVersion;

  const form = useFormContext<FormInputs>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Version Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Version</span>
              <span className="text-sm">{currentVersion}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Latest Version</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{latestVersion}</span>
                {isLatestVersion ? (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Up to date
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                    Update available
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="autoUpdate"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Automatic updates</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground font-medium">
                    Automatically download and install updates
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
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={isLatestVersion}>
            <Download className="mr-2 h-4 w-4" />
            Download Update
          </Button>

          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Release Notes</CardTitle>
          <CardDescription>What&apos;s new in version {currentVersion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[200px] overflow-y-auto">
          <div className="space-y-2">
            <h4 className="font-medium">Version 1.2.3</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Improved AI suggestions for better writing assistance</li>
              <li>Fixed bug with dark mode toggle in certain browsers</li>
              <li>Added new keyboard shortcuts for common actions</li>
              <li>Performance improvements for large documents</li>
              <li>Updated dependencies for better security</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Version 1.2.2</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Added export to PDF functionality</li>
              <li>Fixed sync issues with cloud storage</li>
              <li>Improved search functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
