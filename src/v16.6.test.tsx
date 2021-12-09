import { Dispatch } from "react";
import React, { Component } from "react/v16.6";
import TestRenderer, { ReactTestRendererJSON } from "react-test-renderer/v16.6";

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
  const testRenderer = TestRenderer.create(<A />);
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
  const testRenderer = TestRenderer.create(<A />);
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
  const testRenderer = TestRenderer.create(<A freeze={false} />);
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Content)).toBeTruthy();
  testRenderer.update(<A freeze />);
  expect(testRenderer?.toJSON()).toBe(null);
});

test("Updates work when not frozen", () => {
  let subscription: React.Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <></>;
  }
  let renderCount = 0;
  class Subscriber extends Component {
    state = {
      value: 0,
    };

    setValue = (value: number) => this.setState({ value });
    componentDidMount() {
      subscription = this.setValue;
    }

    render() {
      const { value } = this.state;
      renderCount = renderCount + 1;
      return <Inner value={value} />;
    }
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  const testRenderer = TestRenderer.create(<Container freeze={false} />);
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  subscription!(1);
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
  class Subscriber extends Component {
    state = {
      value: 0,
    };

    setValue = (value: number) => this.setState({ value });
    componentDidMount() {
      subscription = this.setValue;
    }

    render() {
      const { value } = this.state;
      renderCount = renderCount + 1;
      return <Inner value={value} />;
    }
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  const testRenderer = TestRenderer.create(<Container freeze={false} />);
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  testRenderer.update(<Container freeze />);
  subscription!(1);
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  expect(renderCount).toBe(1);
});

test("State persists after defrost", async () => {
  let subscription: Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <div />;
  }
  let renderCount = 0;

  class Subscriber extends Component {
    state = {
      value: 0,
    };

    setValue = (value: number) => this.setState({ value });
    componentDidMount() {
      subscription = this.setValue;
    }

    render() {
      const { value } = this.state;
      renderCount = renderCount + 1;
      return <Inner value={value} />;
    }
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  const testRenderer = TestRenderer.create(<Container freeze={false} />);
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  subscription!(1);
  expect(testInstance?.findByType(Inner).props.value).toEqual(1);
  testRenderer.update(<Container freeze />);
  expect(testRenderer?.toJSON()).toBe(null);
  testRenderer.update(<Container freeze={false} />);
  // Add a delay because it may not be updated immediately
  await new Promise((resolve) => setTimeout(resolve));
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

  class Subscriber extends Component {
    state = {
      value: 0,
    };

    setValue = (value: number) => this.setState({ value });
    componentDidMount() {
      subscription = this.setValue;
    }

    render() {
      const { value } = this.state;
      renderCount = renderCount + 1;
      return <Inner value={value} />;
    }
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  const testRenderer = TestRenderer.create(<Container freeze={false} />);
  const testInstance = testRenderer?.root;
  testRenderer.update(<Container freeze />);
  subscription!(1);
  subscription!(2);
  subscription!(3);
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  testRenderer.update(<Container freeze={false} />);
  expect(testInstance?.findByType(Inner).props.value).toEqual(3);
  expect(renderCount).toBe(2);
});

test("Component should not unmount when frozen", async () => {
  let unmounted = false;
  class Test extends Component {
    componentWillUnmount() {
      unmounted = true;
    }

    render() {
      return <></>;
    }
  }
  function A({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Test />
      </Freeze>
    );
  }
  const testRenderer = TestRenderer.create(<A freeze={false} />);
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Test)).toBeTruthy();
  testRenderer.update(<A freeze />);
  // Add a delay because it may not be updated immediately
  await new Promise((resolve) => setTimeout(resolve));
  expect(unmounted).toBe(false);
});
