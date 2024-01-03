import { ParserState } from "./ParserState";
import * as ts from "typescript";

export const newHelperTypeName = (state: ParserState, type?: ts.Type) => {
  const typeName = type?.aliasSymbol?.getName() ?? "";
  return `__HelperType${++state.helperCount}__${typeName}`;
};
