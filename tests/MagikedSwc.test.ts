import * as path from "https://deno.land/std@0.182.0/path/mod.ts"
import { assert } from "https://deno.land/std@0.182.0/testing/asserts.ts"

import { Walker } from "../deps/any/magiked.ts"
import { swc } from "../deps/any/swc.ts"

import type { SwcPayload } from "../sources/MagikedSwc.ts"
import { magikedSwc } from "../sources/MagikedSwc.ts"

const DATA_BASE_PATH = "tests/walk/"


Deno.test("Walk, ts file", async () =>
{
	const dir = path.resolve(DATA_BASE_PATH)

	const walker = new Walker<SwcPayload>()
	await walker.init(dir,
	{
		async onFileNodeEnter (node, _, filepath)
		{
			// filepath is provided only on first pass
			assert(filepath)
			
			const content = await Deno.readTextFile(filepath)

			if (Walker.matches.glob(filepath, "**/*.ts"))
			{
				node.payload = await magikedSwc(content, { filepath })
			}
		}
	})
	
	const node = walker.pathAsStringToNode('one.ts')
	assert(node && node.kind == 'FILE')
	
	const payload = node.payload
	assert(payload)
	
	const statement = payload.ast.body[0]
	assert(statement)

	assert(statement.type == 'ExportDeclaration')
	
	const extension = payload.ext
	assert(extension && extension == '.ts')
});

Deno.test("Walk, js file", async () =>
{
	const dir = path.resolve(DATA_BASE_PATH)

	const walker = new Walker<SwcPayload>()
	await walker.init(dir,
	{
		async onFileNodeEnter (node, _, filepath)
		{
			// filepath is provided only on first pass
			assert(filepath)
			
			const content = await Deno.readTextFile(filepath)

			if (Walker.matches.glob(filepath, "**/*.js"))
			{
				node.payload = await magikedSwc(content, { filepath })
			}
		}
	})
	
	const node = walker.pathAsStringToNode('two.js')
	assert(node && node.kind == 'FILE')
	
	const payload = node.payload
	assert(payload)
	
	const statement = payload.ast.body[0]
	assert(statement)

	assert(statement.type == 'ExportDeclaration')
	
	const extension = payload.ext
	assert(extension && extension == '.js')
});
