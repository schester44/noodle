import { checkboxExtension } from "./checkbox";
import { markdownLinkHider } from "./links";
import { separator } from "./separator";

export function markdownExtensions() {
  return [markdownLinkHider, separator, checkboxExtension()];
}
