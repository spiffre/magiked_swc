import { assert } from '../../../deps/deno/assert.ts'
import { fs } from "../../../deps/deno/fs.ts";
import { path } from '../../../deps/deno/path.ts'

import { swc } from "../../../deps/any/swc.ts"
import type { SWC } from "../../../deps/any/swc.ts"

import type { ImportExportGraphNode, ImportMetaAst, ExportDeclarationAst, ModuleSpecifier, ExportListAst, ReexportMetaAst } from "./types.ts"

export async function parseImportExportStatements (source: SWC.Module, filepath: string): Promise<ImportExportGraphNode>
{
	const dirname = path.dirname(filepath)
	
	const iegn: ImportExportGraphNode =
	{
		imports : [],
		exports : [],
		reexports : []
	}
	
	// Run through all top-level statements (all import/exports statements are top-level)
	for (const statement of source.body)
	{
		// For imports
		if (statement.type == 'ImportDeclaration')
		{
			const importDecl = statement
			
			const moduleSpecifier = await parseModuleSpecifier(importDecl.source, dirname)
			
			const loc =
			{
				start : importDecl.span.start,
				end : importDecl.span.end
			}
			
			const importAstNode: ImportMetaAst =
			{
				type : 'ImportMetaAst',
				moduleSpecifier,
				loc
			}
			
			for (const specifier of importDecl.specifiers)
			{
				if (specifier.type == 'ImportDefaultSpecifier')
				{
					importAstNode.default = specifier.local.value
				}
				else if (specifier.type == 'ImportNamespaceSpecifier')
				{
					importAstNode.namespace = specifier.local.value
				}
				else if (specifier.type == 'ImportSpecifier')
				{
					if (importAstNode.named == undefined)
					{
						importAstNode.named = []
					}
					
					if (specifier.imported)
					{
						importAstNode.named.push(
						{
							name : specifier.imported.value,
							alias : specifier.local.value
						})
					}
					else
					{
						importAstNode.named.push(
						{
							name : specifier.local.value,
							alias : undefined
						})
					}
				}
			}
			
			iegn.imports.push(importAstNode)
		}
		// For re-exports aka aggregation exports: export * from "module-name"
		else if (statement.type == 'ExportAllDeclaration')
		{
			const moduleSpecifier = await parseModuleSpecifier(statement.source, dirname)
			
			const loc =
			{
				start : statement.span.start,
				end : statement.span.end,
			}
			
			const exportAstNode: ReexportMetaAst =
			{
				type : 'ReexportMetaAst',
				namespace : true,
				namespaceAlias : undefined,
				moduleSpecifier,
				loc
			}
			
			iegn.reexports.push(exportAstNode)
		}
		// For re-exports aka aggregation exports: export * as name1 from "module-name"
		else if (statement.type == 'ExportNamedDeclaration' && statement.source && statement.specifiers[0].type == 'ExportNamespaceSpecifier')
		{
			// In the case of a namespaced export, we know a source is specified
			assert(statement.source)
			
			const moduleSpecifier = await parseModuleSpecifier(statement.source, dirname)
			
			const loc =
			{
				start : statement.span.start,
				end : statement.span.end,
			}
			
			const exportAstNode: ReexportMetaAst =
			{
				type : 'ReexportMetaAst',
				namespace : true,
				namespaceAlias : statement.specifiers[0].name.value,
				moduleSpecifier,
				loc
			}
			
			iegn.reexports.push(exportAstNode)
		}
		// For re-exports aka aggregation exports: export { name1, /* …, */ nameN } from "module-name";
		else if (statement.type == 'ExportNamedDeclaration' && statement.source && statement.specifiers[0].type == 'ExportSpecifier')
		{
			// In the case of a namespaced export, we know a source is specified
			assert(statement.source)
			
			const moduleSpecifier = await parseModuleSpecifier(statement.source, dirname)
			
			const loc =
			{
				start : statement.span.start,
				end : statement.span.end,
			}
			
			const exportAstNode: ReexportMetaAst =
			{
				type : 'ReexportMetaAst',
				namespace : undefined,  // fixme: Switch this to false
				namespaceAlias : undefined,
				named : [],
				moduleSpecifier,
				loc
			}
			
			for (const specifier of statement.specifiers)
			{
				assert(specifier.type == 'ExportSpecifier')
				assert(exportAstNode.named)
				
				if (specifier.exported)
				{
					exportAstNode.named.push(
					{
						name : specifier.orig.value,
						alias : specifier.exported.value
					})
				}
				else
				{
					exportAstNode.named.push(
					{
						name : specifier.orig.value,
						alias : undefined
					})
				}
			}
			
			iegn.reexports.push(exportAstNode)
		}
		// For export lists
		else if (statement.type == 'ExportNamedDeclaration' && statement.source == undefined)
		{
			const loc =
			{
				start: statement.span.start,
				end: statement.span.end,
			}
			
			const exportAstNode: ExportListAst =
			{
				type : 'ExportListAst',
				named : [],
				loc
			}
			
			for (const specifier of statement.specifiers)
			{
				assert(specifier.type == 'ExportSpecifier')
				
				if (specifier.exported)
				{
					exportAstNode.named.push(
					{
						name : specifier.orig.value,
						alias : specifier.exported.value
					})
				}
				else
				{
					exportAstNode.named.push(
					{
						name : specifier.orig.value,
						alias : undefined
					})
				}
			}
			
			iegn.exports.push(exportAstNode)
		}
	}
	
	return iegn
}

