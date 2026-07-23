import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { build } from 'vite'

const currentRoot = dirname(fileURLToPath(import.meta.url))
const branch = process.env.CF_PAGES_BRANCH ?? 'local'
const target = process.env.QELL_DEPLOY_TARGET
const buildV3 = branch === 'v3' || target === 'v3'
const appRoot = buildV3
  ? resolve(currentRoot, '../../v3/prototype')
  : currentRoot

console.log(
  `[qell-build] branch=${branch} target=${buildV3 ? 'v3' : 'v2'}`,
)

await build({
  root: appRoot,
  configFile: false,
  plugins: [react()],
  build: {
    outDir: resolve(currentRoot, 'dist'),
    emptyOutDir: true,
  },
})
