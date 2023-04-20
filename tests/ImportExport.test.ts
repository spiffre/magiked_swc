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


// EXPORTING DECLARATION
//
// export let name1, name2 /* and */ export const name1 = 1, name2 = 2/*, … */;
// export function functionName() { /* … */ }
// export function* generatorFunctionName() { /* … */ }
// export class ClassName { /* … */ }
//
// Unsupported:
//   export const { name1, name2: bar } = o;
//   export const [ name1, name2 ] = array;
// Doable but is it worth the effort ?

Deno.test('Export multiple variable declaration with assignment', async () =>  // fixme: Handle object and array patterns ?
{
	const sourceCode = 'export const name1 = 1, name2 = 2'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]

	assert(exportAst.type == "ExportDeclarationAst")
	
	assert(exportAst.kind == "variable")
	assert(exportAst.flavor == "const")
	
	assertEquals(exportAst.declarations,
	[
		{ name: "name1" },
		{ name: "name2" },
	])
	
	assertEquals(exportAst.isDefault, false)
})

Deno.test('Export function declaration', async () =>
{
	const sourceCode = 'export function functionName() {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]

	assert(exportAst.type == "ExportDeclarationAst")
	assert(exportAst.kind == "function")
	assert(exportAst.flavor == "function")
	
	assertEquals(exportAst.name, "functionName")
	assertEquals(exportAst.isDefault, false)
})

Deno.test('Export generator function declaration', async () =>
{
	const sourceCode = 'export function* generatorFunctionName() {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]
	
	assert(exportAst.type == "ExportDeclarationAst")
	assert(exportAst.kind == "function")
	assert(exportAst.flavor == "generator")

	assertEquals(exportAst.name, "generatorFunctionName")
	assertEquals(exportAst.isDefault, false)
})

Deno.test('Export class declaration', async () =>
{
	const sourceCode = 'export class ClassName {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]

	assert(exportAst.type == "ExportDeclarationAst")
	assert(exportAst.kind == "class")
	
	assertEquals(exportAst.name, "ClassName")
	assertEquals(exportAst.isDefault, false)
})


// EXPORTING DECLARATION (DEFAULT)
//
// export default function functionName() { /* … */ }
// export default function* generatorFunctionName() { /* … */ }
// export default class ClassName { /* … */ }
//
// Unsupported:
//   export default expression;
//   export default function () { /* … */ }
//   export default class { /* … */ }
//   export default function* () { /* … */ }
// These could be done but it would essentially be 'Anonymous' and then the loc's start/end for further analysis...

Deno.test('Export function declaration as default', async () =>
{
	const sourceCode = 'export default function functionName() {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]

	assert(exportAst.type == "ExportDeclarationAst")
	assert(exportAst.kind == "function")
	assert(exportAst.flavor == "function")
	
	assertEquals(exportAst.name, "functionName")
	assertEquals(exportAst.isDefault, true)
})

Deno.test('Export generator function declaration as default', async () =>
{
	const sourceCode = 'export default function* generatorFunctionName() {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]
	
	assert(exportAst.type == "ExportDeclarationAst")
	assert(exportAst.kind == "function")
	assert(exportAst.flavor == "generator")

	assertEquals(exportAst.name, "generatorFunctionName")
	assertEquals(exportAst.isDefault, true)
})

Deno.test('Export class declaration as default', async () =>
{
	const sourceCode = 'export default class ClassName {}'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]

	assert(exportAst.type == "ExportDeclarationAst")
	assert(exportAst.kind == "class")
	
	assertEquals(exportAst.name, "ClassName")
	assertEquals(exportAst.isDefault, true)
})


// EXPORT LISTS
//
// export { name1, /* …, */ nameN };
// export { variable1 as name1, variable2 as name2, /* …, */ nameN };
// export { name1 as default /*, … */ };
//
// Unsupported:
//   export { variable1 as "string name" };
// Again, the parsing of this by TS is insane

Deno.test('Export locally-defined symbols', async () =>
{
	const sourceCode = 'export { name1, name2 }'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0]

	assert(exportAst.type == 'ExportListAst')
	
	assertEquals(exportAst.named,
	[
		{ name: 'name1', alias : undefined },
		{ name: 'name2', alias : undefined },
	])
})

Deno.test('Export locally-defined symbols with alias', async () =>
{
	const sourceCode = 'export { variable1 as name1, variable2 as name2 }'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0] as ExportListAst

	assert(exportAst.type == 'ExportListAst')
	
	assertEquals(exportAst.named,
	[
		{ name: 'variable1', alias: 'name1' },
		{ name: 'variable2', alias: 'name2' },
	])
})

