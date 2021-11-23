import { Package } from '../protocol/Package'
import { ConnectionDelegate } from './ConnectionDelegate'

export interface Connection {
  setDelegate(delegate: ConnectionDelegate): void
  connect(...args: any[]): Promise<void>
  send(pkg: Package): void
  close(code: number, description?: string): void
}
