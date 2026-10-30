import React, { Fragment } from "react";
import { SuspenderProps } from "./SuspenderLegacy";

interface FreezeThenable {
  then(onFulfilled: () => void): void;
  resolve(): void;
}

function createFreezeThenable(): FreezeThenable {
  let listeners: Array<() => void> = [];
  let done = false;
  return {
    then(onFulfilled) {
      if (done) {
        onFulfilled();
      } else {
        listeners.push(onFulfilled);
      }
    },
    resolve() {
      done = true;
      const pending = listeners;
      listeners = [];
      pending.forEach((listener) => listener());
    },
  };
}

export function SuspenderUse({ freeze, children }: SuspenderProps) {
  const thenableRef = React.useRef<FreezeThenable>(null);
  if (freeze) {
    if (thenableRef.current === null) {
      thenableRef.current = createFreezeThenable();
    }
    React.use(thenableRef.current as unknown as PromiseLike<void>);
  } else if (thenableRef.current !== null) {
    thenableRef.current.resolve();
    thenableRef.current = null;
  }
  return <Fragment>{children}</Fragment>;
}
