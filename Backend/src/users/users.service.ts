
import {
  Injectable,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto
} from './users.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService
  ) {}

  // ==========================================
  // OBTENER USUARIOS
  // ==========================================

  async obtenerUsuarios() {

    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  // ==========================================
  // REGISTRAR USUARIO
  // ==========================================

  async registrar(dto: RegisterDto) {

    const existe = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });

    if (existe) {
      throw new BadRequestException(
        'El correo electrónico ya está registrado.'
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10
    );

    // Conservar respuesta sin exponer el hash.
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  async login(dto: LoginDto) {

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });

    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas.'
      );
    }

    const isMatch = await bcrypt.compare(
      dto.password,
      user.password
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Credenciales inválidas.'
      );
    }

    return {
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  async cambiarContrasena(
    dto: ChangePasswordDto
  ) {

    // VALIDAR TIPOS DE DATOS
    if (
      typeof dto?.email !== 'string' ||
      typeof dto?.currentPassword !== 'string' ||
      typeof dto?.newPassword !== 'string'
    ) {
      throw new BadRequestException(
        'Debes proporcionar el correo y ambas contraseñas.'
      );
    }

    const email = dto.email.trim().toLowerCase();

    const currentPassword = dto.currentPassword;
    const newPassword = dto.newPassword;

    // VALIDAR CORREO
    const patronCorreo =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!patronCorreo.test(email)) {
      throw new BadRequestException(
        'Introduce un correo electrónico válido.'
      );
    }

    // COMPROBAR CONTRASEÑA ACTUAL
    if (!currentPassword) {
      throw new BadRequestException(
        'La contraseña actual es obligatoria.'
      );
    }

    // MÍNIMO DE 8 CARACTERES
    if (newPassword.length < 8) {
      throw new BadRequestException(
        'La nueva contraseña debe tener al menos 8 caracteres.'
      );
    }

    // LÍMITE PARA EVITAR ENTRADAS EXCESIVAS
    if (newPassword.length > 128) {
      throw new BadRequestException(
        'La nueva contraseña no puede superar 128 caracteres.'
      );
    }

    // VALIDAR QUE SEA DIFERENTE
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente de la actual.'
      );
    }

    // BUSCAR CUENTA EN LA BASE DE DATOS
    const usuario = await this.prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'No fue posible verificar las credenciales actuales.'
      );
    }

    // VERIFICAR CONTRASEÑA ACTUAL
    const contrasenaCorrecta = await bcrypt.compare(
      currentPassword,
      usuario.password
    );

    if (!contrasenaCorrecta) {
      throw new UnauthorizedException(
        'No fue posible verificar las credenciales actuales.'
      );
    }

    // GENERAR HASH DE LA NUEVA CONTRASEÑA
    const nuevoHash = await bcrypt.hash(
      newPassword,
      10
    );

    // GUARDAR EN PRISMA
    await this.prisma.user.update({
      where: {
        id: usuario.id
      },
      data: {
        password: nuevoHash
      }
    });

    // RESPUESTA SIN DATOS SENSIBLES
    return {
      mensaje: 'Contraseña actualizada correctamente.'
    };
  }

  // ==========================================
  // ELIMINAR USUARIO
  // ==========================================

  async eliminarUsuario(id: string) {

    return this.prisma.user.delete({
      where: {
        id
      }
    });
  }
}
