const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "packifier.min.js",
    library: {
      name: "Packifier",
      type: "umd",
      export: "Packifier"
    },
    globalObject: "this"
  }
};