import React, { Fragment } from "react";
import { SuspenderProps } from "./SuspenderLegacy";

interface FreezePromise {
  promise: Promise<void>;
  resolve(): void;
}

function createFreezePromise(): FreezePromise {
  let resolvePromise!: () => void;
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}

export function SuspenderUse({ freeze, children }: SuspenderProps) {
  const freezeRef = React.useRef<FreezePromise>(null);
  if (freeze) {
    if (freezeRef.current === null) {
      freezeRef.current = createFreezePromise();
    }
    React.use(freezeRef.current.promise);
  } else if (freezeRef.current !== null) {
    freezeRef.current.resolve();
    freezeRef.current = null;
  }
  return <Fragment>{children}</Fragment>;
}
