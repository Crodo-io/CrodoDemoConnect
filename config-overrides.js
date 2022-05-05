const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};

    console.log(config);

    config.module.rules.push({
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
    });
    config.ignoreWarnings = [/Failed to parse source map/];

    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "path": require.resolve("path"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url")
    })
    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    return config;
}