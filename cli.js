#!/usr/bin/env node
const { Nouveau } = require('./lib');

(async () => {
  const nouveau = new Nouveau({ process });
  await nouveau.init();
  try {
  } catch (error) {
    process.stdout.write(`${error}\n`);
  }
})();
