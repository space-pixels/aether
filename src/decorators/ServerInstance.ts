import { Server } from '../Server'

let instance: Server<any>

export function setServerInstance(server: Server<any>) {
  instance = server
}

export function ServerInstance() {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() { return instance }
    })
  }
}
