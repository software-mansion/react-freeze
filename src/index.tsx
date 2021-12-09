import React, { Component, Suspense, Fragment } from "react";

interface StorageRef {
  promise?: Promise<void>;
  resolve?: (value: void | PromiseLike<void>) => void;
}

class Suspender extends Component<{
  freeze: boolean;
  children: React.ReactNode;
}> {
  promiseCache: StorageRef = {};
  render() {
    const { freeze, children } = this.props;
    const { promiseCache } = this;

    if (freeze && !promiseCache.promise) {
      promiseCache.promise = new Promise((resolve) => {
        promiseCache.resolve = resolve;
      });
      throw promiseCache.promise;
    } else if (freeze) {
      throw promiseCache.promise;
    } else if (promiseCache.promise) {
      promiseCache.resolve!();
      promiseCache.promise = undefined;
    }

    return <Fragment>{children}</Fragment>;
  }
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
