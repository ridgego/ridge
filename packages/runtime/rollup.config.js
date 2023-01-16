import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: {
    file: 'build/bundle.js',
    format: 'iifs'
  },
  plugins: [nodeResolve()],
  external: ['moment'] // <-- suppresses the warning
}
