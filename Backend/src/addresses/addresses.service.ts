import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './addresses.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva dirección para el usuario
  async crearDireccion(dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: {
        userId: dto.userId,
        calle: dto.calle,
        colonia: dto.colonia,
        ciudad: dto.ciudad,
        estado: dto.estado,
        codigoPostal: dto.codigoPostal,
        esPrincipal: dto.esPrincipal ?? false,
      },
    });
  }

  // Obtener todas las direcciones de un usuario
  async obtenerDireccionesPorUsuario(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Actualizar una dirección específica por su ID
  async actualizarDireccion(id: string, dto: UpdateAddressDto) {
    const existe = await this.prisma.address.findUnique({ where: { id } });
    if (!existe) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return this.prisma.address.update({
      where: { id },
      data: {
        calle: dto.calle,
        colonia: dto.colonia,
        ciudad: dto.ciudad,
        estado: dto.estado,
        codigoPostal: dto.codigoPostal,
      },
    });
  }

  // Eliminar una dirección por su ID
  async eliminarDireccion(id: string) {
    const existe = await this.prisma.address.findUnique({ where: { id } });
    if (!existe) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return this.prisma.address.delete({
      where: { id },
    });
  }
}