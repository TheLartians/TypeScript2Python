import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { parseInlineType } from "./tryToParseInlineType";

export const parseProperty = (state: ParserState, symbol: ts.Symbol) => {
  const name = symbol.getName();
  const documentation = symbol
    .getDocumentationComment(state.typechecker)
    .map((v) => v.text)
    .join("\n");
  const documentationSuffix = documentation
    ? `\n  """\n  ${documentation.replaceAll("\n", "\n  ")}\n  """`
    : "";

  if (symbol.declarations?.length === 1) {
    const definition = parseInlineType(
      state,
      state.typechecker.getTypeAtLocation(symbol.declarations[0]!),
    );
    if (symbol.flags & ts.SymbolFlags.Optional) {
      return `${name}: NotRequired[Optional[${definition}]]${documentationSuffix}`;
    } else {
      return `${name}: ${definition}${documentationSuffix}`;
    }
  } else {
    throw new Error("property has unexpected number of declarations");
  }
};
