import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account,AccountSchema } from './entities/account.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Payment, PaymentSchema } from 'src/payment/entities/payment.entity';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    JwtModule.register({
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService,JwtStrategy]
})
export class AccountModule {}
