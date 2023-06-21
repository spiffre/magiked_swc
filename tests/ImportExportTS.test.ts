import * as path from "https://deno.land/std@0.182.0/path/mod.ts"
import { assert, assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts"

import { parseImportExportStatementsFromString } from '../sources/utils/import-export/ImportExport.ts'


// TYPESCRIPT IMPORT STATEMENTS

// import type { TypeExport } from "module"
// import { type TypeExport } from "module"
// import { type TypeExport as TypeExportFromLibrary } from "module"
// import { type TypeExport, ValueExport } from "module"

Deno.test('Import named type export', async () =>
{
	const sourceCode = `import type { TypeExport } from "module"`
	const result = await parseImportExportStatementsFromString(sourceCode, "whatever")
	
	const importAst = result.imports[0]
	
	assert(importAst)
	assertEquals(importAst.isType, true)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named, [{ name : 'TypeExport', alias : undefined, isType : false }])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import named type export 2', async () =>
{
	const sourceCode = `import { type TypeExport } from "module"`
	const result = await parseImportExportStatementsFromString(sourceCode, "whatever")
	
	const importAst = result.imports[0]
	
	assert(importAst)
	assertEquals(importAst.isType, false)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named, [{ name : 'TypeExport', alias : undefined, isType : true }])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import named type export 2 (with alias)', async () =>
{
	const sourceCode = `import { type TypeExport as TypeExportFromLibrary } from "module"`
	const result = await parseImportExportStatementsFromString(sourceCode, "whatever")
	
	const importAst = result.imports[0]
	
	assert(importAst)
	assertEquals(importAst.isType, false)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named, [{ name : 'TypeExport', alias : 'TypeExportFromLibrary', isType : true }])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import named type export 2 (mixed with value export)', async () =>
{
	const sourceCode = `import { type TypeExport, ValueExport } from "module"`
	const result = await parseImportExportStatementsFromString(sourceCode, "whatever")
	
	const importAst = result.imports[0]
	
	assert(importAst)
	assertEquals(importAst.isType, false)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named,
	[
		{ name : 'TypeExport', alias : undefined, isType : true },
		{ name : 'ValueExport', alias : undefined, isType : false },
	])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})



// TYPESCRIPT EXPORT STATEMENTS

// export interface Whatever {}"
// export type Whatever = {}"
// export enum Whatever {}"
// export namespace Whatever {}"

Deno.test('Export interface', async () =>
{
	const sourceCode = 'export interface Whatever {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	
	const exportAst = result.exports[0]

	assert(exportAst.type == "InterfaceDeclarationAst")
	assertEquals(exportAst.name, "Whatever")
	assertEquals(exportAst.isDefault, false)
})

Deno.test('Export type', async () =>
{
	const sourceCode = 'export type Whatever = {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	
	const exportAst = result.exports[0]

	assert(exportAst.type == "TypeDeclarationAst")
	assertEquals(exportAst.name, "Whatever")
	assertEquals(exportAst.isDefault, false)
})

Deno.test('Export enum', async () =>
{
	const sourceCode = 'export enum Whatever {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	
	const exportAst = result.exports[0]

	assert(exportAst.type == "EnumDeclarationAst")
	assertEquals(exportAst.name, "Whatever")
	assertEquals(exportAst.isDefault, false)
})

Deno.test('Export namespace', async () =>
{
	const sourceCode = 'export namespace Whatever {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	
	const exportAst = result.exports[0]

	assert(exportAst.type == "ModuleDeclarationAst")
	assertEquals(exportAst.name, "Whatever")
	assertEquals(exportAst.isDefault, false)
})


// TYPESCRIPT DEFAULT EXPORT STATEMENTS

// export default interface Whatever {}"
// Note that enums and types cannot be default-exported (apparently)

Deno.test('Export default interface', async () =>
{
	const sourceCode = 'export default interface Whatever {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	
	const exportAst = result.exports[0]

	assert(exportAst.type == "InterfaceDeclarationAst")
	assertEquals(exportAst.name, "Whatever")
	assertEquals(exportAst.isDefault, true)
})
