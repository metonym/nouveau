import Nouveau from "../";
import test from "tape";
import fs from "fs";

test("Nouveau - dev", async (t) => {
  const nouveau = new Nouveau({
    dev: true,
    entry: "src/tests/fixtures/src/",
    outDir: "src/tests/fixtures/.site/",
  });

  await nouveau.init();

  const index = fs
    .readFileSync("src/tests/fixtures/.site/index.html")
    .toString();

  t.ok(index);

  const nested = fs
    .readFileSync("src/tests/fixtures/.site/nested/index.html")
    .toString();

  t.ok(nested);

  t.end();
});

test.only("Nouveau - prod", async (t) => {
  const nouveau = new Nouveau({
    dev: false,
    entry: "src/tests/fixtures/src/",
    outDir: "src/tests/fixtures/dist/",
  });

  await nouveau.init();

  const index = fs
    .readFileSync("src/tests/fixtures/dist/index.html")
    .toString();

  t.ok(index);

  const nested = fs
    .readFileSync("src/tests/fixtures/dist/nested/index.html")
    .toString();

  t.ok(nested);

  t.end();
});
