import { transpileString } from "./utils";

describe("transpiling referenced types", () => {
  it("can refer to previously defined types", async () => {
    const result = await transpileString(`
      type A = { foo: number }
      type B = A | { [key: string]: boolean } | { bar: string }
      export type C = { flat: number, outer: B }
    `);
    expect(result).toEqual(
      `from typing_extensions import Dict, TypedDict, Union

class Ts2Py_vxK3pg8Yk2(TypedDict):
  foo: float

class Ts2Py_rTIa1O0osy(TypedDict):
  bar: str

class C(TypedDict):
  flat: float
  outer: Union[Ts2Py_vxK3pg8Yk2,Dict[str,bool],Ts2Py_rTIa1O0osy]`,
    );
  });
});
