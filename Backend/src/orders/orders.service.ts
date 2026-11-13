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

    const clipApiKey = process.env.CLIP_API_KEY;
    const clipApiSecret = process.env.CLIP_API_SECRET;

    try {
      const authHeader = `Basic ${Buffer.from(`${clipApiKey}:${clipApiSecret}`).toString('base64')}`;

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
            success: 'https://kabnia.com/orders',
            error: 'https://kabnia.com/carrito'
          },
          webhook_url: 'https://teya-d5iz.onrender.com/api/orders/webhook/clip',
          metadata: {
            order_id: nuevaOrden.id,
            user_id: dto.userId
          }
        })
      });

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
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

  // Nuevo: Para el panel de administrador (trae cliente, dirección y productos)
  async obtenerTodasLasOrdenes() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            apellidos: true,
            email: true,
            telefono: true,
            direcciones: true,
          },
        },
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

  async actualizarEstadoOrden(orderId: string, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}