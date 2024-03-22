#!/usr/bin/env node

import ts from "typescript";
import path from "path";
import { program } from "@commander-js/extra-typings";
import { typeScriptToPython } from "./typeScriptToPython";

const compile = (fileNames: string[]) => {
  const program = ts.createProgram(fileNames, {
    noEmit: true,
    allowJs: true,
    resolveJsonModule: true,
    skipLibCheck: true,
  });

  const relevantSourceFiles = program
    .getSourceFiles()
    .filter((f) =>
      fileNames
        .map((fn) => path.relative(fn, f.fileName) === "")
        .reduce((a, b) => a || b),
    );

  const transpiled = typeScriptToPython(program.getTypeChecker(), relevantSourceFiles)
  console.log(transpiled);
}

program
  .name("typescript2python")
  .description("A program that converts TypeScript type definitions to Python")
  .arguments("<input...>")
  .action(args => {
    compile(args)
  })
  .parse(process.argv)

