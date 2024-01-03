import * as ts from "typescript";
import path from "path";
import { ParserState } from "./ParserState";
import { parseExports } from "./parseExports";

function compile(fileNames: string[]): void {
  const program = ts.createProgram(fileNames, {
    noEmit: true,
    allowJs: true,
    resolveJsonModule: true,
    skipLibCheck: true,
  });

  const relevantSourceFiles = program
    .getSourceFiles()
    .filter((f) =>
      fileNames
        .map((fn) => path.relative(fn, f.fileName) === "")
        .reduce((a, b) => a || b),
    );

  const typechecker = program.getTypeChecker();

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
    `from typing_extensions import Literal, TypedDict, List, Union, NotRequired, Optional, Tuple, Dict, Any`,
  );

  relevantSourceFiles.forEach((f) => {
    parseExports(state, f);
  });

  for (const statement of state.statements) {
    // we want a single log statement printing the resulting python code
    // eslint-disable-next-line no-console
    console.log(statement, "\n");
  }
}

compile(process.argv.slice(2));
