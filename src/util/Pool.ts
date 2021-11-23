import { Message } from 'protobufjs/light'
import { Adapter } from '../adapters/Adapter'
import { Package } from '../protocol/Package'

export class Pool<T extends object> {
  private sessions: Set<T>

  constructor(private adapter: Adapter<T>) {
    this.sessions = new Set(adapter.sessions)
  }

  include(sessions: T[]) {
    for (const session of sessions) {
      this.sessions.add(session)
    }
    return this
  }

  exclude(value: T | ((session: T) => boolean)) {
    if (typeof value === 'function') {
      this.sessions.forEach((session) => {
        if (!value(session)) { this.sessions.delete(session) }
      })
    } else {
      this.sessions.delete(value)
    }
    return this
  }

  send<T extends Message>(message: T) {
    const pkg = new Package(message)
    this.sessions.forEach((session) => {
      this.adapter.send(pkg, session)
    })
  }

  get() {
    return Array.from(this.sessions)
  }
}
