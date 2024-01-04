# TypeScript2Python

## About

This project implements a transpiler for creating [pyright](https://github.com/microsoft/pyright) compatible type declarations automatically from TypeScript code! This is useful in a number of scenarios.

- Automatic generation of type-safe APIs between Node.js and Python services
- Safely use JSON objects created by TypeScript projects in Python
- A much nicer way to write complex types using Python

## Example

### TypeScript
```ts
export type Foo = {
    type: "foo"
    foo: number[]
    optional?: string
}

/** 
 * DocStrings are supported!
 **/
export type Bar = {
    type: "bar"
    bar: string
    nested: { 
        /** nested objects need extra declarations in Python */
        foo: Foo
    }
}

export type FooBarMap = { 
    [key: string]: Foo | Bar
}
```

### TypeScript2Python

```python
from typing_extensions import Literal, TypedDict, List, Union, NotRequired, Optional, Tuple, Dict, Any

class Foo(TypedDict):
  type: Literal["foo"]
  foo: List[float]
  optional: NotRequired[Optional[str]]

class __HelperType1__(TypedDict):
  foo: Foo
  """
  nested objects need extra declarations in Python
  """

class Bar(TypedDict):
  """
  DocStrings are supported!
  """
  type: Literal["bar"]
  bar: str
  nested: __HelperType1__

FooBarMap = Dict[str,Union[Foo,Bar]]
```


## Usage

The easiest way to use TypeScript2Python, is to invoke it directly using `npx` and pointing it to one (or multiple) source files that export type declarations.

```bash
npx typescript2python <path to typescript source>
```

It will then output the transpiled code to the terminal.
To save the output as a python file, simply pipe the result to the desired destination.
For example `npx typescript2python types.ts > types.py`.

## Features

TypeScript2Python supports many of TypeScripts type constructs, including:

- Basic types, like `boolean`, `number`, `string`, `undefined`
- Literal types, e.g. `type X = 42`, `type Y = 'test'`
- Object types, `{ foo: string }` 
- Nested objects `{ bar: { foo: string } }`, that will get transpiled into helper dictionaries
- Optional properties `{ optional?: number }`, that get transpiled to `NotRequired[Optional[...]]` attributes
