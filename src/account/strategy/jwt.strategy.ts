import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { AppRequest } from "src/utils/types";
import { AccountService } from "../account.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private accountService:AccountService
    ) {
        super({
            // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: AppRequest) => {
                    let token = request?.cookies?.["accessToken"]
                    if (!token) {
                        return null
                    }
                    return token
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: config.get('JWT_SECRET'),
        })
    }

    async validate(payload: { accountID: string,  iat: number, exp: number }) {
        const account =await this.accountService.findAccountByID(payload.accountID)
        // console.log('account', account)
        return { ...account,...payload}
    }

}