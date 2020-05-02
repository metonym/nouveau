import CheapWatch from "cheap-watch";
import posthtml from "posthtml";
import svelte from "posthtml-svelte";
import { resolve, join, dirname, parse, isAbsolute } from "path";
import { promisify } from "util";
import { performance } from "perf_hooks";
import fs from "fs-extra";
import fg from "fast-glob";
import { createHash } from "crypto";
import { green, bold, red, white, gray } from "chalk";

type EmitterCallback = (metadata: { path: string; isNew: boolean }) => void;

interface InstantiatedCheapWatch extends CheapWatch {
  on: (operator: "+" | "-", cb: EmitterCallback) => void;
}

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class Nouveau {
  watcher!: InstantiatedCheapWatch;
  noWatch: boolean = false;
  dev: boolean = true;
  entry: string = "src/";
  outDir: string = "public/";
  _entry: string = "src/";
  _outDir: string = "public/";

  constructor(props?: {
    dev?: boolean;
    noWatch?: boolean;
    entry?: string;
    outDir?: string;
  }) {
    if (props && typeof props.dev === "boolean") {
      this.dev = props.dev;
    }

    if (props && typeof props.noWatch === "boolean") {
      this.noWatch = props.noWatch;
    }

    if (props?.entry) {
      props.entry += props.entry.endsWith("/") ? "" : "/";
      this._entry = props.entry;
      this.entry = resolve(process.cwd(), props.entry);
    }

    if (props?.outDir) {
      props.outDir += props.outDir.endsWith("/") ? "" : "/";
      this._outDir = props.outDir;
      this.outDir = resolve(process.cwd(), props.outDir);
    }
  }

  async init() {
    await fs.remove(resolve(this.outDir));
    await fs.ensureDir(resolve(this.outDir));

    const index_files = await fg([resolve(this.entry, "**/*.html")]);

    for (const file of index_files) {
      await this.processFile(file);
    }

    if (this.dev && !this.noWatch) {
      this.watcher = new CheapWatch({
        dir: this.entry,
      }) as InstantiatedCheapWatch;

      await this.watcher.init();

      this.watcher.on("+", ({ path }) => {
        this.processFile(path);
      });

      this.watcher.on("-", ({ path }) => {
        fs.remove(resolve(this.outDir, path));
      });
    }
  }

  async processFile(path: string) {
    const { ext } = parse(path);

    if (ext !== ".html") {
      return;
    }

    try {
      const start = performance.now();
      const file = (await readFile(resolve(this.entry, path))) as Buffer;
      const outputPath = isAbsolute(path)
        ? path.replace(this.entry, this.outDir)
        : resolve(this.outDir, path);
      const result = await posthtml([
        svelte({
          out: this.dev ? undefined : dirname(outputPath),
          currentDir: join(this.entry),
          key: createHash("md5").update(path).digest("hex"),
        }),
      ]).process(file.toString(), {
        // @ts-ignore
        recognizeSelfClosing: true,
      });

      let html = result.html;

      if (!this.dev) {
        const htmlnano = await import("htmlnano");
        const minified = await htmlnano.process(result.html, {});

        html = minified.html;
      }

      await fs.ensureFile(outputPath);
      await writeFile(outputPath, html);

      const bench = (performance.now() - start) / 1000;
      const suffix = bench > 1 ? "s" : "ms";
      const styledPath = white(path.split(this._entry).pop());
      const styledTime = bold(green(bench.toFixed(2), suffix));

      console.log(gray("> Built", styledPath, "in", styledTime));
    } catch (error) {
      console.log(red(error));
    }
  }

  destroy() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

export default Nouveau;
