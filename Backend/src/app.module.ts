import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module'; // <-- Importar

@Module({
  imports: [
    PrismaModule, 
    ProductosModule, 
    UsersModule,
    OrdersModule,
    AddressesModule // <-- Registrar aquí
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}