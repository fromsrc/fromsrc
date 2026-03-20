"use client";

import { memo } from "react";
import type { ReactNode } from "react";

export interface ErrorMessageProps {
  id?: string;
  children: ReactNode;
}

function ErrorMessageInner({
  id,
  children,
}: ErrorMessageProps): React.ReactElement {
  return (
    <span id={id} className="text-xs text-red-400" role="alert">
      {children}
    </span>
  );
}

export const ErrorMessage = memo(ErrorMessageInner);