Deno.test('Export locally-defined symbol as default', async () =>
{
	const sourceCode = 'export { name1 as default }'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const exportAst = result.exports[0] as ExportListAst

	assert(exportAst.type == 'ExportListAst')
	
	assertEquals(exportAst.named,
	[
		{ name: 'name1', alias: 'default' },
	])
})



// REEXPORT / AGGREGATION EXPORT STATEMENTS
//
// export * from "module-name";
// export * as name1 from "module-name";
// export { name1, /* …, */ nameN } from "module-name";
// export { import1 as name1, import2 as name2, /* …, */ nameN } from "module-name";
// export { default, /* …, */ } from "module-name";
// export { default as name1 } from "module-name";

Deno.test('Re-export all exports', async () =>
{
	const sourceCode = 'export * from "package-id"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const reexportAst = result.reexports[0]
  
	assertEquals(reexportAst.type, "ReexportMetaAst")
	assertEquals(reexportAst.moduleSpecifier,
	{
		specifier : "package-id",
		prefix : undefined,
		isPackageId : true
	})
	assertEquals(reexportAst.named, undefined)
	assertEquals(reexportAst.namespace, true)
	assertEquals(reexportAst.namespaceAlias, undefined)
})

Deno.test('Re-export all exports as namespace', async () =>
{
	const sourceCode = 'export * as name1 from "package-id"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const reexportAst = result.reexports[0]

	assertEquals(reexportAst.type, "ReexportMetaAst")
	assertEquals(reexportAst.moduleSpecifier,
	{
		specifier : "package-id",
		prefix : undefined,
		isPackageId : true
	})
	assertEquals(reexportAst.named, undefined)
	assertEquals(reexportAst.namespace, true)
	assertEquals(reexportAst.namespaceAlias, "name1")
})

Deno.test('Re-export named export', async () =>
{
	const sourceCode = 'export { name1 } from "package-id"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const reexportAst = result.reexports[0]

	assertEquals(reexportAst.type, "ReexportMetaAst")
	assertEquals(reexportAst.moduleSpecifier,
	{
		specifier : "package-id",
		prefix : undefined,
		isPackageId : true
	})
	assertEquals(reexportAst.named,
	[
		{ name: "name1", alias: undefined }
	])
	assertEquals(reexportAst.namespace, undefined)
	assertEquals(reexportAst.namespaceAlias, undefined)
})

Deno.test('Re-export multiple named exports with alias', async () =>
{
	const sourceCode = 'export { import1 as name1, import2 as name2 } from "package-id"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const reexportAst = result.reexports[0]

	assertEquals(reexportAst.type, "ReexportMetaAst")
	assertEquals(reexportAst.moduleSpecifier,
	{
		specifier : "package-id",
		prefix : undefined,
		isPackageId : true
	})
	assertEquals(reexportAst.named,
	[
		{ name: "import1", alias: "name1" },
		{ name: "import2", alias: "name2" },
	])
	assertEquals(reexportAst.namespace, undefined)
	assertEquals(reexportAst.namespaceAlias, undefined)
})

Deno.test('Re-export default export as named export', async () =>
{
	const sourceCode = 'export { default } from "module-name"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const reexportAst = result.reexports[0]

	assertEquals(reexportAst.type, "ReexportMetaAst")
	assertEquals(reexportAst.moduleSpecifier,
	{
		specifier : "module-name",
		prefix : undefined,
		isPackageId : true 
	})
	assertEquals(reexportAst.named,
	[
		{ name: "default", alias: undefined }
	])
	assertEquals(reexportAst.namespace, undefined)
	assertEquals(reexportAst.namespaceAlias, undefined)
})

Deno.test('Re-export default export as named export with alias', async () =>
{
	const sourceCode = 'export { default as name1 } from "module-name"'
	const result = await parseImportExportStatementsFromString(sourceCode, 'whatever')
	const reexportAst = result.reexports[0]

	assertEquals(reexportAst.type, "ReexportMetaAst")
	assertEquals(reexportAst.moduleSpecifier,
	{
		specifier: "module-name",
		prefix: undefined,
		isPackageId: true
	})
	assertEquals(reexportAst.named,
	[
		{ name: "default", alias: "name1" }
	])
	assertEquals(reexportAst.namespace, undefined)
	assertEquals(reexportAst.namespaceAlias, undefined)
})