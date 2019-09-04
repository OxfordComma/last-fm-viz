import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
 
export default [{
  input: 'js/music/stackedArea_main.js',
  external: ['d3', 'jquery'],
  output: {
    file: 'public/music/stackedAreaBundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3', jquery: 'jquery'}
  },
  plugins: [
    commonjs(),
    globals(),
    resolve(),
    builtins(),
    json()
  ]
}, {
  input: 'js/music/tree_main.js',
  external: ['d3', 'lastfmapi'],
  output: {
    file: 'public/music/treeBundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3', lastfmapi: 'lastfmapi'}
  },
  plugins: [
    commonjs(),
    resolve(),
    globals(),
    builtins()
  ]
}];
