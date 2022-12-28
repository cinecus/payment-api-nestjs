import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
    constructor(){}
    success(message:string,result:any,code:number= 200){
        return {
            statusCode:code,
            message,
            result
        }
    }
    failed(error:TypeError |string ){
            throw new BadRequestException(error).getResponse()
        
    }
}
