"use client";

import { useState, useEffect, useRef } from "react";
import { Folder, File, ChevronRight, ArrowUp } from "lucide-react";
import { clsx } from "clsx";

interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileItem[];
}

interface FileExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (path: string) => void;
  currentPath: string;
}

export function FileExplorer({ isOpen, onClose, onSelectFile, currentPath }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [path, setPath] = useState<string[]>(
    currentPath ? currentPath.split("/").filter(Boolean) : []
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchFileSystem() {
      const library = await window.api.buffer.getFileTree();
      const fileTree = library.children || [];

      let currentFiles = fileTree || [];

      const currentPathSegments = [...path];

      while (currentPathSegments.length > 0) {
        const segment = currentPathSegments.shift();
        const dir = currentFiles.find((f) => f.name === segment && f.type === "directory");

        if (dir && dir.children) {
          currentFiles = dir.children;
        } else {
          currentFiles = fileTree || [];
          break;
        }
      }

      setFiles(currentFiles);
      setSelectedIndex(0);
    }

    fetchFileSystem();
  }, [path]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      switch (e.key) {
        case "j":
          setSelectedIndex((prev) => (prev < files.length - 1 ? prev + 1 : prev));
          break;
        case "k":
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter": {
          const selected = files[selectedIndex];
          if (selected) {
            if (selected.type === "directory") {
              setPath((prev) => [...prev, selected.name]);
            } else {
              onSelectFile(selected.path);
              onClose();
            }
          }
          break;
        }
        case "-":
          // Go up a directory
          setPath((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, files, selectedIndex, onClose, onSelectFile]);

  useEffect(() => {
    if (containerRef.current) {
      const selectedElement = containerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest"
        });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(02,02,02,0.8)] backdrop-opacity-25 z-50 flex items-center justify-center"
    >
      <div
        className="bg-background rounded-lg shadow-xl w-[500px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-accent p-3 flex items-center justify-between bg-background">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Folder size={16} className="text-gray-500" />
            <span className="font-mono">/{path.length > 0 ? path.join("/") + "/" : ""}</span>
          </div>
          <button
            onClick={() => {
              if (path.length > 0) {
                setPath((prev) => prev.slice(0, -1));
              } else {
                onClose();
              }
            }}
            className="p-1 hover:bg-accent rounded-md"
          >
            <ArrowUp size={16} />
          </button>
        </div>

        {/* File list */}
        <div ref={containerRef} className="flex-1 overflow-y-auto">
          <div className="py-1">
            {files.map((file, index) => (
              <div
                key={file.path}
                data-index={index}
                className={clsx(
                  `flex items-center px-3 py-1.5 cursor-pointer`,
                  selectedIndex === index ? "bg-accent" : "hover:bg-accent",
                  currentPath === file.path && "text-yellow-200"
                )}
                onClick={() => {
                  setSelectedIndex(index);
                  if (file.type === "directory") {
                    setPath((prev) => [...prev, file.name]);
                  } else {
                    onSelectFile(file.path);
                    onClose();
                  }
                }}
              >
                <div className="mr-2">
                  {file.type === "directory" ? (
                    <Folder size={16} className="text-blue-500" />
                  ) : (
                    <File size={16} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 truncate">{file.name}</div>
                {file.type === "directory" && <ChevronRight size={16} className="text-gray-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Footer with help */}
        <div className="border-t border-accent p-2 bg-accent">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex space-x-3">
              <div className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-xs mr-1">
                  Enter
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-xs mr-1">
                  -
                </kbd>
                <span>Up dir</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-xs mr-1">
                  n
                </kbd>
                <span>New</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-xs mr-1">
                  jk
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-xs mr-1">
                  Esc
                </kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
