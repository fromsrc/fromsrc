"use client";

import { memo } from "react";
import type { ReactElement } from "react";

import { Install } from "./install";

export interface CreateProps {
  package?: string;
}

function CreateBase({ package: Pkg = "fromsrc" }: CreateProps): ReactElement {
  return <Install package={Pkg} mode="create" />;
}

export const Create = memo(CreateBase);
