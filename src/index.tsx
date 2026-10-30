import React, { Suspense, Fragment, use } from "react";

interface SuspenderProps {
  freeze: boolean;
  children: React.ReactNode;
}

function Suspender({ freeze, children }: SuspenderProps) {
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
    use(promiseRef.current);
  }

  if (!freeze) {
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
