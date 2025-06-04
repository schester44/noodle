import { NotebookPenIcon, PlusIcon } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { FileSelector } from "./file-selector";

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
  return (
    <TooltipProvider>
      <div className="bg-[#1F1F28] flex items-center justify-between text-white pt-1 px-3 pb-2 group">
        <div className="drag-region" />

        <div className="text-sm text-[#53536C] flex-1 drag-region text-center">{bufferName}</div>

        <div className="flex items-center gap-2 text-[#53536C]">
          <div>
            <Tooltip>
              <FileSelector
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
                  <Cmd with="k" />
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
                  <Cmd with="n" />
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Cmd({ with: withKey }: { with: string }) {
  return (
    <div className="flex items-center gap-1 z-10 pl-2">
      <KeyboardKey display="⌘" />
      <KeyboardKey display={withKey} />
    </div>
  );
}

function KeyboardKey({ display }: { display: string }) {
  return (
    <div className="bg-accent-foreground text-xs px-1 rounded shadow-sm flex items-center justify-center font-medium">
      {display}
    </div>
  );
}
