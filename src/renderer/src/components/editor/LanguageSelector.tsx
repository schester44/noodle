import { ReactNode } from "react";
import { displayLanguages } from "../../editor/languages";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "../ui/dropdown-menu";

export function LanguageSelector({
  currentLanguage,
  trigger,
  onSelect
}: {
  onSelect: (value: string) => void;
  currentLanguage: string;
  trigger: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSelect("auto")}>Auto Detect</DropdownMenuItem>
        {displayLanguages.map((lang) => {
          const isSelected = currentLanguage === lang.token;

          return (
            <DropdownMenuItem
              key={lang.token}
              onClick={() => onSelect(lang.token)}
              style={{ fontWeight: isSelected ? "bold" : "normal" }}
            >
              {lang.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
