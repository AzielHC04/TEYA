import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TipoEnvio = 'estandar' | 'express';

interface ProductoCarrito {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  imagen: string;
  presentaciones: string[];
  presentacionSeleccionada: string;
  cantidad: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {

  // Tipo de envío seleccionado
  tipoEnvio: TipoEnvio = 'estandar';


  // Datos temporales del carrito
  carrito: ProductoCarrito[] = [
    {
      id: 1,
      nombre: 'BP-CALCIO',
      categoria: 'Orgánicos',
      descripcion:
        'Bioinsumo formulado para complementar las necesidades de calcio del cultivo.',
      imagen: 'assets/productos/bp-calcio.png',
      presentaciones: [
        '1 Litro',
        '5 Litros',
        '20 Litros'
      ],
      presentacionSeleccionada: '1 Litro',
      cantidad: 2
    },
    {
      id: 2,
      nombre: 'BP-MAGNESIO',
      categoria: 'Orgánicos',
      descripcion:
        'Solución biológica diseñada para complementar el aporte de magnesio en los cultivos.',
      imagen: 'assets/productos/bp-magnesio.png',
      presentaciones: [
        '1 Litro',
        '5 Litros',
        '20 Litros'
      ],
      presentacionSeleccionada: '5 Litros',
      cantidad: 1
    },
    {
      id: 3,
      nombre: 'BP-POTASIO',
      categoria: 'Orgánicos',
      descripcion:
        'Formulación orientada al aporte de potasio durante las diferentes etapas del cultivo.',
      imagen: 'assets/productos/bp-potasio.png',
      presentaciones: [
        '1 Litro',
        '5 Litros',
        '20 Litros'
      ],
      presentacionSeleccionada: '1 Litro',
      cantidad: 3
    }
  ];


  // Calcula el número total de unidades
  get totalProductos(): number {
    return this.carrito.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
  }


  // Aumenta la cantidad del producto
  aumentarCantidad(producto: ProductoCarrito): void {
    producto.cantidad++;
  }


  // Disminuye la cantidad sin bajar de una unidad
  disminuirCantidad(producto: ProductoCarrito): void {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }


  // Elimina un producto del carrito
  eliminarProducto(id: number): void {
    this.carrito = this.carrito.filter(
      producto => producto.id !== id
    );
  }


  // Vacía todos los productos del carrito
  vaciarCarrito(): void {
    const confirmar = window.confirm(
      '¿Deseas eliminar todos los productos del carrito?'
    );

    if (confirmar) {
      this.carrito = [];
    }
  }


  // Cambia el método de envío
  seleccionarEnvio(tipo: TipoEnvio): void {
    this.tipoEnvio = tipo;
  }


  // Obtiene el tiempo estimado según el tipo de envío
  get tiempoEstimadoEnvio(): string {
    if (this.tipoEnvio === 'express') {
      return '1 a 2 días hábiles';
    }

    return '1 a 5 días hábiles';
  }


  // Acción temporal para continuar con la compra
  continuarCompra(): void {

    const pedido = {
      productos: this.carrito,
      totalUnidades: this.totalProductos,
      tipoEnvio: this.tipoEnvio,
      tiempoEstimado: this.tiempoEstimadoEnvio
    };

    console.log('Pedido:', pedido);

    window.alert(
      `Método seleccionado: ${
        this.tipoEnvio === 'express'
          ? 'Envío exprés'
          : 'Envío estándar'
      }\nTiempo estimado: ${this.tiempoEstimadoEnvio}`
    );
  }

}