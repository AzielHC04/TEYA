import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/service/product.service';
import { CartService } from '../../../core/service/cart.service';
import { NotificationService } from '../../../core/service/notification.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) producto!: Product;

  private cartService = inject(CartService);
  private notificacion = inject(NotificationService);

  obtenerClaseCategoria(categoria: string): string {
    if (!categoria) return 'cat-default';
    
    const cat = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (cat.includes('microorganismo')) return 'cat-microorganismos';
    if (cat.includes('fungicida')) return 'cat-fungicidas';
    if (cat.includes('insecticida')) return 'cat-insecticidas';
    if (cat.includes('adherente')) return 'cat-adherentes';
    if (cat.includes('antiestresante')) return 'cat-antiestresantes';

    return 'cat-default';
  }

  agregarAlCarrito(): void {
    if (!this.producto) return;

    if (this.producto.stock !== undefined && this.producto.stock <= 0) {
      this.notificacion.mostrarError(
        'Producto agotado',
        'Lo sentimos, este producto no tiene existencias por el momento.'
      );
      return;
    }

    const resultado = this.cartService.agregarProducto(this.producto, 1);
    if (!resultado.exito) {
      this.notificacion.mostrarError('No se pudo agregar', resultado.mensaje);
    } else {
      this.notificacion.mostrarExito(
        '¡Agregado al carrito!',
        `"${this.producto.nombre}" se añadió correctamente a tu carrito.`
      );
    }
  }
}