import { Package } from '../protocol/Package'

export interface AdapterDelegate<T = object> {
  onOpen?(session: T): void
  onMessage(pkg: Package, session: T): void
  onClose?(session: object, code: number, description?: string): void
}
