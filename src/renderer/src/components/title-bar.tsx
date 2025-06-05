import { NotebookPenIcon, PlusIcon } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { FileSelector } from "./file-selector";
import { useAppStore } from "@/stores/app-store";

export function TitleBar({
  activeEditor,
  bufferName,
  onNewNote,
  onNoteSelect
}: {
  activeEditor: string;
  bufferName: string;
  onNewNote: () => void;
  onNoteSelect: (file: string) => void;
}) {
  const userKeyBinds = useAppStore((state) => state.userSettings.keyBindings);

  const browseNotesKeys = userKeyBinds.browseNotes || "Mod+k";
  const newNoteKeys = userKeyBinds.newNote || "Mod+n";

  return (
    <TooltipProvider>
      <div className="bg-[#1F1F28] flex items-center justify-between text-white pt-1 px-3 pb-2 group">
        <div className="drag-region" />

        <div className="text-sm text-[#53536C] flex-1 drag-region text-center">{bufferName}</div>

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
