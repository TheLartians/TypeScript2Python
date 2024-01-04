import { typeScriptToPython } from "../typeScriptToPython";
import { createProject, ts } from "@ts-morph/bootstrap";

export const transpileString = async (code: string) => {
  const project = await createProject();
  const fileName = "test.ts";

  const sourceFile = project.createSourceFile(fileName, code);
  const program = project.createProgram();
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length > 0) {
    throw new Error(
      `code compiled with errors: ${project.formatDiagnosticsWithColorAndContext(
        diagnostics,
      )}`,
    );
  }

  return typeScriptToPython(program.getTypeChecker(), [sourceFile]);
};
