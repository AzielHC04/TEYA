import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Listar todos los usuarios para la vista de administración
  async obtenerUsuarios() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Registrar un nuevo usuario (cifrando la contraseña)
  async registrar(dto: RegisterDto) {
    const existe = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existe) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || 'CLIENT',
      },
    });
  }

  // Iniciar sesión con credenciales
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return {
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Eliminar usuario desde el panel de admin
  async eliminarUsuario(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}