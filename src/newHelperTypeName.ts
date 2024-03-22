import { ParserState } from "./ParserState";
import ts from "typescript";

export const newHelperTypeName = (state: ParserState, type?: ts.Type) => {
  const typeName = type?.aliasSymbol?.getName() ?? "";
  return `Ts2Py${typeName}HelperType${++state.helperCount}`;
};
