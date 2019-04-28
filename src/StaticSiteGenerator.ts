import chalk from 'chalk';
import Eval from 'eval';
import { copy, outputFile } from 'fs-extra';
// tslint:disable-next-line: ordered-imports
import { minify } from 'html-minifier';
import liveServer from 'live-server';
import path from 'path';
import { rollup, RollupOptions, RollupWatcher, watch } from 'rollup';
import md from 'rollup-plugin-md';
import resolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import { logger, MessageType } from './Logger';

const enum Mode {
  DEV = 'DEV',
  PROD = 'PROD'
}

interface IStaticSiteGeneratorProps {
  cwd: string;
  entry: string;
  output: string;
}

interface IStaticSiteGeneratorConfig {
  entry: string;
  output: string;
  svelteOptions: {
    css: boolean;
    emitCss: boolean;
    generate: 'ssr' | 'dom';
    hydratable: boolean;
  };
}

class StaticSiteGenerator {
  private config: IStaticSiteGeneratorConfig = {
    entry: '',
    output: '',
    svelteOptions: {
      css: false,
      emitCss: false,
      generate: 'ssr',
      hydratable: true
    }
  };

  private watcher: RollupWatcher;
  private liveServer: object;

  constructor(props: IStaticSiteGeneratorProps) {
    this.config.entry = path.join(props.cwd, props.entry);
    this.config.output = path.join(props.cwd, props.output);

    this.init();
  }

  public async init() {
    await copy(
      path.join(this.config.entry, 'static'),
      path.join(this.config.output, 'static')
    );
  }

  public async watch() {
    await this.compile(Mode.DEV);
  }

  public async build() {
    await this.compile(Mode.PROD);
  }

  private async compile(mode: Mode) {
    const { entry, output, svelteOptions } = this.config;
    const plugins = [md(), resolve({})];

    async function generateTemplate() {
      const inputOptions: RollupOptions = {
        input: `${entry}/index.html`,
        plugins: [
          ...plugins,
          svelte({
            ...svelteOptions
          })
        ]
      };

      const bundle = await rollup(inputOptions);

      const serverBundle = await bundle.generate({
        format: 'cjs'
      });

      const App = Eval(serverBundle.output[0].code, true);
      const { head, css, html } = App.render();

      const template = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            ${head}
            <style>
              ${css.code}
            </style>
          </head>
          <body>
            ${html}
            <script src="/bundle.js"></script>
          </body>
        </html>
      `;

      if (mode === Mode.DEV) {
        await outputFile(`${output}/index.html`, template);
      } else {
        const minifiedTemplate = minify(template, {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        });

        await outputFile(`${output}/index.html`, minifiedTemplate);
      }

      const entryJs = `
        import Entry from '${entry}/index.html';
        export default new Entry({ target: document.body, hydrate: true });
      `;

      const entryFile = path.join(__dirname, '.cache/index.js');

      await outputFile(entryFile, entryJs);

      return {
        entryFile
      };
    }

    const generatedTemplate = await generateTemplate();

    const clientInputOptions: RollupOptions = {
      input: generatedTemplate.entryFile,
      output: {
        file: `${output}/bundle.js`,
        format: 'iife',
        name: 'bundle'
      },
      plugins: [
        ...plugins,
        svelte({
          ...svelteOptions,
          generate: 'dom'
        }),
        mode === Mode.PROD && terser()
      ]
    };

    if (mode === Mode.DEV) {
      this.watcher = await watch([clientInputOptions]);

      this.watcher.on('event', async event => {
        switch (event.code) {
          case 'END':
            if (!this.liveServer) {
              this.startLiveServer();
            } else {
              logger.print({
                message: 'Files reloaded',
                title: 'Success',
                type: MessageType.Success
              });

              const inputOptions: RollupOptions = {
                input: `${entry}/index.html`,
                plugins: [
                  ...plugins,
                  svelte({
                    ...svelteOptions
                  })
                ]
              };

              const bundle = await rollup(inputOptions);

              const serverBundle = await bundle.generate({
                format: 'cjs'
              });

              const App = Eval(serverBundle.output[0].code, true);
              const { head, css, html } = App.render();

              const template = `
              <!DOCTYPE html>
              <html>
                <head>
                  ${head}
                  <style>
                    ${css.code}
                  </style>
                </head>
                <body>
                  ${html}
                  <script src="/bundle.js"></script>
                </body>
              </html>
            `;

              await outputFile(`${output}/index.html`, template);
            }
            break;
        }
      });
    } else {
      logger.print({
        message: 'Building site for production',
        title: 'Building',
        type: MessageType.Neutral
      });

      const clientBundle = await rollup(clientInputOptions);
      clientBundle.write(clientInputOptions.output);
    }
  }

  private startLiveServer() {
    const { output } = this.config;

    this.liveServer = liveServer.start({
      file: 'index.html', // TODO: replace with 404.html
      host: 'localhost',
      logLevel: 0,
      noCssInject: true,
      open: false,
      port: 8080, // TODO: configure
      root: output,
      wait: 250,
      watch: output
    });

    logger.print({
      message: `Watching files in ${chalk.cyan(output)}`,
      title: 'Server started on port 8080',
      type: MessageType.Success
    });
  }
}

export { StaticSiteGenerator };
