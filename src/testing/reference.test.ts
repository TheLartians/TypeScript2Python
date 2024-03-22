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

class Ts2PyAHelperType1(TypedDict):
  foo: float

class Ts2PyHelperType2(TypedDict):
  bar: str

class C(TypedDict):
  flat: float
  outer: Union[Ts2PyAHelperType1,Dict[str,bool],Ts2PyHelperType2]`,
    );
  });
});
