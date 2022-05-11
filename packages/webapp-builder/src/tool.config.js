const path = require("path");

const forestsConfig = {
  page: [
    {
      pkg: "@atrilabs/basic-trees",
      modulePath: "lib/componentTree.js",
      name: "componentTree",
    },
    {
      pkg: "@atrilabs/basic-trees",
      modulePath: "lib/cssTree.js",
      name: "cssTree",
    },
  ],
};

module.exports = {
  forests: forestsConfig,
  forestManager: {
    path: require.resolve(
      "@atrilabs/forest/lib/implementations/lowdb/LowDbForestManager"
    ),
    options: {
      forestDir: "localdb",
      forestsConfig: forestsConfig,
    },
  },
  layers: [
    { pkg: "@atrilabs/base-layer" },
    { pkg: "@atrilabs/app-design-layer" },
    { pkg: "@atrilabs/atri-icon-layer" },
    { pkg: "@atrilabs/app-page-layer" },
  ],
  output: "lib",
  services: {
    fileServer: {
      path: require.resolve("@atrilabs/server-client/lib/file-server"),
      options: {
        dir: path.resolve("lib"),
      },
    },
    eventServer: {
      path: require.resolve("@atrilabs/server-client/lib/websocket/server"),
    },
    codeGenerators: [],
  },
  env: {
    EVENT_SERVER_CLIENT: "http://localhost:4001",
  },
};
