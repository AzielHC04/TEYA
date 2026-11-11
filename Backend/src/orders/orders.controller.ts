import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  crear(@Body() dto: CreateOrderDto) {
    return this.ordersService.crearOrden(dto);
  }

  @Get('user/:userId')
  obtenerPorUsuario(@Param('userId') userId: string) {
    return this.ordersService.obtenerOrdenesPorUsuario(userId);
  }

  @Post('webhook/clip')
  async webhookClip(@Body() payload: any) {
    console.log('--- WEBHOOK DE CLIP RECIBIDO ---', payload);

    // Clip suele enviar el status y la información del pago en su payload
    const status = payload?.status || payload?.event;
    const orderId = payload?.metadata?.order_id;

    if ((status === 'PAID' || status === 'CHECKOUT_PAID' || status === 'payment.paid') && orderId) {
      await this.ordersService.actualizarEstadoOrden(orderId, 'PAID');
      console.log(`Orden #${orderId} actualizada a PAID exitosamente.`);
    }

    return { received: true };
  }
}