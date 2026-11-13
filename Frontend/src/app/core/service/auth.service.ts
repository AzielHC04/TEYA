import {
  Injectable,
  signal,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';

export interface UsuarioAutenticado {
  id: string;
  name: string;
  email: string;
  role: string;
  apellidos?: string;
  telefono?: string;
  fotoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private platformId = inject(PLATFORM_ID);
  private cartService = inject(CartService);

  public usuarioActual = signal<UsuarioAutenticado | null>(
    this.obtenerUsuarioInicial()
  );

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
        return this.combinarConPerfilLocal(usuario as UsuarioAutenticado);
      }
    } catch (error) {
      console.error('Error al recuperar usuario:', error);
    }

    return null;
  }

  // Combina los datos de sesión con la foto/perfil guardado localmente para ese correo
  private combinarConPerfilLocal(usuario: UsuarioAutenticado): UsuarioAutenticado {
    if (!isPlatformBrowser(this.platformId) || !usuario.email) {
      return usuario;
    }

    try {
      const clavePerfil = 'kabnia_perfil_' + encodeURIComponent(usuario.email.toLowerCase().trim());
      const perfilGuardadoRaw = localStorage.getItem(clavePerfil);

      if (perfilGuardadoRaw) {
        const perfilGuardado = JSON.parse(perfilGuardadoRaw);
        return {
          ...usuario,
          fotoUrl: perfilGuardado.fotoUrl || usuario.fotoUrl || '',
          telefono: perfilGuardado.telefono || usuario.telefono
        };
      }
    } catch {
      // Si falla la lectura, devolvemos el usuario intacto
    }

    return usuario;
  }

  // Iniciar sesión con la respuesta REAL del backend.
  login(usuario: UsuarioAutenticado): void {
    const usuarioCompleto = this.combinarConPerfilLocal(usuario);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      localStorage.removeItem('token');
    }

    this.usuarioActual.set(usuarioCompleto);
  }

  // Actualizar datos del usuario en sesión
  actualizarUsuario(datosParciales: Partial<UsuarioAutenticado>): void {
    const actual = this.usuarioActual();
    if (!actual) return;

    const actualizado: UsuarioAutenticado = {
      ...actual,
      ...datosParciales
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuario', JSON.stringify(actualizado));
    }

    this.usuarioActual.set(actualizado);
  }

  // Cerrar sesión (no borra kabnia_perfil_<correo> para que tu foto siga ahí al volver)
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      localStorage.removeItem('direccion_kabnia');
    }

    this.usuarioActual.set(null);
    this.cartService.limpiarCarrito();
  }

  estaLogueado(): boolean {
    return this.usuarioActual() !== null;
  }

  esAdministrador(): boolean {
    return this.usuarioActual()?.role === 'ADMIN';
  }
}