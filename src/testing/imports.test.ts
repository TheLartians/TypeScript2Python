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

    const transpiled = typeScriptToPython(program.getTypeChecker(), [
      barSource,
    ]);
    expect(transpiled).toEqual(
      `from typing_extensions import Literal, TypedDict, List, Union, NotRequired, Optional, Tuple, Dict, Any

class __HelperType1__Foo(TypedDict):
  foo: float

class Bar(TypedDict):
  foo: __HelperType1__Foo`,
    );
  });
});

export type T = Record<string, string>;