import { IsString, IsNotEmpty,IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class DepositDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;
}

export class WithdrawDto extends DepositDto{

}

export class TransferDto extends DepositDto{
    @IsString()
    @IsNotEmpty()
    refAccount: string;
}
// export class SigninDto extends PartialType(SignupDto){

// }