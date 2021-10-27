import { Client } from './Adapter'

export interface ConnectionDelegate {
  onOpen: (event: any) => void
  onMessage: (event: any) => void
  onClose: (event: any) => void
  onError: (event: any) => void
}

export class Socket<S = any> implements Client {
  state?: S
  delegate: ConnectionDelegate

  constructor(public userId: string, delegate: ConnectionDelegate) {
    this.delegate = delegate
  }

  send(data: ArrayBuffer) {
    this.delegate.onMessage({ data })
  }
}
