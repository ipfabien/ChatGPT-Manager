const EventBus = require('../core/EventBus');

describe('EventBus', () => {
  let bus;
  beforeEach(() => {
    bus = new EventBus();
  });

  test('on/emit appelle le handler', () => {
    const handler = jest.fn();
    bus.on('test', handler);
    bus.emit('test', 42);
    expect(handler).toHaveBeenCalledWith(42);
  });

  test('off retire le handler', () => {
    const handler = jest.fn();
    bus.on('test', handler);
    bus.off('test', handler);
    bus.emit('test', 42);
    expect(handler).not.toHaveBeenCalled();
  });

  test('emit sans handler ne plante pas', () => {
    expect(() => bus.emit('inconnu', 123)).not.toThrow();
  });
}); 