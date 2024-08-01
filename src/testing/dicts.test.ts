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
      `class Ts2PyHelperType1(TypedDict):
  inner: str

class A(TypedDict):
  outer: Ts2PyHelperType1
  extra: float`,
    );
  });

  it("can transpile intersections", async () => {
    const result = await transpileString(
      `export type A = { foo: string } & { bar: number }`,
    );
    expect(result).toContain(`class A(TypedDict):\n  foo: str\n  bar: float`);
  });

  it("transpiles optional values as NotRequired[Optional[T]]", async () => {
    const result = await transpileString(`export type A = { foo?: string }`);
    expect(result).toContain(`class A(TypedDict):\n  foo: NotRequired[str]`);
  });

  it("transpiles optional values with non-null optionals as NotRequired[T]", async () => {
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
});
