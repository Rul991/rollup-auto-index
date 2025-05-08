import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: `src/index.ts`,
    output: [
      {
        file: 'dist/index.js',
        format: 'es'
      }
    ],
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json'
      }),
      terser({
        'keep_fnames': true, 
        'keep_classnames': true
      })
    ],
  }
];