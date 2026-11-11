import {
  Component,
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService,
  UsuarioAutenticado
} from '../../core/service/auth.service';

interface RespuestaLogin {
  mensaje: string;
  usuario: UsuarioAutenticado;
}

interface PerfilUsuario {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = 'http://localhost:3000/api/users/login';

  email = '';
  password = '';

  mensajeError = '';
  mensajeExito = '';

  cargando = false;
  completandoPerfil = false;

  private usuarioValidado: UsuarioAutenticado | null = null;

  perfil: PerfilUsuario = {
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: ''
  };

  private clavePerfil(correo: string): string {
    return 'kabnia_perfil_' + encodeURIComponent(correo.trim().toLowerCase());
  }

  private correoValido(correo: string): boolean {
    return correo.includes('@') && correo.trim().length > 3;
  }

  private leerPerfilLocal(correo: string): Partial<PerfilUsuario> | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const guardado = localStorage.getItem(this.clavePerfil(correo));
    if (!guardado) return null;

    try {
      const datos = JSON.parse(guardado);
      if (datos && typeof datos === 'object' && !Array.isArray(datos)) {
        return datos as Partial<PerfilUsuario>;
      }
    } catch (error) {
      console.error('Error al recuperar perfil:', error);
    }
    return null;
  }

  iniciarSesion(): void {
    if (this.cargando) return;

    this.mensajeError = '';
    this.mensajeExito = '';

    const correo = this.email.trim().toLowerCase();

    if (!this.correoValido(correo)) {
      this.mensajeError = 'Introduce un correo electrónico válido.';
      return;
    }

    if (!this.password.trim()) {
      this.mensajeError = 'Introduce tu contraseña.';
      return;
    }

    this.cargando = true;

    this.http.post<RespuestaLogin>(
      this.API_URL,
      {
        email: correo,
        password: this.password
      }
    ).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        const usuario = respuesta?.usuario;

        if (!usuario || !usuario.id || !usuario.email) {
          this.mensajeError = 'El servidor no devolvió los datos de la cuenta.';
          return;
        }

        this.usuarioValidado = usuario;

        if (usuario.role === 'ADMIN') {
          this.authService.login(usuario);
          this.password = '';
          this.router.navigateByUrl('/admin/tablas');
          return;
        }

        this.prepararPerfil(usuario);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al iniciar sesión:', error);
        this.mensajeError = error.error?.mensaje || error.error?.message || 'Correo o contraseña incorrectos.';
      }
    });
  }

  private prepararPerfil(usuario: UsuarioAutenticado): void {
    const correo = usuario.email.trim().toLowerCase();
    const datosLocales = this.leerPerfilLocal(correo);

    this.perfil = {
      nombre: datosLocales?.nombre?.trim() || usuario.name?.trim() || '',
      apellidos: datosLocales?.apellidos?.trim() || usuario.apellidos?.trim() || '',
      correo,
      telefono: datosLocales?.telefono?.trim() || usuario.telefono?.trim() || ''
    };

    this.password = '';

    if (this.perfilCompleto()) {
      this.finalizarInicioSesion();
      return;
    }

    this.completandoPerfil = true;
    this.mensajeExito = 'Inicio de sesión exitoso. Completa tu información personal.';
  }

  private perfilCompleto(): boolean {
    const nombre = this.perfil.nombre.trim();
    const apellidos = this.perfil.apellidos.trim();
    const telefono = this.perfil.telefono.replace(/\D/g, '');

    return (
      nombre.length >= 2 &&
      apellidos.length >= 2 &&
      this.correoValido(this.perfil.correo) &&
      /^\d{10}$/.test(telefono)
    );
  }

  private guardarPerfil(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    try {
      this.perfil = {
        nombre: this.perfil.nombre.trim(),
        apellidos: this.perfil.apellidos.trim(),
        correo: this.perfil.correo.trim().toLowerCase(),
        telefono: this.perfil.telefono.replace(/\D/g, '')
      };

      localStorage.setItem(this.clavePerfil(this.perfil.correo), JSON.stringify(this.perfil));
      return true;
    } catch (error) {
      console.error('Error al guardar información:', error);
      this.mensajeError = 'No se pudo guardar tu información personal.';
      return false;
    }
  }

  guardarYContinuar(): void {
    this.mensajeError = '';

    if (!this.perfilCompleto()) {
      this.mensajeError = 'Completa el nombre, apellidos y un teléfono válido de 10 dígitos.';
      return;
    }

    this.finalizarInicioSesion();
  }

  private finalizarInicioSesion(): void {
    if (!this.usuarioValidado) {
      this.mensajeError = 'No se encontró la información de la cuenta.';
      return;
    }

    if (!this.guardarPerfil()) return;

    this.authService.login(this.usuarioValidado);
    this.completandoPerfil = false;
    this.password = '';

    this.router.navigateByUrl('/miperfil').then((resultado) => {
      if (!resultado) {
        this.mensajeError = 'No se pudo abrir Mi Perfil.';
      }
    }).catch((error) => {
      console.error('Error de navegación:', error);
      this.mensajeError = 'Ocurrió un problema al abrir Mi Perfil.';
    });
  }
}