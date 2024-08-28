import { transpileString } from "./utils";

describe("creating helper types", () => {
  it("converts nested types to helper types", async () => {
    const result = await transpileString(`
      export type T = { inner: { foo: { bar: string } } }
    `);

    expect(result).toEqual(
      `from typing_extensions import TypedDict

class Ts2Py_rTIa1O0osy(TypedDict):
  bar: str

class Ts2Py_v6EwABEDVq(TypedDict):
  foo: Ts2Py_rTIa1O0osy

class T(TypedDict):
  inner: Ts2Py_v6EwABEDVq`,
    );
  });

  it("reuses identical helper types", async () => {
    const result = await transpileString(`
      export type A = { a: { foo: { bar: string } } }
      export type B = { b: { foo: { bar: string } } }
      export type C = { foo: { bar: string } }
    `);

    expect(result).toEqual(`from typing_extensions import TypedDict

class Ts2Py_rTIa1O0osy(TypedDict):
  bar: str

class Ts2Py_v6EwABEDVq(TypedDict):
  foo: Ts2Py_rTIa1O0osy

class A(TypedDict):
  a: Ts2Py_v6EwABEDVq

class B(TypedDict):
  b: Ts2Py_v6EwABEDVq

class C(TypedDict):
  foo: Ts2Py_rTIa1O0osy`);
  });

  it("always uses the same helper type names", async () => {
    const result1 = await transpileString(`
      export type A = { a: { foo: { bar: string } } }
    `);
    const result2 = await transpileString(`
      export type B = { b: { bar: { foo: string } } }
      export type A = { a: { foo: { bar: string } } }
    `);

    // the type hashes will be the same, no matter if we define other helper types before
    const expectedAType = `class Ts2Py_rTIa1O0osy(TypedDict):
  bar: str

class Ts2Py_v6EwABEDVq(TypedDict):
  foo: Ts2Py_rTIa1O0osy

class A(TypedDict):
  a: Ts2Py_v6EwABEDVq`;

    expect(result1).toEqual(`from typing_extensions import TypedDict

${expectedAType}`);

    expect(result2).toEqual(`from typing_extensions import TypedDict

class Ts2Py_9ZFaik8GRM(TypedDict):
  foo: str

class Ts2Py_g2bOy1R1LY(TypedDict):
  bar: Ts2Py_9ZFaik8GRM

class B(TypedDict):
  b: Ts2Py_g2bOy1R1LY

${expectedAType}`);
  });
});
