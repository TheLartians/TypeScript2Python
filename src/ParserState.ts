import ts from "typescript";

export type ParserState = {
  helperCount: number;
  statements: string[];
  typechecker: ts.TypeChecker;
  knownTypes: Map<ts.Type | string, string>;
  imports: Set<string>;
};

export const createNewParserState = (typechecker: ts.TypeChecker): ParserState => {
  const knownTypes = new Map<ts.Type, string>();
  knownTypes.set(typechecker.getVoidType(), "None");
  knownTypes.set(typechecker.getUndefinedType(), "None");
  knownTypes.set(typechecker.getStringType(), "str");
  knownTypes.set(typechecker.getBooleanType(), "bool");
  knownTypes.set(typechecker.getNumberType(), "float");

  return {
    statements: [],
    helperCount: 0,
    typechecker,
    knownTypes,
    imports: new Set(),
  };
}
