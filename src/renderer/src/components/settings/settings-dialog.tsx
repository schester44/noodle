import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./general-settings";
import { AppearanceSettings } from "./appearance-settings";
import { AISettings } from "./ai-settings";
import { UpdatesSettings } from "./updates-settings";
import { KeybindSettings } from "./keybind-settings";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormInputs, formSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import debounce from "debounce";

import { useMemo } from "react";
import { useAppStore } from "../../stores/app-store";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const saveUserSettings = useAppStore((state) => state.saveUserSettings);
  const initialValues = useAppStore((state) => state.userSettings);

  const form = useForm({
    mode: "all",
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  });

  const onSubmit: SubmitHandler<FormInputs> = useCallback(
    (data) => {
      // we subscribe to changed values in useAppStore and send them to the main process automatically.
      saveUserSettings(data);
    },
    [saveUserSettings]
  );

  const debouncedSave = useMemo(() => debounce(onSubmit, 50), [onSubmit]);

  const isValid = form.formState.isValid;

  useEffect(() => {
    const subscription = form.watch((newValues) => {
      if (!isValid) return;

      debouncedSave(newValues as FormInputs);
    });

    return () => subscription.unsubscribe();
  }, [debouncedSave, form, isValid]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[100vw] max-h-[100vh] overflow-hidden p-0 w-full h-full rounded-none">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full h-full flex overflow-hidden"
          >
            <div className="w-[200px] border-r overflow-y-auto h-full bg-muted/50">
              <Tabs
                defaultValue="general"
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
              >
                <TabsList className="flex flex-col h-full rounded-none justify-start p-2 pt-10 bg-transparent w-full">
                  <TabsTrigger value="general" className="justify-start mb-1 w-full">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="justify-start mb-1 w-full">
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger value="keybindings" className="justify-start mb-1 w-full">
                    Keyboard Shortcuts
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="justify-start mb-1 w-full">
                    AI
                  </TabsTrigger>
                  <TabsTrigger value="updates" className="justify-start mb-1 w-full">
                    Updates
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsContent value="general">
                  <GeneralSettings />
                </TabsContent>
                <TabsContent value="appearance">
                  <AppearanceSettings />
                </TabsContent>
                <TabsContent value="ai">
                  <AISettings />
                </TabsContent>
                <TabsContent value="updates">
                  <UpdatesSettings />
                </TabsContent>
                <TabsContent value="keybindings">
                  <KeybindSettings />
                </TabsContent>
              </Tabs>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
