import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { parseProperty } from "./parseProperty";
import { getDocumentationStringForType } from "./getDocumentationStringForType";
import { tryToParseInlineType } from "./parseInlineType";

const validNameRegex = /^[a-zA-Z_$][\w$]*$/;

export const parseTypeDefinition = (
  state: ParserState,
  name: string,
  type: ts.Type,
) => {
  const inlineType = tryToParseInlineType(state, type, true);
  const documentation = getDocumentationStringForType(state.typechecker, type);

  if (!state.knownTypes.has(type)) {
    // prevent recursions
    state.knownTypes.set(type, name);
  }

  if (inlineType) {
    return `${name} = ${inlineType}${
      documentation ? `\n"""\n${documentation}\n"""` : ""
    }`;
  } else {
    const properties = type
      .getProperties()
      .filter((v) => v.getName().match(validNameRegex))
      .map((v) => parseProperty(state, v));

    return `class ${name}(TypedDict):${
      documentation
        ? `\n  """\n  ${documentation.replaceAll("\n", "  \n")}\n  """`
        : ""
    }\n  ${properties.length > 0 ? properties.join(`\n  `) : "pass"}`;
  }
};
