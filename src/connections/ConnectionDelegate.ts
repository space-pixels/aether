import { Package } from '../protocol/Package'

export interface ConnectionDelegate {
  onOpen?: () => void
  onMessage: (pkg: Package) => void
  onClose?: (code: number, description?: string) => void
  onError?: (error: Error) => void
}
