import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Account, AccountDocument } from 'src/account/entities/account.entity';
import { DepositDto, TransferDto, WithdrawDto } from './dto/payment.dto';
import { Payment, PaymentDocument } from './entities/payment.entity';

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) { }

    async deposit(depositDto: DepositDto, accountID: string) {
        const transactionSession = await this.connection.startSession();
        let payment
        try {
            transactionSession.startTransaction();
            const lastestPayment = await this.paymentModel.findOne({ account: new mongoose.Types.ObjectId(accountID) }).sort({ _id: -1 })
            if (!!lastestPayment) {
                payment = await this.paymentModel.create([{
                    type: 'deposit',
                    account: accountID,
                    refAccount: null,
                    amount: depositDto.amount,
                    currentAmount: lastestPayment.currentAmount + depositDto.amount
                }], { session: transactionSession })
            } else {
                payment = await this.paymentModel.create([{
                    type: 'deposit',
                    account: accountID,
                    refAccount: null,
                    amount: depositDto.amount,
                    currentAmount: depositDto.amount
                }], { session: transactionSession })
            }
            const account = await this.accountModel.findById(accountID)
            account.payment.push(payment[0].id)
            await account.save({ session: transactionSession })
            await transactionSession.commitTransaction();
        } catch (error) {
            await transactionSession.abortTransaction();
            console.log('error', error)
            return Promise.reject('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            await transactionSession.endSession();
        }
        return payment
    }

    async withdraw(withdrawDto: WithdrawDto, accountID: string) {
        const transactionSession = await this.connection.startSession();
        let payment
        try {
            transactionSession.startTransaction();
            const lastestPayment = await this.paymentModel.findOne({ account: new mongoose.Types.ObjectId(accountID) }).sort({ _id: -1 })
            if (!!lastestPayment) {
                if (lastestPayment.currentAmount >= withdrawDto.amount) {
                    payment = await this.paymentModel.create([{
                        type: 'withdraw',
                        account: accountID,
                        refAccount: null,
                        amount: -withdrawDto.amount,
                        currentAmount: lastestPayment.currentAmount - withdrawDto.amount
                    }], { session: transactionSession })
                } else {
                    await transactionSession.abortTransaction();
                    return Promise.reject('ไม่สามารถถอนเงินได้ เนื่องจากเงินในบัญชีไม่เพียงพอ')
                }
            } else {
                await transactionSession.abortTransaction();
                return Promise.reject('ไม่สามารถถอนเงินได้ เนื่องจากเงินในบัญชีไม่เพียงพอ')
            }
            const account = await this.accountModel.findById(accountID)
            account.payment.push(payment[0].id)

            await account.save({ session: transactionSession })

            await transactionSession.commitTransaction();
        } catch (error) {
            await transactionSession.abortTransaction();
            console.log('error', error)
            return Promise.reject('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            await transactionSession.endSession();
        }
        return payment
    }

    async transfer(transferDto: TransferDto, accountID: string) {
        const transactionSession = await this.connection.startSession();
        let payment
        let paymentRefAccount
        try {
            transactionSession.startTransaction();
            //หารหัสผู้โอน

            console.log('first', mongoose.isValidObjectId(transferDto.refAccount))
            let refAccount: AccountDocument
            if (mongoose.isValidObjectId(transferDto.refAccount)) {
                refAccount = await this.accountModel.findById(transferDto.refAccount)
            } else {
                refAccount = await this.accountModel.findOne({ username: transferDto.refAccount })
            }

            if (!refAccount) {
                await transactionSession.abortTransaction();
                return Promise.reject('ข้อมูลผู้รับเงินไม่พบผู้รับเงินในระบบ')
            }

            //โอนเงิน
            const lastestPayment = await this.paymentModel.findOne({ account: new mongoose.Types.ObjectId(accountID) }).sort({ _id: -1 })
            if (!!lastestPayment) {
                if (lastestPayment.currentAmount >= transferDto.amount) {
                    payment = await this.paymentModel.create([{
                        type: 'transfer',
                        account: accountID,
                        refAccount: refAccount.id,
                        amount: -transferDto.amount,
                        currentAmount: lastestPayment.currentAmount - transferDto.amount
                    }], { session: transactionSession })
                } else {
                    await transactionSession.abortTransaction();
                    return Promise.reject('ไม่สามารถถอนเงินได้ เนื่องจากเงินในบัญชีไม่เพียงพอ')
                }
            } else {
                await transactionSession.abortTransaction();
                return Promise.reject('ไม่สามารถถอนเงินได้ เนื่องจากเงินในบัญชีไม่เพียงพอ')
            }
            const account = await this.accountModel.findById(accountID)
            account.payment.push(payment[0].id)
            await account.save({ session: transactionSession })


            //รับเงิน
            const lastestPaymentRefAccount = await this.paymentModel.findOne({ account: new mongoose.Types.ObjectId(refAccount.id) }).sort({ _id: -1 })
            if (!!lastestPaymentRefAccount) {
                paymentRefAccount = await this.paymentModel.create([{
                    type: 'receive',
                    account: refAccount.id,
                    refAccount: accountID,
                    amount: transferDto.amount,
                    currentAmount: lastestPaymentRefAccount.currentAmount + transferDto.amount
                }], { session: transactionSession })
            } else {
                paymentRefAccount = await this.paymentModel.create([{
                    type: 'receive',
                    account: refAccount.id,
                    refAccount: accountID,
                    amount: transferDto.amount,
                    currentAmount: transferDto.amount
                }], { session: transactionSession })
            }


            refAccount.payment.push(paymentRefAccount[0].id)
            await refAccount.save({ session: transactionSession })

            await transactionSession.commitTransaction();
        } catch (error) {
            await transactionSession.abortTransaction();
            console.log('error', error)
            return Promise.reject('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            await transactionSession.endSession();
        }
        return payment
    }

    async statement(accountID: string) {
        return await this.paymentModel.find({ account: new mongoose.Types.ObjectId(accountID) }).sort({ _id: -1 })
    }
}
