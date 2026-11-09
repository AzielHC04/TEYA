import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { UsersModule } from './users/users.module'; 

@Module({
  imports: [
    PrismaModule, 
    ProductosModule, 
    UsersModule // <--- 2. Agrégalo aquí en los imports
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}