import { Field, Message, Type } from 'protobufjs/light'

@Type.d('ExampleState')
export class ExampleState extends Message<ExampleState> {
  @Field.d(1, 'string') name!: string
  @Field.d(2, 'bool') enabled!: boolean
}
