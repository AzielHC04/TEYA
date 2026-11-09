import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, CloudinaryService],
  exports: [ProductosService, CloudinaryService],
})
export class ProductosModule {}