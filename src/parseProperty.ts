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
    
    if (symbol.flags & ts.SymbolFlags.Optional) {
      state.imports.add("NotRequired");
      const definition = parseInlineType(
        state,
        // since the entry is already options, the inner type can be non-nullable
        state.typechecker.getNonNullableType(state.typechecker.getTypeOfSymbol(symbol)),
      );
    if (state.config.nullableOptionals) {
      state.imports.add("Optional");
      return `${name}: NotRequired[Optional[${definition}]]${documentationSuffix}`;
    } else {
      return `${name}: NotRequired[${definition}]${documentationSuffix}`;
    }
  } else {
    const definition = parseInlineType(
      state,
      // since the entry is already options, the inner type can be non-nullable
      state.typechecker.getTypeOfSymbol(symbol),
    );
    return `${name}: ${definition}${documentationSuffix}`;
  }
};
