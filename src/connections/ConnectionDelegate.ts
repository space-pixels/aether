export interface ConnectionDelegate {
  onOpen?: () => void
  onMessage: (data: ArrayBuffer) => void
  onClose?: (code: number, description?: string) => void
  onError?: (error: Error) => void
}

export { }
