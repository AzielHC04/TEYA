import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto, LoginDto } from './users.dto';

@Controller('api/users') // <--- Aquí va 'api/users' porque main.ts no tiene prefijo global
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  obtenerUsuarios() {
    return this.usersService.obtenerUsuarios();
  }

  @Post('register')
  registrar(@Body() dto: RegisterDto) {
    return this.usersService.registrar(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.usersService.eliminarUsuario(id);
  }
}