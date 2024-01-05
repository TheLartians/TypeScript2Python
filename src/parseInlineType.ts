import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { newHelperTypeName } from "./newHelperTypeName";
import { parseTypeDefinition } from "./parseTypeDefinition";

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
  } else if (type.getFlags() & (ts.TypeFlags.TypeParameter | ts.TypeFlags.TypeVariable)) {
    // we don't support types with generic type parameters
    return `object`;
  } else if (type.isLiteral()) {
    return `Literal[${JSON.stringify(type.value)}]`;
  } else if (type.isUnion()) {
    return `Union[${type.types
      .map((v) => parseInlineType(state, v))
      .join(",")}]`;
  } else if (state.typechecker.isTupleType(type)) {
    return `Tuple[${state.typechecker
      .getTypeArguments(type as ts.TypeReference)
      .map((v) => parseInlineType(state, v))
      .join(",")}]`;
  } else if (type.getStringIndexType() !== undefined) {
    return `Dict[str,${parseInlineType(state, type.getStringIndexType()!)}]`;
  } else if (state.typechecker.isArrayLikeType(type)) {
    const typeArguments = state.typechecker.getTypeArguments(
      type as ts.TypeReference,
    );
    if (typeArguments.length === 1) {
      return `List[${parseInlineType(state, typeArguments[0]!)}]`;
    } else {
      // TODO: figure out why we reach this and replace with correct type definition
      return `object`;
    }
  } else {
    // assume interface or object
    if (!globalScope) {
      const helperName = newHelperTypeName(state, type);
      parseTypeDefinition(state, helperName, type);
      return helperName;
    } else {
      // type cannot be defined inline
      return undefined;
    }
  }
};
