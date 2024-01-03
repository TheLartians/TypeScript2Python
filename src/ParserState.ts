import * as ts from "typescript";

export type ParserState = {
  helperCount: number;
  statements: string[];
  typechecker: ts.TypeChecker;
  knownTypes: Map<ts.Type, string>;
};
