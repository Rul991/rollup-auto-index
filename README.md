# Rollup Plugin: Auto Index

This Rollup plugin automatically generates an index file (e.g., `index.ts`) that re-exports all other JavaScript/TypeScript files in a specified directory, making it easier to manage exports in your project.

## Installation

Install the plugin using npm:

```bash
npm install -D rollup-auto-index
```

## Usage

To use this plugin, add it to your Rollup configuration file.

First, import the plugin:

```javascript
import createIndexPlugin from 'rollup-auto-index'
```

Then, add it to the plugins array with the desired options:

```javascript
export default {
  // ... other configurations
  plugins: [
    createIndexPlugin({
      filename: 'src/modules/index.ts',
      watchedDir: 'src/modules',
      excludeFiles: ['utils.ts'],
      excludeDirs: ['tests'],
      allowedExtensions: ['ts', 'js', 'tsx', 'jsx']
    })
  ]
}
```

In this example, the plugin will generate `src/modules/index.ts` that re-exports all `.ts` files in `src/modules`, excluding `utils.ts` and any files in `src/modules/tests`.

## Options

The plugin accepts an options object with the following properties:

- **`filename`** (string): The path to the index file that will be generated. This should be a path within the `watchedDir`, for example, `'src/modules/index.ts'`.

- **`watchedDir`** (string): The directory to watch for TypeScript files. The plugin will recursively scan this directory and its subdirectories for `.ts` files to include in the index.

- **`excludeFiles`** (string[], optional): An array of file paths (relative to `watchedDir`) to exclude from the index. The `filename` itself is automatically excluded.

- **`excludeDirs`** (string[], optional): An array of directory paths (relative to `watchedDir`) to exclude from the index. Any files in these directories will not be included.

- **`allowedExtensions`** (string[], optional): An array of file extensions to include in the index. Defaults to `['ts', 'js', 'tsx', 'jsx']`.