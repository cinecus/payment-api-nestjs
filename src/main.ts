import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './execption';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs'
import * as morgan from 'morgan'
import * as path from 'path'
import * as rfs from 'rotating-file-stream'
import * as dfns from 'date-fns'


function logFilename() {
  return `${dfns.format(new Date(), 'yyyy-MM-dd')}-access.log`;
}

const logStream = rfs.createStream(logFilename,{
  interval:'1d',
  path: path.join(__dirname,'..', 'log')
})

async function bootstrap() {
  const port = process.env.PORT || 5000
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new HttpExceptionFilter())
  // app.use(cookieParser())

  app.use(morgan('combined',{stream:logStream}))

  await app.listen(port, () => {
    let logger = new Logger('START');
    logger.debug(`server is listening on port ${port}`)
  });
}
bootstrap();
