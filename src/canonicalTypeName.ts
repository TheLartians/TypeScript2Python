import { createNewParserState, ParserState } from "./ParserState";
import ts from "typescript";
import { parseTypeDefinition } from "./parseTypeDefinition";

/** 
 * A function that creates a unique string for a given interface or object type,
 * from a fresh parser state. This should return the same string for two semantically
 * identically types, allowing us to re-use existing helper types if the generated
 * strings match. 
 **/
export const getCanonicalTypeName = (state: ParserState, type: ts.Type) => {
    const cachedName = state.canonicalTypeNames.get(type);
    if (cachedName) {
        return cachedName;
    } else {
        const tmpState = createNewParserState(state.typechecker, state.config);
        parseTypeDefinition(tmpState, "TS2PyTmpType", type);
        const result = tmpState.statements.join("\n");
        state.canonicalTypeNames.set(type, result);
        return result;
    }
}
