const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { version } = require("./package.json");

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
      COMMIT_HASH: JSON.stringify(process.env.COMMIT_HASH || "dev"),
      VERSION: JSON.stringify(process.env.VERSION || version || "dev"),
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
