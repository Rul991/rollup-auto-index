import {
  readdir,
  readFile,
  unlink,
  writeFile,
} from 'fs/promises';
import path from 'path';
import { Plugin } from 'rollup';

interface AutoIndexPluginOptions {
    filename: string
    watchedDir: string
    excludeFiles?: string[]
    excludeDirs?: string[]
}

const removeExtension = (filePath: string) => {
    const dir = path.dirname(filePath)
    const baseNameWithoutExt = path.basename(filePath, path.extname(filePath))

    return path.join(dir, baseNameWithoutExt)
}

const getExportString = (filePath: string, content: string): string => {
    const className = path.basename(filePath, '.ts')
    const pathWithoutExt = removeExtension(filePath)
    let importName = '*'

    if(content.includes('export default')) {
        importName = `{ default as ${className} }`
    }
    else if(!content.includes('export')) {
        return ''
    }
    
    return `import ${importName} from './${pathWithoutExt}'\n`
}

const removeFirstFolder = (filePath: string) => {
    const parts = filePath.split(path.sep)

    if (parts.length > 1) {
        return parts.slice(1).join(path.sep)
    }

    return filePath
}

const createIndexFileContent = async (options: AutoIndexPluginOptions) => {
    options.excludeFiles = [...(options.excludeFiles ?? []), options.filename]
    let totalString = ''
    let {watchedDir, excludeFiles = [], excludeDirs = []} = options

    const files = await readdir(watchedDir, {withFileTypes: true, recursive: true})
    
    for (const file of files) {
        const {name} = file
        const inWatchedDir = path.join(file.parentPath) == path.join(watchedDir)
        const fullPath = !inWatchedDir ? path.join(removeFirstFolder(file.parentPath), name) : name
        
        if(file.isFile()) {
            if(excludeFiles.includes(fullPath)) continue
            if(excludeDirs.includes(path.dirname(fullPath))) continue

            const searchPath = path.join(watchedDir, fullPath)

            const content = await readFile(searchPath, {encoding: 'utf-8'})
            totalString += getExportString(fullPath, content)
        }
    }

    return totalString.replaceAll('\\', '/')
}

const createIndexPlugin = (options: AutoIndexPluginOptions): Plugin => ({
    name: 'create-index-plugin',
    async buildStart() {
        await unlink(options.filename)
        let exportString = await createIndexFileContent(options)
        await writeFile(options.filename, exportString)
    }
})

export default createIndexPlugin