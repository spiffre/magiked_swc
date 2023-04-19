import * as path from "https://deno.land/std@0.182.0/path/mod.ts"
import { assert, assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts"

import { parseImportExportStatementsFromString } from '../sources/utils/import-export/ImportExport.ts'
import type { ExportListAst } from '../sources/utils/import-export/types.ts'


// IMPORT STATEMENTS

// import defaultExport from "module-name";
// import * as name from "module-name";
// import { export1 } from "module-name";
// import { export1 as alias1 } from "module-name";
// import { default as alias } from "module-name";
// import { export1, export2 } from "module-name";
// import { export1, export2 as alias2, /* … */ } from "module-name";
// import defaultExport, { export1, /* … */ } from "module-name";
// import defaultExport, * as name from "module-name";
// import "module-name";
//
// Unsupported:
//   import { "string name" as alias } from "module-name";
// TypeScript's parsing of this is insane ()

Deno.test('Import default export', async () =>
{
	const sourceCode = 'import defaultExport from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, "whatever")
	
	const importAst = result.imports[0]
	
	assert(importAst)
	assertEquals(importAst.default, "defaultExport")
	assertEquals(importAst.moduleSpecifier,
	{
		specifier : "module",
		prefix : undefined,
		isPackageId : true,
	})
})

Deno.test('Import all exports as namespace', async () =>
{
	const sourceCode = 'import * as name from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, 'name')
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import named export', async () =>
{
	const sourceCode = 'import { export1 } from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named, [{ name : 'export1', alias : undefined }])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import named export with alias', async () =>
{
	const sourceCode = 'import { export1 as alias1 } from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named, [{ name : 'export1', alias : 'alias1' }])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('import default as named export', async () =>
{
	const sourceCode = 'import { default as alias } from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named,
	[
		{ name : 'default', alias : 'alias' },
	])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('import multiple named exports', async () =>
{
	const sourceCode = 'import { export1, export2 } from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named,
	[
		{ name : 'export1', alias : undefined },
		{ name : 'export2', alias : undefined },
	])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('import multiple named exports with alias', async () =>
{
	const sourceCode = 'import { export1, export2 as alias2 } from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named,
	[
		{ name : 'export1', alias : undefined },
		{ name : 'export2', alias : 'alias2' },
	])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import default export and named export', async () =>
{
	const sourceCode = 'import defaultExport, { export1 } from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, 'defaultExport')
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named, [{ name : 'export1', alias : undefined }])
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import default export and all exports as namespace', async () =>
{
	const sourceCode = 'import defaultExport, * as name from "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')

	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, 'defaultExport')
	assertEquals(importAst.namespace, 'name')
	assertEquals(importAst.named, undefined)
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

Deno.test('Import for side-effect', async () =>
{
	const sourceCode = 'import "module"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const importAst = result.imports[0]

	assert(importAst)
	assertEquals(importAst.default, undefined)
	assertEquals(importAst.namespace, undefined)
	assertEquals(importAst.named, undefined)
	assertEquals(importAst.moduleSpecifier,
	{
		specifier: 'module',
		prefix: undefined,
		isPackageId: true,
	})
})

