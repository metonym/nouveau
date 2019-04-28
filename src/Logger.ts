import chalk from 'chalk';

export const enum MessageType {
  Danger = 'Danger',
  Neutral = 'Neutral',
  Success = 'Success',
  Warning = 'Warning'
}

const MESSAGE_COLOR = {
  [MessageType.Neutral]: 'cyan',
  [MessageType.Danger]: 'red',
  [MessageType.Success]: 'green',
  [MessageType.Warning]: 'yellow'
};

class Logger {
  public log(message: string) {
    // tslint:disable-next-line: no-console
    console.log(message);
  }

  public print({
    type,
    title,
    message
  }: {
    type: MessageType;
    title: string;
    message: string;
  }) {
    // tslint:disable-next-line: no-console
    console.log(chalk[MESSAGE_COLOR[type]].bold(title), message);
  }
}

const logger = new Logger();

export { logger, Logger };
