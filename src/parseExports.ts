import * as ts from "typescript";
import { ParserState } from "./ParserState";
import { parseTypeDefinition } from "./parseTypeDefinition";

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
      }
    }
  }

  return state.statements;
}
