import { transpileString } from "./utils";

describe("transpiling generic types", () => {
  it("does not transpile generic types", async () => {
    const transpiled = await transpileString(
      `export type Generic<T extends string> = T;`,
    );
    expect(transpiled).not.toContain("Generic");
  });

  it("does transpile fully narrowed generic types", async () => {
    const transpiled = await transpileString(`
      export type Generic<T extends string> = T;
      export type Narrowed = Generic<string>;
    `);
    expect(transpiled).not.toContain("Generic");
    expect(transpiled).toContain("Narrowed = str");
  });
});
