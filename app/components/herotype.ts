import type { ReactNode } from "react";

export interface line {
  num: number;
  content: ReactNode;
}

export interface file {
  name: string;
  lines: line[];
  raw: string;
}
