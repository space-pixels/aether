/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: { src: '/' },
  routes: [],
  optimize: {},
  packageOptions: { polyfillNode: true, external: ['http'] },
  devOptions: {},
  buildOptions: {},
  workspaceRoot: '../../'
}
