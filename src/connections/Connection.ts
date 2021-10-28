import { ConnectionDelegate } from './ConnectionDelegate'

export interface Connection {
  setDelegate(delegate: ConnectionDelegate): void
  connect(...args: any[]): Promise<void>
  send(data: ArrayBuffer): void
  close(code: number, description?: string): void
}
