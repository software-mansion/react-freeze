import React, { Suspense, Fragment } from "react";

const infinitePromise = new Promise(
  // @ts-ignore
  (resolve) => {}
);

function Suspender({
  freeze,
  children,
}: {
  freeze: boolean;
  children: React.ReactNode;
}) {
  if (freeze) {
    throw infinitePromise;
  }
  return <Fragment>{children}</Fragment>;
}

interface Props {
  freeze: boolean;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}

export function Freeze({ freeze, children, placeholder = null }: Props) {
  return (
    <Suspense fallback={placeholder}>
      <Suspender freeze={freeze}>{children}</Suspender>
    </Suspense>
  );
}
