import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { parseProperty } from "./parseProperty";
import { getDocumentationStringForType } from "./getDocumentationStringForType";
import { tryToParseInlineType } from "./parseInlineType";
import { isValidPythonIdentifier } from "./isValidPythonIdentifier";

export const parseTypeDefinition = (
  state: ParserState,
  name: string,
  type: ts.Type,
) => {
  
  if ((type.getFlags() & ts.TypeFlags.TypeParameter) !== 0) {
    // we don't support types with generic type parameters
    return;
  }

  const inlineType = tryToParseInlineType(state, type, true);
  const documentation = getDocumentationStringForType(state.typechecker, type);

  if (!state.knownTypes.has(type)) {
    // we set the currently parsed type here to prevent recursions
    state.knownTypes.set(type, name);
  }

  if (inlineType) {
    const definition = `${name} = ${inlineType}${
      documentation ? `\n"""\n${documentation}\n"""` : ""
    }`;
    state.statements.push(definition);
  } else {
    const properties = type
      .getProperties()
      .filter((v) => isValidPythonIdentifier(v.getName()))
      .map((v) => parseProperty(state, v));

      const definition = `class ${name}(TypedDict):${
      documentation
        ? `\n  """\n  ${documentation.replaceAll("\n", "  \n")}\n  """`
        : ""
    }\n  ${properties.length > 0 ? properties.join(`\n  `) : "pass"}`;

    state.statements.push(definition);
  }
};
