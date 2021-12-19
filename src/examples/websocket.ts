import { createServer } from 'http'
import { WebsocketAdapter } from '../adapters/WebsocketAdapter'
import { WebsocketConnection } from '../connections/WebsocketConnection'
import { ClientService } from './classes/ClientService'
import { ServerService } from './classes/ServerService'
import { ExampleClient } from './client/ExampleClient'
import { ExampleRequest } from './protocol/ExampleRequest'
import { ExampleState } from './protocol/ExampleState'
import { ExampleTransaction } from './protocol/ExampleTransaction'
import { ExampleServer } from './server/ExampleServer'

async function main() {
  // Create Server
  const httpServer = createServer()
  const adapter = new WebsocketAdapter({ httpServer })
  const server = new ExampleServer(adapter)
  httpServer.listen(8081)
  console.info(`ExampleServer listening on ws://localhost:8081/game`)

  // Create Client
  const connection = new WebsocketConnection()
  const client = new ExampleClient(connection)
  await connection.connect('ws://localhost:8081/game')

  // Register services
  const serverService = new ServerService()
  const clientService = new ClientService()

  // Send Transaction
  console.info(`~> [example] sending request 'hello world'`)
  const response = await client.request(ExampleTransaction, new ExampleRequest({ message: 'hello world' }))
  console.info(`~> [example] received response '${response.message}'`)

  // Send State
  client.send(new ExampleState({ name: 'example', enabled: true }))

  // Wait for response
  await new Promise((resolve) => { setTimeout(resolve, 1000) })

  // Close connection
  connection.close(1000)
  httpServer.close()
}

main()
