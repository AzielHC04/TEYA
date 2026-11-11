import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './addresses.dto';

@Controller('api/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  crear(@Body() dto: CreateAddressDto) {
    return this.addressesService.crearDireccion(dto);
  }

  @Get('user/:userId')
  obtenerTodas(@Param('userId') userId: string) {
    return this.addressesService.obtenerDireccionesPorUsuario(userId);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.actualizarDireccion(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.addressesService.eliminarDireccion(id);
  }
}