import { ReactNode, useEffect, useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
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

export function FileSelector({
  value,
  onSelect,
  trigger
}: {
  value: string;
  onSelect: (value: string) => void;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const [files, setFiles] = useState<{ path: string; file: string }[]>([]);

  useEffect(() => {
    const unsub = tinykeys(window, {
      "Meta+k": () => {
        setOpen((prev) => !prev);
      }
    });

    window.api.buffer.getAll().then((files) => {
      setFiles(files);
    });

    return () => {
      unsub();
    };
  }, []);

  if (!files.length) return;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 mr-8">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {files.map((file) => (
                <CommandItem
                  className="flex items-center justify-between"
                  key={file.file}
                  value={file.file}
                  onSelect={(currentValue) => {
                    onSelect(currentValue);
                    setOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      value === file.file && "font-medium text-yellow-200"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === file.file ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {file.file}
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
