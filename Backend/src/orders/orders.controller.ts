import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  crear(@Body() dto: CreateOrderDto) {
    return this.ordersService.crearOrden(dto);
  }

  // Nuevo: Obtener todos los pedidos (para el panel de administrador)
  @Get()
  obtenerTodas() {
    return this.ordersService.obtenerTodasLasOrdenes();
  }

  @Get('user/:userId')
  obtenerPorUsuario(@Param('userId') userId: string) {
    return this.ordersService.obtenerOrdenesPorUsuario(userId);
  }

  // Nuevo: Actualizar el estado del pedido desde el panel de administrador
  @Patch(':id/status')
  actualizarEstado(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.actualizarEstadoOrden(id, status);
  }

  @Post('webhook/clip')
  async webhookClip(@Body() payload: any) {
    console.log('--- WEBHOOK DE CLIP RECIBIDO ---', payload);

    const status = payload?.status || payload?.event;
    const orderId = payload?.metadata?.order_id;

    if ((status === 'PAID' || status === 'CHECKOUT_PAID' || status === 'payment.paid') && orderId) {
      await this.ordersService.actualizarEstadoOrden(orderId, 'PAID');
      console.log(`Orden #${orderId} actualizada a PAID exitosamente.`);
    }

    return { received: true };
  }
}