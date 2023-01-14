import { Controller, Post, UseGuards, Body, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ResponseService } from 'src/response/response.service';
import { JwtGuard } from 'src/account/guard';
import { GetAccount } from 'src/account/decorator';
import { DepositDto, TransferDto, WithdrawDto } from './dto/payment.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private response: ResponseService
  ) { }

  @UseGuards(JwtGuard)
  @Post('deposit')
  async deposit(
    @Body() depositDto: DepositDto,
    @GetAccount('accountID') accountID: string
  ) {
    try {
      const payment = await this.paymentService.deposit(depositDto, accountID)
      return this.response.success('ฝากเงินสำเร็จ', payment)
    } catch (error) {
      return this.response.failed(error)
    }
  }

  @UseGuards(JwtGuard)
  @Post('withdraw')
  async withdraw(
    @Body() withdrawDto: WithdrawDto,
    @GetAccount('accountID') accountID: string
  ) {
    try {

      const payment = await this.paymentService.withdraw(withdrawDto, accountID)

      return this.response.success('ถอนเงินสำเร็จ', payment)
    } catch (error) {
      return this.response.failed(error)
    }
  }

  @UseGuards(JwtGuard)
  @Post('transfer')
  async transfer(
    @Body() transferDto: TransferDto,
    @GetAccount('accountID') accountID: string
  ) {
    try {

      const payment = await this.paymentService.transfer(transferDto, accountID)
      return this.response.success('โอนเงินสำเร็จ', payment)
    } catch (error) {
      return this.response.failed(error)
    }
  }

  @UseGuards(JwtGuard)
  @Get('statement')
  async statement(
    @GetAccount('accountID') accountID: string
  ) {
    try {
      const statement = await this.paymentService.statement(accountID)
      return this.response.success('ดึงรายการย้อนหลังสำเร็จ', statement)
    } catch (error) {
      return this.response.failed(error)
    }
  }
}
