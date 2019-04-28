const jest = require('jest');

let args = process.argv.slice(2);

if (process.env.CI === 'true') {
  args.push('--coverage');
}

jest.run(['--config=./config/jest.config.js', ...args]);
