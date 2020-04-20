module.exports = {
  presets: [
    [
      '@vue/babel-preset-app',
      {
        // 关闭自动注入$createElement
        jsx: {
          injectH: false
        }
      }
    ]
  ]
};
