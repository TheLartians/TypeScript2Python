import { transpileString } from "./utils";

describe("transpiling dictionaries types", () => {
  it("can transpile dicts", async () => {
    const result = await transpileString(`export type A = {
      foo: string,
      bar: number,
    }`);
    expect(result).toContain(`class A(TypedDict):\n  foo: str\n  bar: float`);
  });

  it("keeps docstrings", async () => {
    const result = await transpileString(`
      /** This is A */
      export type A = {
        /** this is foo */
        foo: string,
        /** this is bar */
        bar: number,
      }
    `);
    expect(result).toContain(
      `class A(TypedDict):
  """
  This is A
  """
  foo: str
  """
  this is foo
  """
  bar: float
  """
  this is bar
  """`,
    );
  });

  it("can transpile nested dicts", async () => {
    const result = await transpileString(`export type A = {
      outer: {
        inner: string
      },
      extra: number,
    }`);
    expect(result).toContain(
      `class Ts2Py_FOZhdT9ykh(TypedDict):
  inner: str

class A(TypedDict):
  outer: Ts2Py_FOZhdT9ykh
  extra: float`,
    );
  });

  it("can transpile intersections", async () => {
    const result = await transpileString(
      `export type A = { foo: string } & { bar: number }`,
    );
    expect(result).toContain(`class A(TypedDict):\n  foo: str\n  bar: float`);
  });

  it("transpiles optional values as NotRequired[T]", async () => {
    const result = await transpileString(`export type A = { foo?: string }`);
    expect(result).toContain(`class A(TypedDict):\n  foo: NotRequired[str]`);
  });

  it("transpiles optional values as NotRequired[T] in strict mode", async () => {
    const result = await transpileString(
      `export type A = { foo?: string }`,
      {},
      { strict: true },
    );
    expect(result).toContain(`class A(TypedDict):\n  foo: NotRequired[str]`);
  });

  it("transpiles optional values with non-null optionals as NotRequired[Optional[T]]", async () => {
    const result = await transpileString(`export type A = { foo?: string }`, {
      nullableOptionals: true,
    });
    expect(result).toContain(
      `class A(TypedDict):\n  foo: NotRequired[Optional[str]]`,
    );
  });

  it("transpiles records as dicts", async () => {
    const result = await transpileString(
      `export type A = Record<"foo" | "bar", number>`,
    );
    expect(result).toContain(`class A(TypedDict):\n  foo: float\n  bar: float`);
  });

  it("falls back to the functional syntax if keys are unsupported", async () => {
    const result = await transpileString(`export type A = {
      "foo.bar"?: string,
    }`);
    expect(result).toEqual(
      `from typing_extensions import NotRequired, TypedDict

A = TypedDict("A", {
  "foo.bar": NotRequired[str]
})`,
    );
  });

  it("ignores empty string property names in functional dicts", async () => {
    const result = await transpileString(`export type A = {
      "": string,
      "foo.bar"?: string,
    }`);
    expect(result).toContain(
      `A = TypedDict("A", {
  "foo.bar": NotRequired[str]
})`,
    );
  });

  it("moves the key/value docstrings to the object docstring in the functional syntax", async () => {
    const result = await transpileString(`
      /** This is A */
      export type A = {
        /** this is foo.bar */
        "foo.bar": string,
        /** this is a/b */
        "a/b": number,
        "undocumented": string,
      }
    `);
    expect(result).toContain(`A = TypedDict("A", {
  "foo.bar": str,
  "a/b": float,
  "undocumented": str
})
"""
This is A
## Entries
"foo.bar": this is foo.bar
"a/b": this is a/b
"""`);
  });
});
