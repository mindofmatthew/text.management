import {
  lineNumbers,
  drawSelection,
  highlightActiveLine,
} from "@codemirror/view";

export const basicSetup = [
  lineNumbers(),
  drawSelection(),
  highlightActiveLine(),
];
