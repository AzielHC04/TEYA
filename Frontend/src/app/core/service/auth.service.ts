import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  // Señal reactiva que almacena el usuario actual (o null si no hay sesión)
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

  // Método para iniciar sesión (guarda token y usuario, y avisa a toda la app)
  login(token: string, usuario: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }
    this.usuarioActual.set(usuario); // Actualiza la señal al instante
  }

  // Método para cerrar sesión
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    this.usuarioActual.set(null); // Limpia la señal al instante
  }
}