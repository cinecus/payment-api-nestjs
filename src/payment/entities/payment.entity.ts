import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Account } from '../../account/entities/account.entity'

export type PaymentDocument = mongoose.HydratedDocument<Payment>

@Schema()
export class Payment {
    @Prop()
    type: 'deposit' | 'transfer' | 'receive' | 'withdraw';

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true })
    account: Account;


    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: false })
    refAccount: Account;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    currentAmount: number;

    @Prop({ required: true, default: () => 'success' })
    status: 'sucess' | 'pending' | 'failed'

    @Prop({ default: () => Date.now() + 60 * 60 * 1000 * 7 })
    createdDate: Date

    @Prop({ default: () => Date.now() + 60 * 60 * 1000 * 7 })
    updatedDate: Date

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
