module.exports = {
  plugins: ['transform-vue-jsx', "@babel/plugin-transform-runtime"],
  presets: [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "useBuiltIns": "usage",
        "corejs": "2.6.10",
        "targets": {
          "ie": 10
        }
      }
    ],
    [
      '@vue/babel-preset-app',
      {
        // 关闭自动注入$createElement
        jsx: {
          injectH: false
        }
      }
    ]
  ],
};
