import { Transaction } from '../..'
import { ExampleRequest } from './ExampleRequest'
import { ExampleResponse } from './ExampleResponse'

export const ExampleTransaction: Transaction<ExampleRequest, ExampleResponse> = [ExampleRequest, ExampleResponse]
