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
  connect(): Promise<void>
}
