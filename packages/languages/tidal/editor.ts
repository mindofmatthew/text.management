import { StreamLanguage } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";
import { indentation } from "./indentation";

export function tidal() {
  return [StreamLanguage.define(haskell), indentation()];
}
