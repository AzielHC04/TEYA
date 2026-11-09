import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.producto.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.producto.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.producto.create({ data });
  }

  // Método para actualizar producto
  async update(id: string, data: any) {
    return this.prisma.producto.update({
      where: { id },
      data,
    });
  }

  // Método para eliminar producto
  async delete(id: string) {
    return this.prisma.producto.delete({
      where: { id },
    });
  }

  async procesarCompra(id: string, cantidad: number) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto || producto.stock < cantidad) {
      throw new Error('Stock insuficiente');
    }
    return this.prisma.producto.update({
      where: { id },
      data: { stock: producto.stock - cantidad },
    });
  }
}