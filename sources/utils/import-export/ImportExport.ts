import { assert } from '../../../deps/deno/assert.ts'
import { fs } from "../../../deps/deno/fs.ts";
import { path } from '../../../deps/deno/path.ts'

import { swc } from "../../../deps/any/swc.ts"
import type { SWC } from "../../../deps/any/swc.ts"

import type { ImportExportGraphNode, ImportMetaAst, ExportDeclarationAst, ModuleSpecifier } from "./types.ts"

export async function parseImportExportStatements (source: SWC.Module, filepath: string): Promise<ImportExportGraphNode>
{
	const iegn: ImportExportGraphNode =
	{
		imports : [],
		exports : [],
		reexports : []
	}
	
	return iegn
}

export async function parseImportExportStatementsFromString (source: string, filepath: string): Promise<ImportExportGraphNode>
{
	const iegn: ImportExportGraphNode =
	{
		imports : [],
		exports : [],
		reexports : []
	}
	
	return iegn
}
