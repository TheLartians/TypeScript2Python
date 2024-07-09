import ts from "typescript";
import { ParserState } from "./ParserState";
import { parseInlineType } from "./parseInlineType";

export const parseProperty = (state: ParserState, symbol: ts.Symbol) => {
  const name = symbol.getName();
  const documentation = symbol
    .getDocumentationComment(state.typechecker)
    .map((v) => v.text)
    .join("\n");
  const documentationSuffix = documentation
    ? `\n  """\n  ${documentation.replaceAll("\n", "\n  ")}\n  """`
    : "";
  const definition = parseInlineType(
    state,
    state.typechecker.getTypeOfSymbol(symbol),
  );

  if (symbol.flags & ts.SymbolFlags.Optional) {
    state.imports.add("NotRequired");
    if (state.config.nonNullOptionals) {
      return `${name}: NotRequired[${definition}]${documentationSuffix}`;
    } else {
      state.imports.add("Optional");
      return `${name}: NotRequired[Optional[${definition}]]${documentationSuffix}`;
    }
  } else {
    return `${name}: ${definition}${documentationSuffix}`;
  }
};
