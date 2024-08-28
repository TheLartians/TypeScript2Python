import { ParserState } from "./ParserState";
import ts from "typescript";
import { createHash } from "node:crypto"
import { getCanonicalTypeName } from "./canonicalTypeName";

export const newHelperTypeName = (state: ParserState, type: ts.Type) => {
  // to keep helper type names predictable and not dependent on the order of definition,
  // we use the first 10 characters of a sha256 hash of the type. If there is an unexpected
  // collision, we fallback to using an incrementing counter.
  const fullHash = createHash("sha256").update(getCanonicalTypeName(state, type));
  // for the short hash, we remove all non-alphanumeric characters from the hash and take the
  // first 10 characters.
  let shortHash = fullHash.digest("base64").replace(/\W/g, '').substring(0, 10);
  if (state.helperTypeNames.has(shortHash) && state.helperTypeNames.get(shortHash) !== type) {
    shortHash = "HelperType" + state.helperTypeNames.size.toString();
  }
  return `Ts2Py_${shortHash}`;
};
