import { Adapter } from '../adapters/Adapter'
import { AdapterDelegate } from '../adapters/AdapterDelegate'
import { Connection } from '../connections/Connection'
import { ConnectionDelegate } from '../connections/ConnectionDelegate'
import { Package } from '../protocol/Package'

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
      send(pkg: Package) { adapterDelegate.onMessage(pkg, session) },
      close() { }
    },
    adapter: {
      sessions: [session],
      setDelegate(delegate) { adapterDelegate = delegate },
      send(pkg) { connectionDelegate.onMessage(pkg) }
    }
  }
  return bridge
}
