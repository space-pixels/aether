export class Pool<T extends object> {
  constructor(private sockets: Set<T>) { }

  include(sockets: T[]) {
    for (const socket of sockets) {
      this.sockets.add(socket)
    }
    return this
  }

  exclude(value: T | ((socket: T) => boolean)) {
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
