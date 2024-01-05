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
`class Ts2Py(HelperType1TypedDict):
  inner: str

class A(TypedDict):
  outer: __HelperType1__
  extra: float`
)
  });
});

export type T = Record<string, string>;
