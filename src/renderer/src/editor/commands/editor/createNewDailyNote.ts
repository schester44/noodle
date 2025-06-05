import { useEditorStore } from "@/stores/editor-store";
import { EditorCommand } from "../types";

export const createNewDailyNote: EditorCommand = async ({ editor }) => {
  if (!editor) return false;

  const store = useEditorStore.getState();

  const date = formatDate(new Date());

  const { path } = await window.api.buffer.create({ file: `${date}.txt`, template: "daily" });
  console.log("🪵 path", path);

  store.setActiveEditor(path);

  return true;
};

const pad = (n: number) => n.toString().padStart(2, "0");

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
}
