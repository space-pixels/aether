import { Field, Message, Type } from 'protobufjs/light'

@Type.d('Packet')
export class Packet extends Message<Packet> {
  @Field.d(1, 'string') name!: string
  @Field.d(2, 'bytes') bytes!: Uint8Array
  @Field.d(3, 'string', 'optional') transactionId?: string
}
