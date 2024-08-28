import { typeScriptToPython } from "../typeScriptToPython";
import { createProject, ts } from "@ts-morph/bootstrap";

describe("transpiling referenced types", () => {
  it("can refer to types defined in other files", async () => {
    const project = await createProject();

    project.createSourceFile("foo.ts", `export type Foo = { foo: number }`);
    const barSource = project.createSourceFile(
      "bar.ts",
      `import {Foo} from './foo';\nexport type Bar = {foo: Foo}`,
    );

    const program = project.createProgram();
    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
      throw new Error(
        `code compiled with errors: ${project.formatDiagnosticsWithColorAndContext(
          diagnostics,
        )}`,
      );
    }

    const transpiled = typeScriptToPython(
      program.getTypeChecker(),
      [barSource],
      {},
    );
    expect(transpiled).toEqual(
      `from typing_extensions import TypedDict

class Ts2Py_vxK3pg8Yk2(TypedDict):
  foo: float

class Bar(TypedDict):
  foo: Ts2Py_vxK3pg8Yk2`,
    );
  });

  it("doesn't get confused if imported types have the same name", async () => {
    const project = await createProject();

    project.createSourceFile(
      "foo.ts",
      `
        type Content = { publicFoo: "foo" }; 
        export type Foo = { foo: Content }
    `,
    );
    project.createSourceFile(
      "bar.ts",
      `
        type Content = { publicBar: "bar" }; 
        export type Bar = { bar: Content }
    `,
    );
    const commonSource = project.createSourceFile(
      "common.ts",
      `
        import {Foo} from './foo';
        import {Bar} from './bar';
        export type FooBar = { foo: Foo, bar: Bar }
    `,
    );
    const program = project.createProgram();
    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
      throw new Error(
        `code compiled with errors: ${project.formatDiagnosticsWithColorAndContext(
          diagnostics,
        )}`,
      );
    }

    const transpiled = typeScriptToPython(
      program.getTypeChecker(),
      [commonSource],
      {},
    );
    expect(transpiled).toContain(`publicFoo: Literal["foo"]`);
    expect(transpiled).toContain(`publicBar: Literal["bar"]`);
  });
});
