import ts, { TypeFlags } from "typescript";
import { ParserState } from "./ParserState";
import { newHelperTypeName } from "./newHelperTypeName";
import { parseTypeDefinition } from "./parseTypeDefinition";
import { getCanonicalTypeName } from "./canonicalTypeName";

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
  } else if (type === state.typechecker.getTrueType()) {
    state.imports.add("Literal");
    return "Literal[True]"
  } else if (type === state.typechecker.getFalseType()) {
    state.imports.add("Literal");
    return "Literal[False]"
  } else if (type === state.typechecker.getAnyType() || ((type.flags & TypeFlags.Unknown) !== 0)) {
    state.imports.add("Any");
    return "Any";
  } else if (type.getFlags() & (ts.TypeFlags.TypeParameter | ts.TypeFlags.TypeVariable)) {
    // we don't support types with generic type parameters
    return `object`;
  } else if (type.isLiteral()) {
    state.imports.add("Literal");
    return `Literal[${JSON.stringify(type.value)}]`;
  } else if (type.isUnion()) {
    state.imports.add("Union");
    return `Union[${type.types
      .map((v) => parseInlineType(state, v))
      .join(",")}]`;
  } else if (state.typechecker.isTupleType(type)) {
    state.imports.add("Tuple");
    return `Tuple[${state.typechecker
      .getTypeArguments(type as ts.TypeReference)
      .map((v) => parseInlineType(state, v))
      .join(",")}]`;
  } else if (type.getStringIndexType() !== undefined) {
    state.imports.add("Dict");
    return `Dict[str,${parseInlineType(state, type.getStringIndexType()!)}]`;
  } else if (state.typechecker.isArrayLikeType(type)) {
    const typeArguments = state.typechecker.getTypeArguments(
      type as ts.TypeReference,
    );
    if (typeArguments.length === 1) {
      state.imports.add("List");
      return `List[${parseInlineType(state, typeArguments[0]!)}]`;
    } else {
      // TODO: figure out why we reach this and replace with correct type definition
      return `object`;
    }
  } else {
    // assume interface or object, we need to create a helper type
    if (!globalScope) {
      const canonicalName = getCanonicalTypeName(state, type);
      const semanticallyIdenticalType = state.knownTypes.get(canonicalName);
      if (semanticallyIdenticalType !== undefined) {
        // we can re-use an existing helper type
        return semanticallyIdenticalType;
      } else {
        // we must create a new type
        const helperName = newHelperTypeName(state, type);
        parseTypeDefinition(state, helperName, type);
        state.knownTypes.set(canonicalName, helperName);
        return helperName;
      }
    } else {
      // type cannot be defined inline
      return undefined;
    }
  }
};
