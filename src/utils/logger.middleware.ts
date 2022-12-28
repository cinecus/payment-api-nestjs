import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction): void {
        const { ip, method, originalUrl } = request;
        const userAgent = request.get('user-agent') || '';

        response.on('finish', () => {
            const { statusCode } = response;
            const contentLength = response.get('content-length');
            let body = request.body

            if(originalUrl == '/api/account/signup' || originalUrl == '/api/account/signin' ){
                delete body.password
            }
            this.logger.log(
                `${JSON.stringify(request.cookies)} ${method} ${originalUrl} ${statusCode} ${contentLength} ${JSON.stringify(body)} - ${userAgent} ${ip}`,
            );
        });

        next();
    }
}