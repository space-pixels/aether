import { AdapterDelegate } from '@space-pixels/aether-core'
import { Connection, ConnectionDelegate } from '../Connection'

export class DirectConnection implements Connection {
  public delegate!: ConnectionDelegate
  public adapter!: AdapterDelegate
  public userId!: string

  setDelegate(delegate: ConnectionDelegate) {
    this.delegate = delegate
  }

  setAdapter(adapter: AdapterDelegate) {
    this.adapter = adapter
  }

  async connect(userId: string) {
    this.userId = userId
    this.delegate.onOpen(new Event('open'))
  }

  public send(data: ArrayBuffer): void {
    this.adapter.onMessage(this, data)
  }

  public close() {
    this.delegate.onClose(new CloseEvent('close', { code: 1 }))
  }
}
