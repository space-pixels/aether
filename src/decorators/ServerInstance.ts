import { Server } from '../Server'

let instance: Server<any> | undefined

export function setServerInstance(server: Server<any> | undefined) {
  instance = server
}

export function ServerInstance() {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        if (!instance) { throw new Error('Service Instance not set') }
        return instance
      }
    })
  }
}
