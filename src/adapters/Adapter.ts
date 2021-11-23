import { Package } from '../protocol/Package'
import { AdapterDelegate } from './AdapterDelegate'

export interface Adapter<T extends object> {
  sessions: T[]
  setDelegate(delegate: AdapterDelegate): void
  send(pkg: Package, session: T): void
}
