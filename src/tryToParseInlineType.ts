import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { newHelperTypeName } from "./newHelperTypeName";
import { parseTypeDefinition } from "./parseExports";

export const parseInlineType = (state: ParserState, type: ts.Type) => {
  const result = tryToParseInlineType(state, type);
  if (result !== undefined) {
    return result;
  } else {
    throw new Error(`could not parse type`);
  }
};
export const tryToParseInlineType = (
  state: ParserState,
  type: ts.Type,
  globalScope?: boolean,
): string | undefined => {
  const known = state.knownTypes.get(type);
  if (known !== undefined) {
    return known;
  } else if (type.isLiteral()) {
    return `Literal[${JSON.stringify(type.value)}]`;
  } else if (type.isUnion()) {
    return `Union[${type.types
      .map((v) => parseInlineType(state, v))
      .join(",")}]`;
  } else if (state.typechecker.isArrayType(type)) {
    return `List[${state.typechecker
      .getTypeArguments(type as ts.TypeReference)
      .map((v) => parseInlineType(state, v))
      .join(",")}]`;
  } else {
    // assume interface or object
    if (!globalScope) {
      const helperName = newHelperTypeName(state);
      state.statements.push(parseTypeDefinition(state, helperName, type));
      return helperName;
    } else {
      // needs to be defined outside
      return undefined;
    }
  }
};
