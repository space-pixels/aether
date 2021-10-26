export interface Client<S = any> {
  userId: string
  state?: S
  send(data: ArrayBuffer): void
}

export interface AdapterDelegate {
  onOpen(client: Client): void
  onMessage(client: Client, data: ArrayBuffer): void
  onClose(client: Client): void
}

export interface Adapter<T extends Client> {
  clients: T[]
  setDelegate(delegate: AdapterDelegate): void
  connect(userId: string): Promise<void>
}

export class DirectAdapter implements Adapter<DirectAdapter>, Client {
  public delegate!: AdapterDelegate
  public userId!: string
  private connected = false

  setDelegate(delegate: AdapterDelegate) {
    this.delegate = delegate
  }

  async connect(userId: string) {
    if (this.connected) { return }
    this.userId = userId
    this.delegate.onOpen(this)
  }

  get clients() { return this.connected ? [this] : [] }

  send(data: ArrayBuffer) {
    if (!this.connected) { return }
    this.delegate.onMessage(this, data)
  }
}
