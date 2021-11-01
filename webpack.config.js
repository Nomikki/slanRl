const { version } = require("./package.json");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const buildTime = new Date().toISOString();

module.exports = {
  entry: "./src/index.ts",
  mode: "development",

  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.DefinePlugin({
      BUILD_DATE: JSON.stringify(buildTime.split("T")[0]), // format: 2021-10-19
      BUILD_TIME: JSON.stringify(buildTime.split("T")[1].split(".")[0]), // format: 15:15:48
      BUILD_DATETIME: JSON.stringify(buildTime), // format: 2021-10-19T15:15:48.944Z
      COMMIT_HASH: JSON.stringify(process.env.COMMIT_HASH || "dev"),
      PRODUCTION: JSON.stringify(true),
      VERSION: JSON.stringify(process.env.VERSION || version || "dev"),
    }),
    new HtmlWebpackPlugin({
      template: "./src/static/index.html",
      favicon: "./src/static/images/favicon.png",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [".js", ".ts"],
  },
};
