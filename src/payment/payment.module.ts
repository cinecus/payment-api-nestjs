import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { Payment,PaymentSchema } from './entities/payment.entity';
import { Account,AccountSchema } from 'src/account/entities/account.entity';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
