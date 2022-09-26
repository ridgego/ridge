const path = require('path');

module.exports = async(config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need

    config.module.rules.push({
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: path.resolve(__dirname, '../')
    });
    // 修改对svg的变动
    config.module.rules.forEach(rule => {
        if (rule.type === 'asset/resource') {
            rule.test = /\.(ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/;
        }
    });
    config.module.rules.push({
        test: /\.svg$/i,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 3145728
                // 暂时不使用mini-datauri  在110的一些组件测试过程中发现 使用这个功能 svg不能显示
                // generator: (content) => svgToMiniDataURI(content.toString())
            }
        }],
        resourceQuery: { not: [/inline/] } // exclude *.svg?inline
    });

    config.module.rules.push({
        test: /\.svg$/i,
        resourceQuery: /inline/, // *.svg?inline
        use: ['@svgr/webpack']
    });

    // Return the altered config
    return config;
};
