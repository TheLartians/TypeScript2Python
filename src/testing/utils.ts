import { Ts2PyConfig } from "../config";
import { typeScriptToPython } from "../typeScriptToPython";
import { createProject, ts } from "@ts-morph/bootstrap";

/**
 * We create only a single global project to improve performance when sequentially
 * transpiling multiple files.
 **/
let globalProject: ReturnType<typeof createProject> | undefined;

export const transpileString = async (
  code: string,
  config: Ts2PyConfig = {},
) => {
  if (globalProject === undefined) {
    globalProject = createProject({
      useInMemoryFileSystem: true,
    });
  }

  const project = await globalProject;
  const fileName = `source.ts`;

  // instead of adding a new source file for each program, we update the existing one.
  const sourceFile = project.updateSourceFile(fileName, code);
  const program = project.createProgram();
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length > 0) {
    throw new Error(
      `code compiled with errors: ${project.formatDiagnosticsWithColorAndContext(
        diagnostics,
      )}`,
    );
  }

  return typeScriptToPython(program.getTypeChecker(), [sourceFile], config);
};
