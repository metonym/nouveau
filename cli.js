#!/usr/bin/env node
const argv = require("yargs").argv;
const Nouveau = require("./lib").default;
const config = require("pkg-config")("nouveau", { root: false });

(async () => {
  try {
    const nouveau = new Nouveau(
      Object.assign({ dev: argv.dev || false }, config)
    );
    await nouveau.init();
  } catch (error) {
    process.stderr.write(error + "\n");
  }
})();
