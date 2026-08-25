import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export type TipoEnvio = 'estandar' | 'express';

export interface ProductoCarrito {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  imagen: string;
  presentaciones: string[];
  presentacionSeleccionada: string;
  precioUnitario: number;
  cantidad: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarritoComponent {

  readonly COSTO_ENVIO_ESTANDAR = 150;
  readonly COSTO_ENVIO_EXPRESS = 300;
  readonly MAX_CANTIDAD_PRODUCTO = 99;

  tipoEnvio: TipoEnvio = 'estandar';

  carrito: ProductoCarrito[] = [
    {
      id: 1,
      nombre: 'BP-CALCIO',
      categoria: 'Orgánicos',
      descripcion: 'Bioinsumo formulado para complementar las necesidades de calcio del cultivo.',
      imagen: 'assets/Producto.jpg',
      presentaciones: ['1 Litro', '5 Litros', '20 Litros'],
      presentacionSeleccionada: '1 Litro',
      precioUnitario: 450,
      cantidad: 2
    },
    {
      id: 2,
      nombre: 'BP-MAGNESIO',
      categoria: 'Orgánicos',
      descripcion: 'Solución biológica diseñada para complementar el aporte de magnesio en los cultivos.',
      imagen: 'assets/Producto.jpg',
      presentaciones: ['1 Litro', '5 Litros', '20 Litros'],
      presentacionSeleccionada: '5 Litros',
      precioUnitario: 1200,
      cantidad: 1
    },
    {
      id: 3,
      nombre: 'BP-POTASIO',
      categoria: 'Orgánicos',
      descripcion: 'Formulación orientada al aporte de potasio durante las diferentes etapas del cultivo.',
      imagen: 'assets/Producto.jpg',
      presentaciones: ['1 Litro', '5 Litros', '20 Litros'],
      presentacionSeleccionada: '1 Litro',
      precioUnitario: 480,
      cantidad: 3
    }
  ];

  get totalProductos(): number {
    return this.carrito.reduce((total, producto) => total + producto.cantidad, 0);
  }

  get subtotal(): number {
    return this.carrito.reduce(
      (acc, prod) => acc + prod.precioUnitario * prod.cantidad, 
      0
    );
  }

  get costoEnvio(): number {
    if (this.carrito.length === 0) return 0;
    return this.tipoEnvio === 'express' 
      ? this.COSTO_ENVIO_EXPRESS 
      : this.COSTO_ENVIO_ESTANDAR;
  }

  get totalPagar(): number {
    return this.subtotal + this.costoEnvio;
  }

  get tiempoEstimadoEnvio(): string {
    return this.tipoEnvio === 'express' 
      ? '1 a 2 días hábiles' 
      : '1 a 5 días hábiles';
  }

  aumentarCantidad(producto: ProductoCarrito): void {
    if (producto.cantidad < this.MAX_CANTIDAD_PRODUCTO) {
      producto.cantidad++;
    }
  }

  disminuirCantidad(producto: ProductoCarrito): void {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  eliminarProducto(id: number): void {
    this.carrito = this.carrito.filter(producto => producto.id !== id);
  }

  vaciarCarrito(): void {
    if (this.carrito.length === 0) return;

    const confirmar = window.confirm('¿Deseas eliminar todos los productos del carrito?');
    if (confirmar) {
      this.carrito = [];
    }
  }

  seleccionarEnvio(tipo: TipoEnvio): void {
    this.tipoEnvio = tipo;
  }

  continuarCompra(): void {
    if (this.carrito.length === 0) {
      window.alert('El carrito está vacío.');
      return;
    }

    const pedido = {
      productos: this.carrito,
      totalUnidades: this.totalProductos,
      subtotal: this.subtotal,
      costoEnvio: this.costoEnvio,
      totalPagar: this.totalPagar,
      tipoEnvio: this.tipoEnvio,
      tiempoEstimado: this.tiempoEstimadoEnvio
    };

    console.log('Pedido listo para procesar:', pedido);

    window.alert(
      `Resumen de Compra:\n` +
      `- Total productos: ${this.totalProductos}\n` +
      `- Envío: ${this.tipoEnvio === 'express' ? 'Exprés' : 'Estándar'} ($${this.costoEnvio})\n` +
      `- Total a pagar: $${this.totalPagar.toLocaleString('es-MX')}`
    );
  }
}