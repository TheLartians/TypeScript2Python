import { transpileString } from "./utils";

describe("transpiling basic types", () => {
  it.each([
    ["export type T = boolean;", "T = bool"],
    ["export type T = number;", "T = float"],
    ["export type T = string;", "T = str"],
    ["export type T = undefined;", "T = None"],
    ["export type T = void;", "T = None"],
    ["export type T = null;", "T = None"],
    [
      "export type T = true;",
      "from typing_extensions import Literal\n\nT = Literal[True]",
    ],
    [
      "export type T = false;",
      "from typing_extensions import Literal\n\nT = Literal[False]",
    ],
    [
      "export type T = 42;",
      "from typing_extensions import Literal\n\nT = Literal[42]",
    ],
    [
      "export type T = 'foo';",
      'from typing_extensions import Literal\n\nT = Literal["foo"]',
    ],
    [
      "export type T = {[key: string]: boolean};",
      "from typing_extensions import Dict\n\nT = Dict[str,bool]",
    ],
    [
      "export type T = {[key: string]: number};",
      "from typing_extensions import Dict\n\nT = Dict[str,float]",
    ],
    [
      "export type T = [string, number]",
      "from typing_extensions import Tuple\n\nT = Tuple[str,float]",
    ],
    [
      "export type T = number[]",
      "from typing_extensions import List\n\nT = List[float]",
    ],
    ["export type T = any;", "from typing_extensions import Any\n\nT = Any"],
    [
      "export type T = unknown;",
      "from typing_extensions import Any\n\nT = Any",
    ],
    [
      "export type T = {[key: string]: {[key: string]: number}};",
      "from typing_extensions import Dict\n\nT = Dict[str,Dict[str,float]]",
    ],
    [
      "export type T = Record<string, number>;",
      "from typing_extensions import Dict\n\nT = Dict[str,float]",
    ],
    [
      "export type T = number | string | Record<string, boolean>",
      "from typing_extensions import Dict, Union\n\nT = Union[str,float,Dict[str,bool]]",
    ],
  ])("transpiles %p to %p", async (input, expected) => {
    const result = await transpileString(input);
    expect(result).toEqual(expected);
  });

  it.each([
    [
      "export type T = number | undefined",
      "from typing_extensions import Union\n\nT = Union[None,float]",
    ],
    [
      "export type T = number | null",
      "from typing_extensions import Union\n\nT = Union[None,float]",
    ],
  ])("transpiles %p to %p when strict", async (input, expected) => {
    const result = await transpileString(input, {}, { strict: true });
    expect(result).toEqual(expected);
  });

  it("only transpiles exported types", async () => {
    const result = await transpileString(`
      type NotExported = number; 
      const notExported: NotExported = 42; 
      export type Exported = number;
      export const exported: Exported = 42;
    `);
    expect(result).not.toContain("NotExported");
    expect(result).not.toContain("exported");
    expect(result).toContain("Exported = float");
  });
});
