import ts, { TypeFlags } from "typescript";
import { ParserState } from "./ParserState";
import { getDocumentationStringForDict, parseProperty, parsePropertyForDict } from "./parseProperty";
import { getDocumentationStringForType } from "./getDocumentationStringForType";
import { tryToParseInlineType } from "./parseInlineType";
import { isValidPythonIdentifier } from "./isValidPythonIdentifier";

export const parseTypeDefinition = (
  state: ParserState,
  name: string,
  type: ts.Type,
) => {
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
    state.imports.add("TypedDict");
    
    const allKeysAreValidPythonIdentifiers = type
      .getProperties()
      .map((v) => isValidPythonIdentifier(v.getName()))
      .reduce((a,b) => a&&b, true);

    if (allKeysAreValidPythonIdentifiers) {
      const properties = type
        .getProperties()
        .map((v) => parseProperty(state, v));
  
        const definition = `class ${name}(TypedDict):${
        documentation
          ? `\n  """\n  ${documentation.replaceAll("\n", "  \n")}\n  """`
          : ""
      }\n  ${properties.length > 0 ? properties.join(`\n  `) : "pass"}`;
      state.statements.push(definition);
    } else {
      const properties = type
        .getProperties()
        // empty strings are not allowed for keys in TypedDicts
        .filter(v => v.getName() !== "");

      const parsedProperties = properties
        .map((v) => parsePropertyForDict(state, v));

      const propertyDocumentation = properties
        .map((v) => getDocumentationStringForDict(state, v))
        .filter(v => !!v)
        .join("\n");

      const innerDocstring = (documentation ?? "").replaceAll("\n", "  \n") + (propertyDocumentation.length > 0 ? "\n## Entries\n" + propertyDocumentation : "");
      const docstring = innerDocstring.length > 0 ? `\n"""\n${innerDocstring}\n"""` : "";

      const definition = `${name} = TypedDict(${JSON.stringify(name)}, {\n  ${parsedProperties.join(",\n  ")}\n})${docstring}`;

      state.statements.push(definition);
    }

  }
};
