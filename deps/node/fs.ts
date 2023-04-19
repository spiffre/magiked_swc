// @ts-ignore Node-specific code
import fsn from "node:fs"

// @ts-ignore Node-specific code
const stat = async (path: string) =>
{
	const stats = await fsn.promises.stat(path)
	
	// Clone the object but declare `isDirectory` and `isFile` properties in order to match the Deno API (node has functions for those)
	return {
		...stats,
		
		get isDirectory ()
		{
			return stats.isDirectory()
		},
		
		get isFile ()
		{
			return stats.isFile()
		}
	}
} 

export type DirEntry = { name: string }

export const fs =
{
	stat
}
