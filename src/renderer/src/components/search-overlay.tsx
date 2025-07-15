import { useAppStore } from "@/stores/app-store";
import { useCallback, useRef, useState } from "react";
import { ParsedSearchResult } from "src/main/search";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "./ui/command";

export function SearchOverlay({
  onSelection
}: {
  onSelection: (result: ParsedSearchResult) => void;
}): React.JSX.Element | null {
  const isSearching = useAppStore((state) => state.isSearching);
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<Array<ParsedSearchResult>>([]);
  const toggleSearchDialog = useAppStore((state) => state.toggleSearchDialog);
  const [query, setQuery] = useState("");

  const handleSelection = useCallback(
    (result: ParsedSearchResult) => {
      toggleSearchDialog();
      onSelection(result);
    },
    [toggleSearchDialog, onSelection]
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setQuery(query);

    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    debounce.current = setTimeout(() => {
      window.api.searchNotes(query).then((results) => {
        setResults(results);
      });
    }, 300);
  }

  function onOpenChange(open: boolean) {
    toggleSearchDialog();

    if (!open) {
      setQuery("");
      setResults([]);
    }
  }

  return (
    <CommandDialog open={isSearching} onOpenChange={onOpenChange}>
      <Command value={query} onChange={handleChange} shouldFilter={false}>
        <CommandInput placeholder="Search notes..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {results.map((result) => {
              return (
                <CommandItem
                  className="flex items-center justify-between"
                  key={result.file + result.line}
                  value={result.file + result.line}
                  onSelect={() => {
                    handleSelection(result);
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="truncate">{highlightMatch(result.content, query)}</div>
                    <div className="text-muted-foreground text-xs">{result.file}</div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedQuery, "i");
  const match = text.match(regex);

  if (!match) return text;

  const start = match.index!;
  const end = start + match[0].length;
  console.log("🪵 start", start, end);

  const startingPosition = start > 60 ? start - 50 : 0;

  return (
    <>
      {text.slice(startingPosition, start)}
      <span className="border border-yellow-200 rounded">{text.slice(start, end)}</span>
      {text.slice(end)}
    </>
  );
}