export async function parseImportExportStatementsFromString (source: string, filepath: string): Promise<ImportExportGraphNode>
{
	try
	{
		const sourceAst = await swc.parse(source,
		{
			syntax: "typescript",
			target: 'es2022',
			script: false
		})
		
		return await parseImportExportStatements(sourceAst, filepath)
	}
	catch (error)
	{
		throw new Error(`Failed to parse file: ${filepath}\n\nCaused by:${error}`)
	}
}

// HELPERS

const VALID_EXTENSIONS = [ '.js', '.ts', '.jsx', '.tsx' ]

async function resolveModuleSpecifier (dirname: string, moduleSpecifier: string): Promise<string>
{
	// Check if the specifier directly points do a file
	try
	{
		const absolute = path.resolve(dirname, moduleSpecifier)
		const stat = await fs.stat(absolute)
		if (stat.isFile)
		{
			return absolute
		}
	}
	catch (_error)
	{
		// Silence the error
	}
	
	// Check if the specifier is an extensionless path to a file
	for (const ext of VALID_EXTENSIONS)
	{
		const filepath = path.resolve(dirname, `${moduleSpecifier}${ext}`)
		try
		{
			await fs.stat(filepath)
			return filepath
		}
		catch (_error)
		{
			// Silence the error
		}
	}
	
	// Check if the specifier is a directory with an index file
	for (const ext of VALID_EXTENSIONS)
	{
		const filepath = path.resolve(dirname, moduleSpecifier, `index${ext}`)
		try
		{
			await fs.stat(filepath)
			return filepath
		}
		catch (_error)
		{
			// Silence the error
		}
	}
	
	throw new Error(`Failed to resolve module specifier to a file with a supported extension:\n${moduleSpecifier}`)
}

async function parseModuleSpecifier (specifier: SWC.StringLiteral, directory: string): Promise<ModuleSpecifier>
{
	const moduleSpecifierText = specifier.value

	const prefixRegex = /^(copy:|webworker:)/
	const prefixMatch = moduleSpecifierText.match(prefixRegex)
	const prefix = prefixMatch ? prefixMatch[0] : undefined
	const rawSpecifier = prefix ? moduleSpecifierText.replace(prefixRegex, '') : moduleSpecifierText
	const isPackageId = !rawSpecifier.startsWith('./') && !rawSpecifier.startsWith('../')
	const resolvedSpecifier = isPackageId ? rawSpecifier : await resolveModuleSpecifier(directory, rawSpecifier)

	return {
		specifier : resolvedSpecifier,
		isPackageId,
		prefix,
	}
}