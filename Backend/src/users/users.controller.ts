
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param
} from '@nestjs/common';

import { UsersService } from './users.service';

import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto
} from './users.dto';

@Controller('api/users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService
  ) {}

  // OBTENER USUARIOS
  @Get()
  obtenerUsuarios() {
    return this.usersService.obtenerUsuarios();
  }

  // REGISTRAR USUARIO
  @Post('register')
  registrar(@Body() dto: RegisterDto) {
    return this.usersService.registrar(dto);
  }

  // INICIAR SESIÓN
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  // CAMBIAR CONTRASEÑA
  @Post('change-password')
  cambiarContrasena(
    @Body() dto: ChangePasswordDto
  ) {
    return this.usersService.cambiarContrasena(dto);
  }

  // ELIMINAR USUARIO
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.usersService.eliminarUsuario(id);
  }
}
