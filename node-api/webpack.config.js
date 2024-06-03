const path = require('path');

module.exports = {
    entry: './src/main.js',
    mode: 'production',
    target: 'node',
    output: {
      path: path.resolve(__dirname, '.'),
      filename: 'app.bundle.js'
    }
};
