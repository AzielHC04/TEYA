import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. Verificamos estrictamente si estamos corriendo en el navegador
  if (isPlatformBrowser(platformId)) {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        // 2. Validamos si el rol es realmente ADMIN
        if (usuario && usuario.role === 'ADMIN') {
          return true; // Permitir el acceso a la ruta de admin
        }
      } catch (e) {
        console.error('Error al parsear el usuario del localStorage', e);
      }
    }
  }

  // Si no está en el navegador, no hay sesión o no es admin, redirigir al login
  router.navigate(['/login']);
  return false;
};