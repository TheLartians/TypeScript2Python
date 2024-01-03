module.exports = {
    presets: [
      ['@babel/preset-env', { 
        targets: { node: 'current' }, exclude: ["proposal-dynamic-import"]
      }], 
      '@babel/preset-typescript',
    ],
  }
  