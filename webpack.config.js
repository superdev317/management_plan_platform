const path = require('path');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const cssnano = require('cssnano');

const webpack = require('webpack');
const { NoEmitOnErrorsPlugin } = require('webpack');
const { GlobCopyWebpackPlugin, BaseHrefWebpackPlugin } = require('@angular/cli/plugins/webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const { AotPlugin } = require('@ngtools/webpack');

const nodeModules = path.join(process.cwd(), 'node_modules');
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const entryPoints = [
  "inline",
  "polyfills",
  "sw-register",
  "scripts",
  "styles",
  "vendor",
  "firebase",
  "mxgraph",
  "wijmo",
  "main"
];
const minimizeCss = false;
const baseHref = "";
const deployUrl = "";
const postcssPlugins = function () {
        // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
        const importantCommentRe = /@preserve|@license|[@#]\s*source(?:Mapping)?URL|^!/i;
        const minimizeOptions = {
            autoprefixer: false,
            safe: true,
            mergeLonghand: false,
            discardComments: { remove: (comment) => !importantCommentRe.test(comment) }
        };
        return [
            postcssUrl({
                url: (URL) => {
                    // Only convert root relative URLs, which CSS-Loader won't process into require().
                    if (!URL.startsWith('/') || URL.startsWith('//')) {
                        return URL;
                    }
                    if (deployUrl.match(/:\/\//)) {
                        // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
                        return `${deployUrl.replace(/\/$/, '')}${URL}`;
                    }
                    else if (baseHref.match(/:\/\//)) {
                        // If baseHref contains a scheme, include it as is.
                        return baseHref.replace(/\/$/, '') +
                            `/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                    }
                    else {
                        // Join together base-href, deploy-url and the original URL.
                        // Also dedupe multiple slashes into single ones.
                        return `/${baseHref}/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                    }
                }
            }),
            autoprefixer(),
        ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
    };




module.exports = {
  "devtool": "source-map",
  "resolve": {
    "extensions": [
      ".ts",
      ".js"
    ],
    "modules": [
      "./node_modules",
      "./node_modules"
    ]
  },
  "resolveLoader": {
    "modules": [
      "./node_modules"
    ]
  },
  "entry": {
    "main": [
      "./src/main.ts"
    ],
    "polyfills": [
      "./src/polyfills.ts"
    ],
    "scripts": [
      "script-loader!./src/assets/js/jquery-3.2.1.js",
      "script-loader!./node_modules/web-animations-js/web-animations.min.js",
      "script-loader!./node_modules/jszip/dist/jszip.min.js",
      "script-loader!./node_modules/moment/moment.js",
      "script-loader!./node_modules/mxgraph/javascript/mxClient.min.js",
      "script-loader!./src/app/elements/spreadsheet/services/dropbox.dropins.js",
      "script-loader!./src/app/elements/spreadsheet/services/filepicker.js",
      "script-loader!./src/assets/js/slick.js",
    ],
    "styles": [
      "./node_modules/bootstrap/dist/css/bootstrap.min.css",
      "./node_modules/font-awesome/css/font-awesome.css",
      "./node_modules/bootstrap-social/bootstrap-social.css",
      "./node_modules/primeng/resources/primeng.min.css",
      "./node_modules/primeng/resources/themes/bootstrap/theme.css",
      "./node_modules/jqwidgets-framework/jqwidgets/styles/jqx.base.css",
      "./node_modules/quill/dist/quill.snow.css",
      "./src/assets/css/slick.css",
      "./src/assets/css/slick-theme.css",      
      "./src/styles.scss",
    ]
  },
  "output": {
    "path": path.join(process.cwd(), "dist"),
    "filename": "[name].bundle.js",
    "chunkFilename": "[id].chunk.js"
  },
  "module": {
    "rules": [
      {
        "enforce": "pre",
        "test": /\.js$/,
        "loader": "source-map-loader",
        "exclude": [
          /\/node_modules\//
        ]
      },
      {
        "test": /\.json$/,
        "loader": "json-loader"
      },
      {
        "test": /\.html$/,
        "loader": "raw-loader"
      },
      {
        "test": /\.(eot|svg)$/,
        "loader": "file-loader?name=[name].[hash:20].[ext]"
      },
      {
        "test": /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
        "loader": "url-loader?name=[name].[hash:20].[ext]&limit=10000"
      },
      {
        "exclude": [
          path.join(process.cwd(), "node_modules/bootstrap/dist/css/bootstrap.min.css"),          
          path.join(process.cwd(), "node_modules/font-awesome/css/font-awesome.css"),
          path.join(process.cwd(), "node_modules/bootstrap-social/bootstrap-social.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/primeng.min.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/themes/bootstrap/theme.css"),
          path.join(process.cwd(), "node_modules/jqwidgets-framework/jqwidgets/styles/jqx.base.css"),
          path.join(process.cwd(), "node_modules/quill/dist/quill.snow.css"),
          path.join(process.cwd(), "src/assets/css/slick.css"),
          path.join(process.cwd(), "src/assets/css/slick-theme.css"),
          path.join(process.cwd(), "src/styles.scss")
        ],
        "test": /\.css$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          }
        ]
      },
      {
        "exclude": [
          path.join(process.cwd(), "node_modules/bootstrap/dist/css/bootstrap.min.css"),          
          path.join(process.cwd(), "node_modules/font-awesome/css/font-awesome.css"),
          path.join(process.cwd(), "node_modules/bootstrap-social/bootstrap-social.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/primeng.min.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/themes/bootstrap/theme.css"),
          path.join(process.cwd(), "node_modules/jqwidgets-framework/jqwidgets/styles/jqx.base.css"),
          path.join(process.cwd(), "node_modules/quill/dist/quill.snow.css"),
          path.join(process.cwd(), "src/assets/css/slick.css"),
          path.join(process.cwd(), "src/assets/css/slick-theme.css"),
          path.join(process.cwd(), "src/styles.scss")
        ],
        "test": /\.scss$|\.sass$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "sass-loader",
            "options": {
              "sourceMap": false,
              "precision": 8,
              "includePaths": []
            }
          }
        ]
      },
      {
        "include": [
          path.join(process.cwd(), "node_modules/bootstrap/dist/css/bootstrap.min.css"),          
          path.join(process.cwd(), "node_modules/font-awesome/css/font-awesome.css"),
          path.join(process.cwd(), "node_modules/bootstrap-social/bootstrap-social.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/primeng.min.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/themes/bootstrap/theme.css"),
          path.join(process.cwd(), "node_modules/jqwidgets-framework/jqwidgets/styles/jqx.base.css"),
          path.join(process.cwd(), "node_modules/quill/dist/quill.snow.css"),
          path.join(process.cwd(), "src/assets/css/slick.css"),
          path.join(process.cwd(), "src/assets/css/slick-theme.css"),
          path.join(process.cwd(), "src/styles.scss")
        ],
        "test": /\.css$/,
        "use": [
          "style-loader",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          }
        ]
      },
      {
        "include": [
          path.join(process.cwd(), "node_modules/bootstrap/dist/css/bootstrap.min.css"),
          path.join(process.cwd(), "node_modules/font-awesome/css/font-awesome.css"),
          path.join(process.cwd(), "node_modules/bootstrap-social/bootstrap-social.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/primeng.min.css"),
          path.join(process.cwd(), "node_modules/primeng/resources/themes/bootstrap/theme.css"),
          path.join(process.cwd(), "node_modules/jqwidgets-framework/jqwidgets/styles/jqx.base.css"),
          path.join(process.cwd(), "node_modules/quill/dist/quill.snow.css"),
          path.join(process.cwd(), "src/assets/css/slick.css"),
          path.join(process.cwd(), "src/assets/css/slick-theme.css"),
          path.join(process.cwd(), "src/styles.scss")
        ],
        "test": /\.scss$|\.sass$/,
        "use": [
          "style-loader",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "sass-loader",
            "options": {
              "sourceMap": false,
              "precision": 8,
              "includePaths": []
            }
          }
        ]
      },
      {
        "test": /\.ts$/,
        "loader": "@ngtools/webpack"
      }
    ]
  },
  "plugins": [
    new NoEmitOnErrorsPlugin(),
    new GlobCopyWebpackPlugin({
      "patterns": [
        "assets",
        "favicon.ico",
        "manifest.json",
        "firebase-messaging-sw.js"
      ],
      "globOptions": {
        "cwd": "./src",
        "dot": true,
        "ignore": "**/.gitkeep"
      }
    }),
    new ProgressPlugin(),
    new HtmlWebpackPlugin({
      "template": "./src/index.html",
      "filename": "./index.html",
      "hash": false,
      "inject": true,
      "compile": true,
      "favicon": false,
      "minify": false,
      "cache": true,
      "showErrors": true,
      "chunks": "all",
      "excludeChunks": [],
      "title": "Webpack App",
      "xhtml": true,
      "chunksSortMode": function sort(left, right) {
        let leftIndex = entryPoints.indexOf(left.names[0]);
        let rightindex = entryPoints.indexOf(right.names[0]);
        if (leftIndex > rightindex) {
            return 1;
        }
        else if (leftIndex < rightindex) {
            return -1;
        }
        else {
            return 0;
        }
    }
    }),
    new BaseHrefWebpackPlugin({}),
    new CommonsChunkPlugin({
      "name": "inline",
      "minChunks": null
    }),
    new CommonsChunkPlugin({
      "name": "firebase",
      "minChunks": (module) => module.resource && module.resource.startsWith(nodeModules)
                            && (module.resource.startsWith(path.join(nodeModules, '@firebase'))
                                || module.resource.startsWith(path.join(nodeModules, 'firebase'))),
      "chunks": [
        "main"
      ]
    }),
    new CommonsChunkPlugin({
      "name": "mxgraph",
      "minChunks": (module) => module.resource && module.resource.startsWith(nodeModules)
                            && module.resource.startsWith(path.join(nodeModules, 'mxgraph')),
      "chunks": [
        "main"
      ]
    }),
    new CommonsChunkPlugin({
      "name": "wijmo",
      "minChunks": (module) => module.resource && module.resource.startsWith(nodeModules)
                            && module.resource.startsWith(path.join(nodeModules, 'wijmo')),
      "chunks": [
        "main"
      ]
    }),
    new CommonsChunkPlugin({
      "name": "vendor",
      "minChunks": (module) => module.resource &&
                (module.resource.startsWith(nodeModules) || module.resource.startsWith(genDirNodeModules)),
      "chunks": [
        "main"
      ]
    }),
    new AotPlugin({
      "mainPath": "main.ts",
      "hostReplacementPaths": {
        "environments/environment.ts": ({
          'dev': 'environments/environment.ts',
          'test': 'environments/environment.test.ts',
          'stage': 'environments/environment.stage.ts'
        })[process.env.NODE_ENV]
      },
      "exclude": [],
      "tsConfigPath": "src/tsconfig.app.json",
      "skipCodeGeneration": true
    })
  ],
  "node": {
    "fs": "empty",
    "global": true,
    "crypto": "empty",
    "tls": "empty",
    "net": "empty",
    "process": true,
    "module": false,
    "clearImmediate": false,
    "setImmediate": false
  },
  "devServer": {
    "historyApiFallback": true,
    "proxy": {
      "/api/v1": "http://localhost:8000",
      "/media": "http://localhost:8000"
    }
  }
};
