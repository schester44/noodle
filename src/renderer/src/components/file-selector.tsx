import { ReactNode, useEffect, useState } from "react";
import { Check } from "lucide-react";

import { cmToTinyKeys, cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { tinykeys } from "tinykeys";
import { getBrowseNotesKeyBind } from "@/editor/extensions/keymaps";
import { useEditorStore } from "@/stores/editor-store";

export function FileSelector({
  value,
  onSelect,
  trigger,
  userKeyBinds
}: {
  value: string;
  onSelect: (value: string) => void;
  trigger: ReactNode;
  userKeyBinds: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  const [files, setFiles] = useState<{ fullpath: string; path: string; file: string }[]>([]);

  useEffect(() => {
    window.api.buffer.getAll().then((files) => {
      setFiles(files);
    });
  }, []);

  useEffect(() => {
    const keybind = cmToTinyKeys(getBrowseNotesKeyBind(userKeyBinds));

    const unsub = tinykeys(window, {
      [keybind]: () => {
        setOpen((prev) => !prev);
      }
    });

    return () => {
      unsub();
    };
  }, [userKeyBinds]);

  const editor = useEditorStore((state) => state.editors[state.activeEditor]);

  useEffect(() => {
    if (!editor) return;

    if (!open) {
      editor.view.focus();
    }
  }, [open, editor]);

  if (!files.length) return;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 mr-8">
        <Command>
          <CommandInput placeholder="Search notes..." />
          <CommandList>
            <CommandEmpty>No notes found.</CommandEmpty>
            <CommandGroup>
              {files.map((file) => (
                <CommandItem
                  className="flex items-center justify-between"
                  key={file.fullpath}
                  value={file.file}
                  onSelect={() => {
                    onSelect(file.fullpath);
                    setOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      value === file.fullpath && "font-medium text-yellow-200"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === file.fullpath ? "opacity-100" : "opacity-0"
                      )}
                    />

                    <div>{file.file}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
