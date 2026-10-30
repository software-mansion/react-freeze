import React, { Fragment } from "react";
import { SuspenderProps } from "./SuspenderLegacy";

export function SuspenderUse({ freeze, children }: SuspenderProps) {
  const promiseRef = React.useRef<Promise<void>>(null);
  const resolverRef = React.useRef<() => void>(null);
  if (promiseRef.current === null && freeze) {
    promiseRef.current = new Promise<void>((resolve) => {
      resolverRef.current = resolve;
    });
  }

  if (!freeze && resolverRef.current != null) {
    resolverRef.current();
    resolverRef.current = null;
  }

  if (promiseRef.current !== null) {
    React.use(promiseRef.current);
  }

  if (!freeze) {
    promiseRef.current = null;
  }

  return <Fragment>{children}</Fragment>;
}
