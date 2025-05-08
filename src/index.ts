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
    allowedExtensions?: string[]
    useExtension?: boolean
}

const removeExtension = (filePath: string, useExtension: boolean) => {
    const dir = path.dirname(filePath)
    const baseNameWithoutExt = path.basename(filePath, useExtension ? '' : path.extname(filePath))

    return path.join(dir, baseNameWithoutExt)
}

const getExportString = (filePath: string, content: string, useExtension: boolean): string => {
    const className = path.basename(filePath, path.extname(filePath))
    const pathWithoutExt = removeExtension(filePath, useExtension)
    let importName = '*'

    if(content.includes('export default')) {
        importName = `{ default as ${className} }`
    }
    else if(!content.includes('export')) {
        return ''
    }
    
    return `export ${importName} from './${pathWithoutExt}'\n`
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
    options.allowedExtensions = options.allowedExtensions ?? ['ts', 'tsx', 'js', 'jsx']
    options.useExtension = options.useExtension ?? false

    let totalString = ''
    let {watchedDir, excludeFiles = [], excludeDirs = []} = options

    const files = await readdir(watchedDir, {withFileTypes: true, recursive: true})
    
    for (const file of files) {
        const {name} = file
        const inWatchedDir = path.join(file.parentPath) == path.join(watchedDir)
        const relativePath = !inWatchedDir ? path.join(removeFirstFolder(file.parentPath), name) : name
        
        if(file.isFile()) {
            if(excludeFiles.includes(relativePath)) continue
            if(excludeDirs.includes(path.dirname(relativePath))) continue

            for (const ext of options.allowedExtensions) {
                if(path.extname(relativePath) == `.${ext}`)
                    continue
            }

            const searchPath = path.join(watchedDir, relativePath)

            const content = await readFile(searchPath, {encoding: 'utf-8'})
            totalString += getExportString(relativePath, content, options.useExtension)
        }
    }

    return totalString.replaceAll('\\', '/')
}

const createIndexPlugin = (options: AutoIndexPluginOptions): Plugin => ({
    name: 'create-index-plugin',
    async options(opt) {
        try {
            await unlink(options.filename)
        }
        catch(e) {}
        
        let exportString = await createIndexFileContent(options)
        await writeFile(options.filename, exportString)
        console.log(`created index file at ${options.filename}`)

        return opt
    }
})

export default createIndexPlugin

// Надо пофиксить прикол с тем, что при сборке, сборка не завершается, а тупо зависает