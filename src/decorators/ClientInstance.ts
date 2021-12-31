import { Client } from '../Client'

let instance: Client | undefined

export function setClientInstance(client: Client | undefined) {
  instance = client
}

export function ClientInstance() {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        if (!instance) { throw new Error('Client Instance not set') }
        return instance
      }
    })
  }
}
