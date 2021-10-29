import React, { useRef, Suspense, Fragment } from "react";

interface StorageRef {
  promise?: Promise<void>;
  resolve?: (value: void | PromiseLike<void>) => void;
}

function Suspender({
  freeze,
  children,
}: {
  freeze: boolean;
  children: React.ReactNode;
}) {
  const promiseCache = useRef<StorageRef>({}).current;
  if (freeze && !promiseCache.promise) {
    promiseCache.promise = new Promise((res) => {
      promiseCache.resolve = res;
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
