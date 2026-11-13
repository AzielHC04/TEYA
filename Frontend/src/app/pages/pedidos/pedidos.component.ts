import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  pedidos: any[] = [];
  cargando: boolean = true;
  mensajeError: string = '';

  ngOnInit(): void {
    this.cargarHistorialPedidos();
  }

  cargarHistorialPedidos(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.cargando = false;
      return;
    }

    // 1. Obtener el usuario logueado desde el localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    let userId = '';

    if (usuarioGuardado) {
      try {
        const sesion = JSON.parse(usuarioGuardado);
        // Extraer el ID soportando distintos formatos posibles de tu login
        const datos = (sesion.usuario && typeof sesion.usuario === 'object')
          ? sesion.usuario
          : (sesion.user && typeof sesion.user === 'object')
            ? sesion.user
            : sesion;

        userId = datos.id || sesion.id || '';
      } catch (e) {
        console.error('Error al leer el usuario:', e);
      }
    }

    if (!userId) {
      this.cargando = false;
      this.mensajeError = 'Debes iniciar sesión para ver tus pedidos.';
      this.router.navigate(['/login']);
      return;
    }

    // 2. Consumir el endpoint de NestJS
    this.http.get<any[]>(`https://teya-d5iz.onrender.com/api/orders/user/${userId}`).subscribe({
      next: (data) => {
        this.pedidos = data || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener los pedidos:', err);
        this.mensajeError = 'No se pudo cargar tu historial de pedidos.';
        this.cargando = false;
      }
    });
  }

  // Traducir estados técnicos a texto amigable para el cliente
  obtenerTextoEstado(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'PENDIENTE':
        return 'Pendiente de pago';
      case 'PAID':
      case 'PAGADO':
        return 'Pagado / En proceso';
      case 'SHIPPED':
      case 'ENVIADO':
        return 'En camino';
      case 'DELIVERED':
      case 'ENTREGADO':
        return 'Entregado';
      default:
        return status || 'Procesando';
    }
  }
}