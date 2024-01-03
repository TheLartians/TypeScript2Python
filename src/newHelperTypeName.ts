import { ParserState } from "./ParserState";

export const newHelperTypeName = (state: ParserState) => {
  return `__HelperType${++state.helperCount}`;
};
