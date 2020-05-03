import { strict as test } from "assert";
import fs from "fs";
import Nouveau from "../";

async function dev() {
  const nouveau = new Nouveau({
    dev: true,
    noWatch: true,
    entry: "src/tests/fixtures/src/",
    outDir: "src/tests/fixtures/.site/",
  });

  await nouveau.init();

  const index = fs.readFileSync("src/tests/fixtures/.site/index.html", "utf-8");
  const nested = fs.readFileSync(
    "src/tests/fixtures/.site/nested/index.html",
    "utf-8"
  );

  test.ok(index);
  test.ok(nested);
}

async function prod() {
  const nouveau = new Nouveau({
    dev: false,
    entry: "src/tests/fixtures/src/",
    outDir: "src/tests/fixtures/dist/",
  });

  await nouveau.init();

  const index = fs.readFileSync("src/tests/fixtures/dist/index.html", "utf-8");
  const nested = fs.readFileSync(
    "src/tests/fixtures/dist/nested/index.html",
    "utf-8"
  );

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
