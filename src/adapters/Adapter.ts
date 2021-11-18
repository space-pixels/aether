import { AdapterDelegate } from './AdapterDelegate'

export interface Adapter<T extends object> {
  sessions: T[]
  setDelegate(delegate: AdapterDelegate): void
  send(session: T, data: ArrayBuffer): void
}

export { }

