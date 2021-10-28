export interface AdapterDelegate {
  onOpen?(session: object): void
  onMessage(data: ArrayBuffer, session: object): void
  onClose?(session: object, code: number, description?: string): void
}
