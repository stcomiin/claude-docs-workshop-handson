import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WsHub } from './hub.js';

function mockSocket() {
  return {
    readyState: 1,
    send: vi.fn(),
    on: vi.fn(),
    OPEN: 1,
  };
}

describe('WsHub', () => {
  let hub: WsHub;

  beforeEach(() => {
    hub = new WsHub();
  });

  it('registers and tracks connected clients', () => {
    const ws = mockSocket();
    hub.addClient(ws as any);
    expect(hub.clientCount).toBe(1);
  });

  it('removes disconnected clients', () => {
    const ws = mockSocket();
    hub.addClient(ws as any);
    hub.removeClient(ws as any);
    expect(hub.clientCount).toBe(0);
  });

  it('broadcasts messages to all connected clients', () => {
    const ws1 = mockSocket();
    const ws2 = mockSocket();
    hub.addClient(ws1 as any);
    hub.addClient(ws2 as any);
    hub.broadcast({ type: 'new_item', data: { id: 'test' } });
    expect(ws1.send).toHaveBeenCalledWith(JSON.stringify({ type: 'new_item', data: { id: 'test' } }));
    expect(ws2.send).toHaveBeenCalledWith(JSON.stringify({ type: 'new_item', data: { id: 'test' } }));
  });

  it('skips clients that are not in OPEN state', () => {
    const ws = mockSocket();
    ws.readyState = 3;
    hub.addClient(ws as any);
    hub.broadcast({ type: 'test', data: {} });
    expect(ws.send).not.toHaveBeenCalled();
  });
});
