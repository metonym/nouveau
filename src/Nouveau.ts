import chalk from 'chalk';
import { pathExists } from 'fs-extra';
import { logger, MessageType } from './Logger';
import { StaticSiteGenerator } from './StaticSiteGenerator';

const enum CliArgument {
  start = 'start',
  build = 'build'
}

interface INouveauProps {
  process: NodeJS.Process;
}

export interface INouveauConfig {
  rootDir: string;
  outDir: string;
  locals?: object;
}

export type BaseUrl = string;

class Nouveau {
  private cwd: string;
  private config: INouveauConfig = {
    outDir: 'dist',
    rootDir: 'src'
  };
  private flags: CliArgument[];
  private ssg: StaticSiteGenerator;

  constructor(props: INouveauProps) {
    this.cwd = props.process.cwd();
    this.flags = props.process.argv.slice(2) as CliArgument[];
  }

  public async init() {
    try {
      await this.options();
    } catch (error) {
      logger.log(chalk`${chalk.red.bold('Error')} ${error}`);
      process.exit(1);
    }

    logger.print({
      message: this.flags[0],
      title: 'Nouveau',
      type: MessageType.Neutral
    });

    // TODO: check for misc tags (help, version)

    this.ssg = new StaticSiteGenerator({
      cwd: this.cwd,
      entry: this.config.rootDir,
      output: this.config.outDir
    });

    switch (this.flags[0]) {
      case 'start':
        logger.log(chalk.dim('starting...'));

        await this.ssg.watch();
        break;
      case 'build':
        await this.ssg.build();
        break;
    }
  }

  private async options() {
    const customConfigPath = `${this.cwd}/nouveau.config.js`;

    if (await pathExists(customConfigPath)) {
      const config: INouveauConfig = require(customConfigPath);

      this.config = {
        ...this.config,
        ...config
      };
    }
  }
}

export { Nouveau };
