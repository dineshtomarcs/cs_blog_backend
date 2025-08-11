import { Module } from '@nestjs/common';
import { BlogModule } from './blog/blog.module';
import { BlogController } from './blog/blog.controller';
import { BlogService } from './blog/blog.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [BlogModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
  controllers: [BlogController],
  providers: [BlogService],
})
export class AppModule { }
