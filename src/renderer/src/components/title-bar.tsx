import { Edit, NotebookPenIcon, PlusIcon } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { FileSelector } from "./file-selector";
import { useAppStore } from "@/stores/app-store";
import { useEffect, useRef, useState } from "react";

function BufferName({
  name,
  onNameChange
}: {
  name: string;
  onNameChange: (name: string) => void;
}) {
  const [isEditing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setEditing(false);
        setTempValue(name);
      }
    }

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, name]);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTempValue(event.target.value);
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setEditing(false);
      setTempValue(name);
    } else if (e.key === "Enter") {
      setEditing(false);
      onNameChange(tempValue);
    }
  }

  return (
    <div className="flex items-center justify-center flex-1 drag-region">
      {isEditing ? (
        <div className="no-drag-region w-full pl-20 py-1 flex justify-center">
          <input
            ref={inputRef}
            autoFocus
            value={tempValue}
            onChange={handleNameChange}
            className="text-sm text-[#53536C] border-none outline rounded pl-2"
            onKeyDown={handleKeyDown}
          />
        </div>
      ) : (
        <div className="text-sm text-[#53536C] drag-region">{name}</div>
      )}

      <div className="w-3 pl-1 group/icon" onClick={() => setEditing(true)}>
        <Edit className="text-[#53536c] w-3 no-drag-region hover:text-muted-foreground group-hover/icon:opacity-75 opacity-0" />
      </div>
    </div>
  );
}

export function TitleBar({
  activeEditor,
  bufferName,
  onNewNote,
  onNoteSelect,
  onBufferNameChange
}: {
  activeEditor: string;
  bufferName: string;
  onNewNote: () => void;
  onNoteSelect: (file: string) => void;
  onBufferNameChange: (name: string) => void;
}) {
  const userKeyBinds = useAppStore((state) => state.userSettings.keyBindings);

  const browseNotesKeys = userKeyBinds.browseNotes || "Mod+k";
  const newNoteKeys = userKeyBinds.newNote || "Mod+n";

  return (
    <TooltipProvider>
      <div className="bg-[#1F1F28] flex items-center justify-between text-white pt-1 px-3 pb-2 group">
        <div className="drag-region" />

        <BufferName name={bufferName} onNameChange={onBufferNameChange} />

        <div className="flex items-center gap-2 text-[#53536C]">
          <div>
            <Tooltip>
              <FileSelector
                userKeyBinds={userKeyBinds}
                value={activeEditor}
                onSelect={onNoteSelect}
                trigger={
                  <TooltipTrigger>
                    <NotebookPenIcon className="hover:text-white transition-colors duration-200 w-4" />
                  </TooltipTrigger>
                }
              />
              <TooltipContent>
                <div className="flex">
                  <p>Browse notes</p>

                  <div className="flex items-center gap-1 z-10 pl-2">
                    {browseNotesKeys.split("+").map((key, index) => {
                      return <KeyboardKey key={index} display={key.replace("Mod", "⌘")} />;
                    })}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger>
                <PlusIcon
                  className="hover:text-white transition-colors duration-200 w-5"
                  onClick={onNewNote}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex">
                  <p>Create new note</p>
                  <div className="flex items-center gap-1 z-10 pl-2">
                    {newNoteKeys.split("+").map((key, index) => {
                      return <KeyboardKey key={index} display={key.replace("Mod", "⌘")} />;
                    })}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function KeyboardKey({ display }: { display: string }) {
  return (
    <div className="bg-accent-foreground text-xs px-1 rounded shadow-sm flex items-center justify-center font-medium">
      {display}
    </div>
  );
}
