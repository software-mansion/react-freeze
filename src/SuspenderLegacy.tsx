import React, { Fragment } from "react";

const infiniteThenable = { then() {} };

export interface SuspenderProps {
  freeze: boolean;
  children: React.ReactNode;
}

export function SuspenderLegacy({ freeze, children }: SuspenderProps) {
  if (freeze) {
    throw infiniteThenable;
  }
  return <Fragment>{children}</Fragment>;
}
