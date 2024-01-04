import { transpileString } from "./utils";

describe("transpiling basic types", () => {
  it.each([
    ["export type T = any;", "T = Any"],
    ["export type T = boolean;", "T = bool"],
    ["export type T = number;", "T = float"],
    ["export type T = string;", "T = str"],
    ["export type T = undefined;", "T = None"],
    ["export type T = void;", "T = None"],
    ["export type T = true;", "T = Literal[True]"],
    ["export type T = false;", "T = Literal[False]"],
    ["export type T = 42;", "T = Literal[42]"],
    ["export type T = 'foo';", 'T = Literal["foo"]'],
    ["export type T = {[key: string]: boolean};", "T = Dict[str,bool]"],
    ["export type T = {[key: string]: number};", "T = Dict[str,float]"],
    [
      "export type T = {[key: string]: {[key: string]: number}};",
      "T = Dict[str,Dict[str,float]]",
    ],
    ["export type T = Record<string, number>;", "T = Dict[str,float]"],
    [
      "export type T = number | string | Record<string, boolean>",
      "T = Union[str,float,Dict[str,bool]]",
    ],
  ])("transpiles %p to %p", async (input, expected) => {
    const result = await transpileString(input);
    expect(result.split("\n")[2]).toEqual(expected);
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

export type T = Record<string, string>;
