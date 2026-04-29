import type { WebSocket } from 'ws';

interface WsMessage {
  type: string;
  data: any;
}

export class WsHub {
  private clients = new Set<WebSocket>();

  get clientCount(): number {
    return this.clients.size;
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  broadcast(message: WsMessage) {
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) {
        client.send(payload);
      }
    }
  }
}
