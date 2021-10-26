export interface ConnectionDelegate {
  onOpen: (event: Event) => void
  onMessage: (event: MessageEvent) => void
  onClose: (event: CloseEvent) => void
  onError: (event: Event) => void
}

export interface Connection {
  userId?: string
  setDelegate(delegate: ConnectionDelegate): void
  connect(userId: string): Promise<void>
  send(data: ArrayBuffer): void
  close(code?: number, reason?: string): void
}
