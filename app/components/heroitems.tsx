import { heroauth } from "./heroauth";
import { heroconfig } from "./heroconfig";

export const files = [heroauth, heroconfig];

export const stats = [
  { label: "search", value: "<20ms" },
  { label: "files ok", value: "3k+" },
  { label: "abstraction", value: "0" },
  { label: "open source", value: "100%" },
];
