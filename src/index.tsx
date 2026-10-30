import React, { Suspense } from "react";
import { SuspenderLegacy, SuspenderProps } from "./SuspenderLegacy";
import { SuspenderUse } from "./SuspenderUse";

const Suspender =
  typeof React.use === "function" ? SuspenderUse : SuspenderLegacy;

interface FreezeProps extends SuspenderProps {
  placeholder?: React.ReactNode;
}

export function Freeze({ freeze, children, placeholder = null }: FreezeProps) {
  return (
    <Suspense fallback={placeholder}>
      <Suspender freeze={freeze}>{children}</Suspender>
    </Suspense>
  );
}
