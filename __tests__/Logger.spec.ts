// tslint:disable: no-console
import { Logger, MessageType } from '../src/Logger';

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'log');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('log', () => {
    const { logger } = setup();

    logger.log('message');
    expect(console.log).toBeCalledTimes(1);
  });

  test('print', () => {
    const { logger } = setup();

    const props = {
      type: MessageType.Neutral,
      title: 'title',
      message: 'message'
    };

    logger.print(props);
    expect(console.log).toBeCalledTimes(1);
  });
});

function setup() {
  const logger = new Logger();
  expect(console.log).toBeCalledTimes(0);

  return { logger };
}
