import { Request, Response } from 'express'

export interface AppRequest extends Request{
    user?:{
        accountID?:string,
        tokenVersion?:number,
        iat?:number,
        exp?:number,
        id?:string,
        email?:string,
        firstName?:string,
        lastName?:string,
        provider?:string
    }
}

export interface AppContext {
    req: AppRequest
    res: Response
}