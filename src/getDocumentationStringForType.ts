import ts from "typescript";

export const getDocumentationStringForType = (
  typechecker: ts.TypeChecker,
  type: ts.Type,
) => {
  const jsDocStrings = type.aliasSymbol
    ?.getDocumentationComment(typechecker)
    .map((v) => v.text);
  if (jsDocStrings !== undefined && jsDocStrings?.length > 0) {
    return `${jsDocStrings.join("\n")}`;
  } else {
    return undefined;
  }
};
