import { Adapter } from '../adapters/Adapter'
import { AdapterDelegate } from '../adapters/AdapterDelegate'
import { Connection } from '../connections/Connection'
import { ConnectionDelegate } from '../connections/ConnectionDelegate'

export interface Bridge {
  connection: Connection
  adapter: Adapter<object>
}

export function createBridge(): Bridge {
  let adapterDelegate: AdapterDelegate
  let connectionDelegate: ConnectionDelegate
  return {
    connection: {
      setDelegate(delegate) { connectionDelegate = delegate },
      connect() { return Promise.resolve() },
      send(data: ArrayBuffer) { adapterDelegate.onMessage({}, data) },
      close() { }
    },
    adapter: {
      sessions: [],
      setDelegate(delegate) { adapterDelegate = delegate },
      send(_, data) { connectionDelegate.onMessage(data) }
    }
  }
}
