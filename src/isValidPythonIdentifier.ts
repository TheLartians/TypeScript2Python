const validNameRegex = /^[a-zA-Z_][\w]*$/;

export const isValidPythonIdentifier = (name: string) => {
  return !!name.match(validNameRegex);
};
