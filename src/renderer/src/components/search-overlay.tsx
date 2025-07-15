import { useAppStore } from "@/stores/app-store";
import { Input } from "./ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { ParsedSearchResult } from "src/main/search";
import { tinykeys } from "tinykeys";
import clsx from "clsx";

/**
 * TODO:
 * - FOcus on the search result if its out of view and pressing ctrl+n or ctrl+p
 * - Styling (colors & layout)
 * - after opening a note, highlight the results in the note.
 *    - pass the query and the selected result.
 *      - focus on the selected result, highlight the multiple matches similar to local search.
 *      - should use similar API as local search. pressing escape should hide the selection.
 * */

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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelection = useCallback(
    (result: ParsedSearchResult) => {
      toggleSearchDialog();
      onSelection(result);
    },
    [toggleSearchDialog, onSelection]
  );

  useEffect(() => {
    if (!isSearching) return;

    const unsub = tinykeys(window, {
      Escape: () => {
        toggleSearchDialog();
      },
      "Control+n": () => {
        console.log("Control+n pressed");
        if (selectedIndex < results.length - 1) {
          setSelectedIndex((prev) => prev + 1);
        }

        if (selectedIndex >= results.length - 1) {
          setSelectedIndex(0);
        }
      },
      "Control+p": () => {
        if (selectedIndex > 0) {
          setSelectedIndex((prev) => prev - 1);
        }

        if (selectedIndex <= 0) {
          setSelectedIndex(results.length - 1);
        }
      },
      Enter: () => {
        if (results.length > 0) {
          handleSelection(results[selectedIndex]);
        }
      }
    });

    return () => {
      unsub();
    };
  }, [isSearching, toggleSearchDialog, setSelectedIndex, selectedIndex, handleSelection, results]);

  if (!isSearching) return null;

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
    }, 300); // Adjust the debounce time as needed
  }

  return (
    <div className="bg-[#1F1F28]/90 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center pt-16">
      <div className="w-full px-4 max-w-[800px]">
        <div>
          <Input autoFocus onChange={handleChange} value={query} />
        </div>

        <div className="max-h-[80vh] overflow-y-auto mt-2">
          {results.map((result, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={index}
                className={clsx(
                  "p-2 border-b border-gray-200 hover:bg-gray-800",
                  isSelected && "bg-gray-700"
                )}
                onClick={() => handleSelection(result)}
              >
                <div className="text-sm text-gray-500">{result.file}</div>
                <div className="text-sm">{highlightMatch(result.content, query)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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

  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}
