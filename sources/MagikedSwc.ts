import { path } from "../deps/deno/path.ts"

import type { Payload } from "../deps/any/magiked.ts"

import { swc } from "../deps/any/swc.ts"
import type { SWC } from "../deps/any/swc.ts"


export interface SwcPayload extends Payload
{
	type: 'swc'
	ast: SWC.Module
	ext?: string
}


export interface MagikedSwcOptions
{
	target: SWC.JscTarget
	script: false
	filepath?: string
}

const DEFAULT_OPTIONS: { target: SWC.JscTarget, script: boolean } =
{
	target : "es2022",
	script : false
}


export async function magikedSwc (code: string, options: Partial<MagikedSwcOptions> = {}): Promise<SwcPayload>
{
	const opts = { ...DEFAULT_OPTIONS, ...options }
	const filepath = opts.filepath ?? 'code_fragment'
	
	let source: SWC.Module | undefined
	
	try
	{
		source = await swc.parse(code,
		{
			syntax: "typescript",
			target: opts.target,
			script: opts.script
		})
	}
	catch (error)
	{
		throw new Error(`Failed to parse file: ${filepath}\n\nCaused by:${error}`)
	}
	
	if (opts.filepath)
	{
		const ext = path.extname(filepath)
		
		return {
			type : 'swc',
			ast : source,
			ext
		}
	}
	
	return {
		type : 'swc',
		ast : source
	}
}
