import React, { Suspense, Fragment } from "react";

const infiniteThenable = { then() {} };

// React 19 has use(). React 17 and 18 keep throwing the thenable.
const { use } = React as { use?(thenable: typeof infiniteThenable): void };

interface SuspenderProps {
  freeze: boolean;
  children: React.ReactNode;
}

function Suspender({ freeze, children }: SuspenderProps) {
  if (freeze) {
    // A thrown thenable makes React 19 schedule a retry each time a frozen
    // boundary suspends again, and two boundaries can then retry each other
    // forever (#44). use() schedules no retry in a concurrent render.
    if (use) {
      use(infiniteThenable);
    }
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
