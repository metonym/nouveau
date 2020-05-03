import { strict as test } from "assert";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import Nouveau from "..";

const read = promisify(fs.readFile);

async function dev() {
  const outDir = "src/tests/fixtures/.site/";
  const nouveau = new Nouveau({
    dev: true,
    noWatch: true,
    entry: "src/tests/fixtures/src/",
    outDir,
  });

  await nouveau.init();

  const index = await read(path.join(outDir, "index.html"), "utf-8");
  const nested = await read(path.join(outDir, "nested/index.html"), "utf-8");

  test.ok(index);
  test.ok(nested);
}

async function prod() {
  const outDir = "src/tests/fixtures/dist/";
  const nouveau = new Nouveau({
    dev: false,
    entry: "src/tests/fixtures/src/",
    outDir,
  });

  await nouveau.init();

  const index = await read(path.join(outDir, "index.html"), "utf-8");
  const nested = await read(path.join(outDir, "nested/index.html"), "utf-8");

  test.ok(index);
  test.ok(nested);
}

(async () => {
  if (process.argv.slice(2)[0] === "--dev") {
    await dev();
  } else {
    await prod();
  }
})();
