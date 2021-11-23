export interface AdapterDelegate<T = object> {
  onOpen?(session: T): void
  onMessage(data: ArrayBuffer, session: T): void
  onClose?(session: object, code: number, description?: string): void
}
