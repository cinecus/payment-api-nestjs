import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Payment } from '../../payment/entities/payment.entity';

export type AccountDocument = mongoose.HydratedDocument<Account>

@Schema()
export class Account {
    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop()
    tel: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop()
    hashPassword: string;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Payment',required:false})
    payment:Payment[];

    @Prop({ default: () => Date.now() + 60 * 60 * 1000 * 7,required:false })
    createdDate: Date;

    @Prop({ default: () => Date.now() + 60 * 60 * 1000 * 7,required:false })
    updatedDate: Date;

}

export const AccountSchema = SchemaFactory.createForClass(Account);
