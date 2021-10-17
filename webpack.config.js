const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let commitHash = require("child_process")
  .execSync("git rev-parse --short HEAD")
  .toString();

module.exports = {
  entry: "./src/index.js",
  mode: "development",

  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(true),
      VERSION: JSON.stringify(commitHash),
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
