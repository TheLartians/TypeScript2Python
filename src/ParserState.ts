import ts from "typescript";
import { Ts2PyConfig } from "./config";

export type ParserState = {
  statements: string[];
  typechecker: ts.TypeChecker;
  knownTypes: Map<ts.Type | string, string>;
  helperTypeNames: Map<string, ts.Type>;
  canonicalTypeNames: Map<ts.Type, string>;
  imports: Set<string>;
  config: Ts2PyConfig;
};

export const createNewParserState = (typechecker: ts.TypeChecker, config: Ts2PyConfig): ParserState => {
  const knownTypes = new Map<ts.Type, string>();
  knownTypes.set(typechecker.getVoidType(), "None");
  knownTypes.set(typechecker.getUndefinedType(), "None");
  knownTypes.set(typechecker.getStringType(), "str");
  knownTypes.set(typechecker.getBooleanType(), "bool");
  knownTypes.set(typechecker.getNumberType(), "float");

  return {
    statements: [],
    typechecker,
    knownTypes,
    imports: new Set(),
    helperTypeNames: new Map(),
    canonicalTypeNames: new Map(),
    config,
  };
}
