import { transpileString } from "./utils";

describe("creating helper types", () => {
  it("converts nested types to helper types", async () => {
    const result = await transpileString(`
      export type T = { inner: { foo: { bar: string } } }
    `);

    expect(result).toEqual(
      `from typing_extensions import TypedDict

class Ts2PyHelperType2(TypedDict):
  bar: str

class Ts2PyHelperType1(TypedDict):
  foo: Ts2PyHelperType2

class T(TypedDict):
  inner: Ts2PyHelperType1`,
    );
  });

  it("reuses identical helper types", async () => {
    const result = await transpileString(`
      export type A = { a: { foo: { bar: string } } }
      export type B = { b: { foo: { bar: string } } }
      export type C = { foo: { bar: string } }
    `);

    expect(result).toEqual(`from typing_extensions import TypedDict

class Ts2PyHelperType2(TypedDict):
  bar: str

class Ts2PyHelperType1(TypedDict):
  foo: Ts2PyHelperType2

class A(TypedDict):
  a: Ts2PyHelperType1

class B(TypedDict):
  b: Ts2PyHelperType1

class C(TypedDict):
  foo: Ts2PyHelperType2`);
  });
});
