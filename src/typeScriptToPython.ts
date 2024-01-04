import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { parseExports } from "./parseExports";

/**
 * Transpiles the types exported by the source files into Python.
 */
export const typeScriptToPython = (typechecker: ts.TypeChecker, sourceFiles: ts.SourceFile[]) => {
  const knownTypes = new Map<ts.Type, string>();
  knownTypes.set(typechecker.getAnyType(), "Any");
  knownTypes.set(typechecker.getVoidType(), "None");
  knownTypes.set(typechecker.getUndefinedType(), "None");
  knownTypes.set(typechecker.getStringType(), "str");
  knownTypes.set(typechecker.getBooleanType(), "bool");
  knownTypes.set(typechecker.getNumberType(), "float");
  knownTypes.set(typechecker.getTrueType(), "Literal[True]");
  knownTypes.set(typechecker.getFalseType(), "Literal[False]");

  const state: ParserState = {
    statements: [],
    helperCount: 0,
    typechecker,
    knownTypes,
  };

  state.statements.push(
    `from typing_extensions import Literal, TypedDict, List, Union, NotRequired, Optional, Tuple, Dict, Any`
  );

  sourceFiles.forEach((f) => {
    parseExports(state, f);
  });

  return state.statements.join("\n\n");
};
