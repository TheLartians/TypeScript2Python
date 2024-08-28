import { transpileString } from "./utils";

describe("readme", () => {
  it("transpiles the readme example", async () => {
    const result = await transpileString(`
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
    `);

    // note: if this needs to be updated, be sure to update the readme as well
    expect(result)
      .toEqual(`from typing_extensions import Any, Dict, List, Literal, NotRequired, Tuple, TypedDict, Union

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

TupleType = Tuple[str,Union[Foo,Bar],List[Any]]`);
  });
});
