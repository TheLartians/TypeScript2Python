#!/usr/bin/env node

import ts from "typescript";
import path from "path";
import { program } from "@commander-js/extra-typings";
import { typeScriptToPython } from "./typeScriptToPython";
import { Ts2PyConfig } from "./config";

const compile = (fileNames: string[], config: Ts2PyConfig) => {
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

  const transpiled = typeScriptToPython(program.getTypeChecker(), relevantSourceFiles, config)
  console.log(transpiled);
}

program
  .name("typescript2python")
  .description("A program that converts TypeScript type definitions to Python")
  .option("--non-null-optionals", "if set, optional entries in dictionaries will not be `NotRequired[T]` instead of `NotRequired[Optional[T]]`")
  .arguments("<input...>")
  .action((args, options) => {
    compile(args, options)
  })
  .parse(process.argv)

