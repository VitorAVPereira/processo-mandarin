import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthService } from './services/auth/index.service';
import { AuthModule } from './auth/auth.module';
import { JwtMiddleware } from './middlewares/auth/index.middleware';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService, JwtAuthService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).exclude({
      path: 'login',
      method: RequestMethod.POST,
    }).forRoutes('*');
  }
}
