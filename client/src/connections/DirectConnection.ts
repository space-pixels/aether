import { Connection, ConnectionDelegate } from '../Connection'

export class DirectConnection implements Connection {
  public delegate!: ConnectionDelegate
  public userId?: string

  setDelegate(delegate: ConnectionDelegate) {
    this.delegate = delegate
  }

  async connect(userId: string) {
    this.userId = userId
    this.delegate.onOpen(new Event('open'))
  }

  public send(data: ArrayBuffer): void {
    const event = new MessageEvent<ArrayBuffer>('message', { data })
    this.delegate.onMessage(event)
  }

  public close() {
    this.delegate.onClose(new CloseEvent('close', { code: 1 }))
  }
}
