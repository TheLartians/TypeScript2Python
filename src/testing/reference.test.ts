import { transpileString } from "./utils";

describe("transpiling referenced types", () => {
  it("can refer to previously defined types", async () => {
    const result = await transpileString(`
      type A = { foo: number }
      type B = A | { [key: string]: boolean } | { bar: string }
      export type C = { flat: number, outer: B }
    `);
    expect(result).toEqual(
      `from typing_extensions import Literal, TypedDict, List, Union, NotRequired, Optional, Tuple, Dict, Any

class __HelperType1__A(TypedDict):
  foo: float

class __HelperType2__(TypedDict):
  bar: str

class C(TypedDict):
  flat: float
  outer: Union[__HelperType1__A,Dict[str,bool],__HelperType2__]`,
    );
  });
});

export type T = Record<string, string>;
