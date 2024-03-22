import ts from "typescript";
import { ParserState, createNewParserState } from "./ParserState";
import { parseExports } from "./parseExports";

/**
 * Transpiles the types exported by the source files into Python.
 */
export const typeScriptToPython = (typechecker: ts.TypeChecker, sourceFiles: ts.SourceFile[]) => {
  const state = createNewParserState(typechecker);

  sourceFiles.forEach((f) => {
    parseExports(state, f);
  });

  let importStatement = ""
  if (state.imports.size > 0) {
    importStatement = `from typing_extensions import ${Array.from(state.imports).sort().join(", ")}\n\n`
  }

  return importStatement + state.statements.join("\n\n");
};
