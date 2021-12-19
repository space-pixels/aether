import { Client } from '../Client'

let instance: Client

export function setClientInstance(client: Client) {
  instance = client
}

export function ClientInstance() {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() { return instance }
    })
  }
}
