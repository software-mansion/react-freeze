import React, { Suspense, Fragment } from "react";

const infiniteThenable = { then() {} };

interface SuspenderProps {
  freeze: boolean;
  children: React.ReactNode;
}

function Suspender({ freeze, children }: SuspenderProps) {
  if (freeze) {
    throw infiniteThenable;
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
