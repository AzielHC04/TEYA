import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private cartService = inject(CartService);

  // Señal reactiva que almacena el usuario actual
  public usuarioActual = signal<any>(this.obtenerUsuarioInicial());

  private obtenerUsuarioInicial() {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado && usuarioGuardado !== 'undefined' && usuarioGuardado !== 'null') {
        try {
          return JSON.parse(usuarioGuardado);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  // Método para iniciar sesión
  login(token: string, usuario: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }
    this.usuarioActual.set(usuario); // Actualiza la señal (Navbar se entera)

    // 🛒 CARGAMOS EL CARRITO ESPECÍFICO DE ESTE USUARIO
    this.cartService.recargarCarritoUsuario();
  }

  // Método para cerrar sesión
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    this.usuarioActual.set(null); // Limpia la señal del usuario
    
    // Limpiamos la vista del carrito actual, pero SUS DATOS SIGUEN GUARDADOS en su llave de localStorage
    this.cartService.limpiarCarrito();
  }
}