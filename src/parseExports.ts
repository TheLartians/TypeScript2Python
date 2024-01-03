import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { parseProperty } from "./parseProperty";
import { getDocumentationStringForType } from "./getDocumentationStringForType";
import { tryToParseInlineType } from "./tryToParseInlineType";

export const parseTypeDefinition = (
  state: ParserState,
  name: string,
  type: ts.Type,
) => {
  const inlineType = tryToParseInlineType(state, type, true);
  const documentation = getDocumentationStringForType(state.typechecker, type);

  if (inlineType) {
    return `${name} = ${inlineType}${
      documentation ? `\n"""\n${documentation}\n"""` : ""
    }`;
  } else {
    return `class ${name}(TypedDict):${
      documentation
        ? `\n  """\n  ${documentation.replaceAll("\n", "  \n")}\n  """`
        : ""
    }\n  ${type
      .getProperties()
      .map((v) => parseProperty(state, v))
      .join(`\n  `)}`;
  }
};
export function parseExports(state: ParserState, sourceFile: ts.SourceFile) {
  for (const statement of sourceFile.statements) {
    if (
      ts.isTypeAliasDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement)
    ) {
      const isExported = !!(
        ts.getCombinedModifierFlags(statement) & ts.ModifierFlags.Export
      );
      if (isExported) {
        const name = statement.name.getText();
        const type = state.typechecker.getTypeAtLocation(statement);
        const definition = parseTypeDefinition(state, name, type);
        state.statements.push(definition);
        if (!state.knownTypes.has(type)) {
          state.knownTypes.set(type, name);
        }
      }
    }
  }

  return state.statements;
}
