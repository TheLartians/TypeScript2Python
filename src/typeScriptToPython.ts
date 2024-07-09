import ts from "typescript";
import { createNewParserState } from "./ParserState";
import { parseExports } from "./parseExports";
import { Ts2PyConfig } from "./config";

/**
 * Transpiles the types exported by the source files into Python.
 */
export const typeScriptToPython = (typechecker: ts.TypeChecker, sourceFiles: ts.SourceFile[], config: Ts2PyConfig) => {
  const state = createNewParserState(typechecker, config);

  sourceFiles.forEach((f) => {
    parseExports(state, f);
  });

  let importStatement = ""
  if (state.imports.size > 0) {
    importStatement = `from typing_extensions import ${Array.from(state.imports).sort().join(", ")}\n\n`
  }

  return importStatement + state.statements.join("\n\n");
};
