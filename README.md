# TypeScript2Python

## About

This project implements a transpiler for creating [pyright](https://github.com/microsoft/pyright) compatible type declarations automatically from TypeScript code! 
This is useful in a number of scenarios.
For example:

- Safely use JSON objects created by TypeScript projects in Python
- Automatic generation of type-safe APIs between Node.js and Python applications
- An easy way to write complex Python typings using TypeScript

## Example

### TypeScript

```ts
export type Foo = {
    type: "foo"
    foo: number[]
    optional?: string
}

/** DocStrings are supported! */
export type Bar = {
    type: "bar"
    bar: string
    /** nested objects need extra declarations in Python */
    nested: { 
        foo: Foo
    }
}

export type FooBarMap = { 
    [key: string]: Foo | Bar
}

export type TupleType = [string, Foo | Bar, any[]]
```

### TypeScript2Python

```python
from typing_extensions import Any, Dict, List, Literal, NotRequired, Tuple, TypedDict, Union

class Foo(TypedDict):
  type: Literal["foo"]
  foo: List[float]
  optional: NotRequired[str]

class Ts2Py_tliGTOBrDv(TypedDict):
  foo: Foo

class Bar(TypedDict):
  """
  DocStrings are supported!
  """
  type: Literal["bar"]
  bar: str
  nested: Ts2Py_tliGTOBrDv
  """
  nested objects need extra declarations in Python
  """

FooBarMap = Dict[str,Union[Foo,Bar]]

TupleType = Tuple[str,Union[Foo,Bar],List[Any]]
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
- Unions, `string | number`
- Arrays, `boolean[]`
- Nested objects `{ bar: { foo: string } }`, that will get transpiled into helper dictionaries
- Optional properties `{ optional?: number }`, that get transpiled to `NotRequired[...]` attributes
- Docstrings `/** this is very useful */`

## Transpiler options

### Nullable optionals

In TypeScript objects, optional values can also be set to `undefined`. By default we assume the according Python
type to be non-nullable, but a more closely matching behavior can be achieved using the flag `--nullable-optionals`.
This will result in optional entries beeing transpiled as `NotRequired[Optional[T]]` instead of `NotRequired[T]`.

## Limitations

The main focus of this project is transpiling type definitions for serializable data (e.g. JSON objects), and the following is not planned to be supported:

- Generics, as TypeScript's type system is much more powerful than Python's
- Function signatures, as we restrict ourselves to serializable data
- Anything that isn't a type definition
