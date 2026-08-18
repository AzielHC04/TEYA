import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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


  // Aumenta una unidad
  aumentarCantidad(producto: ProductoCarrito): void {
    producto.cantidad++;
  }


  // Disminuye una unidad sin bajar de 1
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


  // Elimina todos los productos
  vaciarCarrito(): void {
    const confirmar = window.confirm(
      '¿Deseas eliminar todos los productos del carrito?'
    );

    if (confirmar) {
      this.carrito = [];
    }
  }


  // Acción temporal para la solicitud de cotización
  solicitarCotizacion(): void {

    const solicitud = {
      productos: this.carrito,
      totalUnidades: this.totalProductos
    };

    console.log('Solicitud de cotización:', solicitud);

    window.alert(
      'La solicitud está lista para continuar con el proceso de cotización.'
    );
  }
}