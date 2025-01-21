import { Ts2PyConfig } from "../config";
import { typeScriptToPython } from "../typeScriptToPython";
import { createProject, ts } from "@ts-morph/bootstrap";

/**
 * We create only a single global project to improve performance when sequentially
 * transpiling multiple files.
 **/
let globalProject: ReturnType<typeof createProject> | undefined;

/** Each file should get a unique name to avoid issues. */
let i = 0;

export const transpileString = async (
  code: string,
  config: Ts2PyConfig = {},
  compilerOptions: ts.CompilerOptions = {},
) => {
  if (globalProject === undefined) {
    globalProject = createProject({
      useInMemoryFileSystem: true,
    });
  }

  const project = await globalProject;
  const fileName = `source_${i++}.ts`;

  // instead of adding a new source file for each program, we update the existing one.
  const sourceFile = project.updateSourceFile(fileName, code);
  const program = project.createProgram({
    rootNames: [fileName],
    options: { ...project.compilerOptions, ...compilerOptions },
  });
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
