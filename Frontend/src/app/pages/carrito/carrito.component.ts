import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  private router = inject(Router);

  carrito: any[] = [];
  total: number = 0;

  ngOnInit(): void {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    // Obtenemos los productos guardados en localStorage
    const carritoGuardado = localStorage.getItem('carrito_kabnia');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
      this.calcularTotal();
    }
  }

  eliminarItem(index: number): void {
    this.carrito.splice(index, 1);
    localStorage.setItem('carrito_kabnia', JSON.stringify(this.carrito));
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.total = this.carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
  }

  // 🔐 AQUÍ ESTÁ LA MAGIA DEL FLUJO QUE MENCIONASTE:
  procederAlPago(): void {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      // Si el cliente (ej. Víctor) no ha iniciado sesión ni se ha registrado:
      alert('¡Hola! Para continuar con tu compra y procesar el pago, por favor inicia sesión o regístrate.');
      this.router.navigate(['/login']);
    } else {
      // Si ya tiene cuenta y sesión activa, lo dejamos avanzar al pago
      this.router.navigate(['/checkout']); // O la ruta de tu pasarela de pago
    }
  }
}