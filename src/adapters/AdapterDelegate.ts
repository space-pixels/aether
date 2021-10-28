export interface AdapterDelegate {
  onOpen?(session: object): void
  onMessage(session: object, data: ArrayBuffer): void
  onClose?(session: object, code: number, description?: string): void
}
