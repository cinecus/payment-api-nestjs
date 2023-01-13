import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { ResponseService } from 'src/response/response.service';
import { AccountService } from './account.service';
import { SignupDto, SigninDto } from './dto/account.dto';
import { GetAccount } from './decorator';
import { JwtGuard } from './guard';

@Controller('api/account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private response: ResponseService
  ) { }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) response: Response) {
    try {
      const account = await this.accountService.signup(signupDto, response);
      return this.response.success('เข้าสู่ระบบแล้ว', account)
    } catch (error) {
      return this.response.failed(error)
    }
  }


  @Post('signin')
  async signin(@Body() signinDto: SigninDto, @Res({ passthrough: true }) response: Response) {
    try {
      const account = await this.accountService.signin(signinDto, response)
      return this.response.success('เข้าสู่ระบบแล้ว', account)
    } catch (error) {
      return this.response.failed(error)
    }
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async me(
    @GetAccount('accountID') accountID: string
  ) {
    try {
      const account = (await this.accountService.findAccountByID(accountID)).toObject()
      delete account.hashPassword
      return this.response.success('ดึงข้อมูลสำเร็จ', account)
    } catch (error) {
      return this.response.failed(error)
    }
  }

  @UseGuards(JwtGuard)
  @Post('signout')
  async signout(
    @Res({ passthrough: true }) response: Response
  ) {
    try {

      response.clearCookie('accessToken')

      return this.response.success('ออกจากระบบแล้ว', null)

    } catch (error) {
      return this.response.failed(error)
    }
  }

  @UseGuards(JwtGuard)
  @Get('balance')
  async balance(
    @GetAccount('accountID') accountID: string
  ) {
    try {
      const account = await this.accountService.getBalance(accountID)
      return this.response.success('ดึงข้อมูลสำเร็จ', account)
    } catch (error) {
      return this.response.failed(error)
    }
  }
}
