import { Client } from '@space-pixels/aether-core'

export class Pool {
  constructor(private sockets: Set<Client>) { }

  include(sockets: Client[]) {
    for (const socket of sockets) {
      this.sockets.add(socket)
    }
    return this
  }

  exclude(value: Client | ((socket: Client) => boolean)) {
    if (typeof value === 'function') {
      this.sockets.forEach((socket) => {
        if (!value(socket)) { this.sockets.delete(socket) }
      })
    } else {
      this.sockets.delete(value)
    }
    return this
  }

  get() {
    return Array.from(this.sockets)
  }
}
