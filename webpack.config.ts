import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import webpack from "webpack";
import { version } from "./package.json";

const buildTime = new Date().toISOString();

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const isProd = environment === "production";

export default {
  entry: {
    index: "./src/index.ts",
  },
  mode: environment,
  devtool: isProd ? undefined : "inline-source-map",

  output: {
    filename: "[name].js",
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
      filename: "index.html",
      title: "Slan Roguelike",
      template: "src/static/index.html",
      favicon: "src/static/images/favicon.png",
      inject: true,
      minify: false,
      hash: true,
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
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
    extensions: [".js", ".ts", ".scss"],
  },
};
