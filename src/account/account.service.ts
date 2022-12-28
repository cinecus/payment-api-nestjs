import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupDto, SigninDto } from './dto/account.dto';
import { Account, AccountDocument, } from './entities/account.entity';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs'
import { Payment, PaymentDocument } from 'src/payment/entities/payment.entity';

@Injectable()
export class AccountService {
  constructor(
    private jwt: JwtService,
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    private config: ConfigService

  ) { }
  async signup(signupDto: SignupDto, response: Response) {
    const account = await this.accountModel.findOne({ username: signupDto.username })
    if (!account) {
      signupDto.password = await bcrypt.hashSync(signupDto.password, bcrypt.genSaltSync(10))
      const signupAccount = await this.accountModel.create({ ...signupDto, hashPassword: signupDto.password })
      const { accessToken } = await this.signToken(signupAccount.id)
      await this.sendToken(response, accessToken)
      return signupAccount
    } else {
      return Promise.reject('Username นี้มีในระบบแล้ว')
    }
  }

  async signin(signinDto: SigninDto, response: Response) {
    const account = await this.accountModel.findOne({ username: signinDto.username })
    if (!account) {
      return Promise.reject('Username หรือ Password ไม่ถูกต้อง')
    }

    const pwMatches = await bcrypt.compareSync(signinDto.password, account.hashPassword)

    if (!pwMatches) {
      return Promise.reject('Username หรือ Password ไม่ถูกต้อง')
    }

    const { accessToken } = await this.signToken(account.id)
    await this.sendToken(response, accessToken)
    return account
  }


  async findAccountByID(accountID: string) {
    const account = await this.accountModel.findById(new mongoose.Types.ObjectId(accountID))
    return account
  }

  async getBalance(accountID: string) {
    const balance = await this.paymentModel.findOne({ account: new mongoose.Types.ObjectId(accountID)}).sort({ _id: -1 })
    if (!!balance) {
      return balance.currentAmount
    } else {
      return 0
    }
  }

  async signToken(accountID: string): Promise<{ accessToken: string }> {
    const payload = {
      accountID
    }
    const secret = this.config.get('JWT_SECRET')
    const token = await this.jwt.signAsync(
      payload, {
      expiresIn: '1day',
      secret: secret
    }
    )

    return {
      accessToken: token
    }
  }

  async sendToken(res: Response, token: string) {
    res.cookie('accessToken', token, { httpOnly: true })
    return
  }
}
