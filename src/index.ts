import { exit } from "process";
import * as ts from "typescript";

type ParserState = {
    helperCount: number
    statements: string[]
    typechecker: ts.TypeChecker
    knownTypes: Map<ts.Type, string>
}

const parseProperty = (state: ParserState, symbol: ts.Symbol) => {
    const name = symbol.getEscapedName();
    const documentation = symbol.getDocumentationComment(state.typechecker).map(v => v.text).join("\n");
    const documentationSuffix = documentation ? `\n  """\n  ${documentation.replaceAll("\n", "\n  ")}\n  """` : "";

    if (symbol.declarations?.length === 1) {
        const definition = parseInlineType(state, state.typechecker.getTypeAtLocation(symbol.declarations[0]!))
        if (symbol.flags & ts.SymbolFlags.Optional) {
            return `${name}: NotRequired[Optional[${definition}]]${documentationSuffix}`
        } else {
            return `${name}: ${definition}${documentationSuffix}`
        }
    } else {
        throw new Error("property has unexpected number of declarations")
    }
}

const parseInlineType = (state: ParserState, type: ts.Type) => {
    const result = tryToParseInlineType(state, type)
    if (result !== undefined) {
        return result
    } else {
        throw new Error(`could not parse type`)
    }
}

const newHelperTypeName = (state: ParserState) => {
    return `__HelperType${++state.helperCount}`
}

const getDocumentationStringForType = (typechecker: ts.TypeChecker, type: ts.Type) => {
    const jsDocStrings = type.aliasSymbol?.getDocumentationComment(typechecker).map(v => v.text);
    if (jsDocStrings !== undefined && jsDocStrings?.length > 0) {
        return `${jsDocStrings.join("\n")}`
    } else {
        return undefined
    }
}

const tryToParseInlineType = (state: ParserState, type: ts.Type, globalScope?: boolean): string | undefined => {
    const known = state.knownTypes.get(type);
    if (known !== undefined) {
        return known;
    } else if (type.isLiteral()) {
        return `Literal[${JSON.stringify(type.value)}]`
    } else if (type.isUnion()) {
        return `Union[${type.types.map((v,i) => parseInlineType(state, v))}]`
    } else if (state.typechecker.isArrayType(type)) {
        return `List[${state.typechecker.getTypeArguments(type as ts.TypeReference).map((v,i) => parseInlineType(state, v))}]`
    } else {
        // assume interface or object
        if (!globalScope) {
            const helperName = newHelperTypeName(state)
            state.statements.push(parseTypeDefinition(state, helperName, type))
            return helperName;
        } else {
            // needs to be defined outside
            return undefined
        }
    }
}

const parseTypeDefinition = (state: ParserState, name: string, type: ts.Type) => {
    const inlineType = tryToParseInlineType(state, type, true);
    const documentation = getDocumentationStringForType(state.typechecker, type)

    if (inlineType) {
        return `${name} = ${inlineType}${documentation ? `\n"""\n${documentation}\n"""` : ""}`;
    } else {
        return `class ${name}(TypedDict):${documentation ? `\n  """\n  ${documentation.replaceAll("\n", "  \n")}\n  """` : ""}\n  ${type.getProperties().map(v => parseProperty(state, v)).join(`\n  `)}`
    }
}

function parseExports(program: ts.Program, sourceFile: ts.SourceFile) {
    const typechecker = program.getTypeChecker();

    const knownTypes = new Map<ts.Type, string>()
    knownTypes.set(typechecker.getAnyType(), "Any")
    knownTypes.set(typechecker.getVoidType(), "None")
    knownTypes.set(typechecker.getUndefinedType(), "None")
    knownTypes.set(typechecker.getStringType(), "str")
    knownTypes.set(typechecker.getBooleanType(), "bool")
    knownTypes.set(typechecker.getNumberType(), "float")
    knownTypes.set(typechecker.getTrueType(), "Literal[True]")
    knownTypes.set(typechecker.getFalseType(), "Literal[False]")

    const state: ParserState = {
        statements: [],
        helperCount: 0,
        typechecker,
        knownTypes
    }

    state.statements.push(`from typing_extensions import Literal, TypedDict, List, Union, NotRequired, Optional, Any`)

    for (const statement of sourceFile.statements) {
        if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
            const isExported = !!(ts.getCombinedModifierFlags(statement) & ts.ModifierFlags.Export);
            if (isExported) {
                const name = statement.name.getText();
                const type = typechecker.getTypeAtLocation(statement)
                const definition = parseTypeDefinition(state, name, type);
                state.statements.push(definition);
                if (!knownTypes.has(type)) {
                    knownTypes.set(type, name)
                }
            }
        }
      }
      
    return state.statements;
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
    let program = ts.createProgram(fileNames, options);

    let emitResult = program.emit();
  
    const relevantSourceFiles = program.getSourceFiles().filter(f => f.fileName.includes("test.ts"))
    
    relevantSourceFiles.forEach(f => {
        const statements = parseExports(program, f);
        console.log(statements.join('\n\n'))
    });

    let allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);
  
    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      }
    });

  }
  
  compile(process.argv.slice(2), {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    noEmit: true
  });
  