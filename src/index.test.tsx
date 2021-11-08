import React, { Dispatch, useEffect, useState } from "react";
import {
  create,
  act,
  ReactTestRenderer,
  ReactTestRendererJSON,
} from "react-test-renderer";

import { Freeze } from ".";

test("Renders stuff not frozen", () => {
  function Content() {
    return <div />;
  }
  function A() {
    return (
      <Freeze freeze={false}>
        <Content />
      </Freeze>
    );
  }
  const testRenderer = create(<A />);
  const testInstance = testRenderer.root;
  expect(testInstance.findByType(Content)).toBeTruthy();
});

test("Does not render stuff when frozen", () => {
  function Content() {
    return <div />;
  }
  function A() {
    return (
      <Freeze freeze>
        <Content />
      </Freeze>
    );
  }
  const testRenderer = create(<A />);
  const testInstance = testRenderer.root;
  expect(testInstance.findAllByType(Content)).toHaveLength(0);
});

test("Stuff is gone after freeze", () => {
  function Content() {
    return <div />;
  }
  function A({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Content />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<A freeze={false} />);
  });
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Content)).toBeTruthy();
  act(() => testRenderer?.update(<A freeze />));
  expect(testRenderer?.toJSON()).toBe(null);
});

test("Updates work when not frozen", () => {
  let subscription: React.Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <></>;
  }
  let renderCount = 0;
  function Subscriber() {
    const [value, setValue] = useState(0);
    useEffect(() => {
      subscription = setValue;
    }, []);
    renderCount = renderCount + 1;
    return <Inner value={value} />;
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<Container freeze={false} />);
  });
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  act(() => subscription(1));
  expect(testInstance?.findByType(Inner).props.value).toEqual(1);
  expect(renderCount).toBe(2);
});

test("Updates does not propagate when frozen", () => {
  let subscription: Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <div />;
  }
  let renderCount = 0;
  function Subscriber() {
    const [value, setValue] = useState(0);
    useEffect(() => {
      subscription = setValue;
    }, []);
    renderCount = renderCount + 1;
    return <Inner value={value} />;
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<Container freeze={false} />);
  });
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  act(() => testRenderer?.update(<Container freeze />));
  act(() => subscription(1));
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  expect(renderCount).toBe(1);
});

test("State persists after defrost", () => {
  let subscription: Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <div />;
  }
  let renderCount = 0;
  function Subscriber() {
    const [value, setValue] = useState(0);
    useEffect(() => {
      subscription = setValue;
    }, []);
    renderCount = renderCount + 1;
    return <Inner value={value} />;
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<Container freeze={false} />);
  });
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  act(() => subscription(1));
  expect(testInstance?.findByType(Inner).props.value).toEqual(1);
  act(() => testRenderer?.update(<Container freeze />));
  expect(testRenderer?.toJSON()).toBe(null);
  act(() => testRenderer?.update(<Container freeze={false} />));
  expect((testRenderer?.toJSON() as ReactTestRendererJSON).type).toBe("div");
  expect(testInstance?.findByType(Inner).props.value).toEqual(1);
});

test("Update propagate after defrrost", () => {
  let subscription: Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <div />;
  }
  let renderCount = 0;
  function Subscriber() {
    const [value, setValue] = useState(0);
    useEffect(() => {
      subscription = setValue;
    }, []);
    renderCount = renderCount + 1;
    return <Inner value={value} />;
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<Container freeze={false} />);
  });
  const testInstance = testRenderer?.root;
  act(() => testRenderer?.update(<Container freeze />));
  act(() => subscription(1));
  act(() => subscription(2));
  act(() => subscription(3));
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  act(() => testRenderer?.update(<Container freeze={false} />));
  expect(testInstance?.findByType(Inner).props.value).toEqual(3);
  expect(renderCount).toBe(2);
});
