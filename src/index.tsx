import React, { Suspense, Fragment, use } from "react";

interface SuspenderProps {
  freeze: boolean;
  children: React.ReactNode;
}

function Suspender({ freeze, children }: SuspenderProps) {
  // Create a stable promise which we can later use to suspend the component.
  const promiseRef = React.useRef<Promise<void>>(null);
  // Ref to store the promise's resolver function, to be called when un-freezing.
  const resolverRef = React.useRef<() => void>(null);
  if (promiseRef.current === null && freeze) {
    promiseRef.current = new Promise<void>((resolve) => {
      resolverRef.current = resolve;
    });
  }

  if (!freeze && resolverRef.current != null) {
    // Un-freeze: call the resolver to resolve the promise and un-suspend.
    resolverRef.current();
    resolverRef.current = null;
  }

  if (promiseRef.current !== null) {
    // Suspend by using the promise, or when promise resolved it un-suspends.
    use(promiseRef.current);
  }

  if (!freeze) {
    // Only reset promise here, as when un-freezing we want to "ping the attached listeners" that the promise is resolved.
    // Thats why we call the resolver above when !freeze.
    promiseRef.current = null;
  }

  return <Fragment>{children}</Fragment>;
}

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
