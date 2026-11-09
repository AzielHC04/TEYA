
import {
  Injectable,
  signal,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  CartService
} from './cart.service';

export interface UsuarioAutenticado {
  id: string;
  name: string;
  email: string;
  role: string;
  apellidos?: string;
  telefono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private platformId = inject(PLATFORM_ID);
  private cartService = inject(CartService);

  // Estado reactivo de la cuenta actual.
  public usuarioActual = signal<UsuarioAutenticado | null>(
    this.obtenerUsuarioInicial()
  );

  // Recuperar usuario guardado.
  private obtenerUsuarioInicial(): UsuarioAutenticado | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const guardado = localStorage.getItem('usuario');

    if (!guardado) {
      return null;
    }

    try {
      const usuario = JSON.parse(guardado);

      if (
        usuario &&
        typeof usuario === 'object' &&
        !Array.isArray(usuario) &&
        usuario.id &&
        usuario.email
      ) {
        return usuario as UsuarioAutenticado;
      }

    } catch (error) {
      console.error(
        'Error al recuperar usuario:',
        error
      );
    }

    return null;
  }

  // Iniciar sesión con la respuesta REAL del backend.
  login(usuario: UsuarioAutenticado): void {

    if (isPlatformBrowser(this.platformId)) {

      localStorage.setItem(
        'usuario',
        JSON.stringify(usuario)
      );

      // Evitar utilizar tokens anteriores
      // que no pertenecen a esta autenticación.
      localStorage.removeItem('token');
    }

    // Actualización inmediata para el navbar.
    this.usuarioActual.set(usuario);
  }

  // Cerrar sesión.
  logout(): void {

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      localStorage.removeItem('direccion_kabnia');
    }

    this.usuarioActual.set(null);

    // Tu CartService actual utiliza un carrito local
    // compartido, así que lo limpiamos al salir para
    // que otra persona no vea esos productos.
    this.cartService.limpiarCarrito();
  }

  // Consultar estado local.
  estaLogueado(): boolean {
    return this.usuarioActual() !== null;
  }

  // Comprobar rol.
  esAdministrador(): boolean {
    return this.usuarioActual()?.role === 'ADMIN';
  }
}
