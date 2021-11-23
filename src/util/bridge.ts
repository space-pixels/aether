import { Adapter } from '../adapters/Adapter'
import { AdapterDelegate } from '../adapters/AdapterDelegate'
import { Connection } from '../connections/Connection'
import { ConnectionDelegate } from '../connections/ConnectionDelegate'

export interface Bridge<T extends object> {
  connection: Connection
  adapter: Adapter<T>
}

export function createBridge<T extends object>(session: T): Bridge<T> {
  let adapterDelegate: AdapterDelegate<T>
  let connectionDelegate: ConnectionDelegate
  const bridge: Bridge<T> = {
    connection: {
      setDelegate(delegate) { connectionDelegate = delegate },
      connect() { return Promise.resolve() },
      send(data: ArrayBuffer) { adapterDelegate.onMessage(data, session) },
      close() { }
    },
    adapter: {
      sessions: [session],
      setDelegate(delegate) { adapterDelegate = delegate },
      send(_, data) { connectionDelegate.onMessage(data) }
    }
  }
  return bridge
}
