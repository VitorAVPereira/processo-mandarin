import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthService } from './services/auth/index.service';
import { AuthModule } from './auth/auth.module';
import { JwtMiddleware } from './middlewares/auth/index.middleware';
import { PrismaModule } from './modules/prisma/index.module';
import { TaskModule } from './modules/task/index.module';
import { PrismaService } from './services/prisma/index.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).exclude({
      path: 'login',
      method: RequestMethod.POST,
    }).forRoutes('*');
  }
}
