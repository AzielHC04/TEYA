import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './orders.dto';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async crearOrden(dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El carrito está vacío.');
    }

    // 1. Guardar la orden localmente en PostgreSQL
    const nuevaOrden = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        total: dto.total,
        status: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    let paymentUrl = '';

    const clipApiKey = process.env.CLIP_API_KEY || '84c4b73e-744d-42fe-9de9-0bfe5a5b8397';
    const clipApiSecret = process.env.CLIP_API_SECRET || '2ccb37d1-9c38-4e7b-b159-983a62402711';

    try {
      const authHeader = `Basic ${Buffer.from(`${clipApiKey}:${clipApiSecret}`).toString('base64')}`;

      // Petición a la API Checkout de Clip
      const response = await fetch('https://api.payclip.com/v2/checkout', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(dto.total),
          currency: 'MXN',
          purchase_description: `Pedido KABNIA #${nuevaOrden.id.slice(0, 8)}`,
          redirection_url: {
            success: 'http://localhost:4200/orders',
            error: 'http://localhost:4200/carrito'
          },
          metadata: {
            order_id: nuevaOrden.id,
            user_id: dto.userId
          }
        })
      });

      const responseText = await response.text();
      let data: any = {};

      try {
        data = JSON.parse(responseText);
        // Mapeo con payment_request_url
        paymentUrl = data?.payment_request_url || data?.payment_url || data?.url || data?.checkout_url || '';
      } catch (e) {
        console.log('Error parseando JSON de Clip');
      }

    } catch (error: any) {
      console.error('Error en la llamada HTTP a Clip:', error?.message);
    }

    return {
      mensaje: 'Orden creada exitosamente',
      orden: nuevaOrden,
      paymentUrl: paymentUrl
    };
  }

  async obtenerOrdenesPorUsuario(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Método para actualizar el estado del pedido tras recibir la confirmación de Clip
  async actualizarEstadoOrden(orderId: string, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    });
  }
}
