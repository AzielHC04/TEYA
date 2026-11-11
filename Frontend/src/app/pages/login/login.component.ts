
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

  private readonly API_URL =
    'http://localhost:3000/api/users/login';

  // DATOS DE ACCESO
  email = '';
  password = '';

  // MENSAJES
  mensajeError = '';
  mensajeExito = '';

  // ESTADOS
  cargando = false;
  completandoPerfil = false;

  private usuarioValidado: UsuarioAutenticado | null = null;

  // SOLO LETRAS, ACENTOS, Ñ Y ESPACIOS
  readonly patronNombre =
    '[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*';

  private readonly regexNombre =
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

  // PERFIL
  perfil: PerfilUsuario = {
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: ''
  };

  // ==========================================
  // CLAVE DE ALMACENAMIENTO
  // ==========================================

  private clavePerfil(correo: string): string {
    return 'kabnia_perfil_' +
      encodeURIComponent(correo.trim().toLowerCase());
  }

  // ==========================================
  // VALIDAR CORREO
  // ==========================================

  private correoValido(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      correo.trim()
    );
  }

  // ==========================================
  // FILTRAR NOMBRE Y APELLIDOS EN TIEMPO REAL
  // ==========================================

  filtrarCampoTexto(
    event: Event,
    campo: 'nombre' | 'apellidos'
  ): void {

    const input = event.target as HTMLInputElement;

    const valorOriginal = input.value;

    // Eliminar números y símbolos.
    const valorFiltrado = valorOriginal
      .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '')
      .replace(/ {2,}/g, ' ')
      .slice(0, campo === 'nombre' ? 60 : 100);

    // CORRECCIÓN PRINCIPAL:
    // Actualizar el valor visible del input.
    if (input.value !== valorFiltrado) {
      const posicion = input.selectionStart ??
        input.value.length;

      const antesCursor = valorOriginal.slice(0, posicion)
        .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '')
        .replace(/ {2,}/g, ' ');

      input.value = valorFiltrado;

      const nuevaPosicion = Math.min(
        antesCursor.length,
        valorFiltrado.length
      );

      input.setSelectionRange(
        nuevaPosicion,
        nuevaPosicion
      );
    }

    // Sincronizar el modelo de Angular.
    this.perfil[campo] = valorFiltrado;
  }

  // ==========================================
  // FILTRAR TELÉFONO
  // ==========================================

  filtrarTelefono(event: Event): void {

    const input = event.target as HTMLInputElement;

    const valorFiltrado = input.value
      .replace(/\D/g, '')
      .slice(0, 10);

    // Actualizar input visible.
    input.value = valorFiltrado;

    // Actualizar modelo.
    this.perfil.telefono = valorFiltrado;
  }

  // ==========================================
  // VALIDAR NOMBRE
  // ==========================================

  private nombreValido(valor: string): boolean {

    const texto = valor.trim();

    const letras = texto.replace(
      /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,
      ''
    );

    return (
      letras.length >= 2 &&
      this.regexNombre.test(texto)
    );
  }

  // ==========================================
  // LEER PERFIL GUARDADO
  // ==========================================

  private leerPerfilLocal(
    correo: string
  ): Partial<PerfilUsuario> | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const guardado = localStorage.getItem(
      this.clavePerfil(correo)
    );

    if (!guardado) {
      return null;
    }

    try {
      const datos = JSON.parse(guardado);

      if (
        datos &&
        typeof datos === 'object' &&
        !Array.isArray(datos)
      ) {
        return datos as Partial<PerfilUsuario>;
      }

    } catch (error) {
      console.error(
        'Error al recuperar perfil:',
        error
      );
    }

    return null;
  }

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  iniciarSesion(): void {

    if (this.cargando) {
      return;
    }

    this.mensajeError = '';
    this.mensajeExito = '';

    const correo = this.email.trim().toLowerCase();

    if (!this.correoValido(correo)) {
      this.mensajeError =
        'Introduce un correo electrónico válido.';
      return;
    }

    if (!this.password.trim()) {
      this.mensajeError =
        'Introduce tu contraseña.';
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

        if (
          !usuario ||
          !usuario.id ||
          !usuario.email
        ) {
          this.mensajeError =
            'El servidor no devolvió los datos de la cuenta.';
          return;
        }

        this.usuarioValidado = usuario;

        // ADMINISTRADORES
        if (usuario.role === 'ADMIN') {

          this.authService.login(usuario);

          this.password = '';

          this.router.navigateByUrl('/admin/tablas');
          return;
        }

        // CLIENTES
        this.prepararPerfil(usuario);
      },

      error: (error) => {

        this.cargando = false;

        console.error(
          'Error al iniciar sesión:',
          error
        );

        this.mensajeError =
          error.error?.mensaje ||
          error.error?.message ||
          'Correo o contraseña incorrectos.';
      }
    });
  }

  // ==========================================
  // PREPARAR PERFIL
  // ==========================================

  private prepararPerfil(
    usuario: UsuarioAutenticado
  ): void {

    const correo = usuario.email.trim().toLowerCase();

    const datosLocales = this.leerPerfilLocal(correo);

    this.perfil = {

      nombre:
        datosLocales?.nombre?.trim() ||
        usuario.name?.trim() ||
        '',

      apellidos:
        datosLocales?.apellidos?.trim() ||
        usuario.apellidos?.trim() ||
        '',

      correo,

      telefono:
        datosLocales?.telefono?.trim() ||
        usuario.telefono?.trim() ||
        ''
    };

    this.password = '';

    if (this.perfilCompleto()) {
      this.finalizarInicioSesion();
      return;
    }

    this.completandoPerfil = true;

    this.mensajeExito =
      'Inicio de sesión exitoso. ' +
      'Completa tu información personal.';
  }

  // ==========================================
  // COMPROBAR PERFIL COMPLETO
  // ==========================================

  private perfilCompleto(): boolean {

    const nombre = this.perfil.nombre.trim();
    const apellidos = this.perfil.apellidos.trim();
    const telefono = this.perfil.telefono.trim();

    return (
      this.nombreValido(nombre) &&
      nombre.length <= 60 &&
      this.nombreValido(apellidos) &&
      apellidos.length <= 100 &&
      this.correoValido(this.perfil.correo) &&
      /^\d{10}$/.test(telefono)
    );
  }

  // ==========================================
  // GUARDAR DATOS DEL PERFIL
  // ==========================================

  private guardarPerfil(): boolean {

    if (!isPlatformBrowser(this.platformId)) {
      this.mensajeError =
        'No se puede guardar el perfil en este entorno.';
      return false;
    }

    if (!this.perfilCompleto()) {
      this.mensajeError =
        'Corrige los datos personales antes de guardar.';
      return false;
    }

    try {

      const datos: PerfilUsuario = {
        nombre: this.perfil.nombre
          .trim()
          .replace(/ +/g, ' '),

        apellidos: this.perfil.apellidos
          .trim()
          .replace(/ +/g, ' '),

        correo: this.perfil.correo
          .trim()
          .toLowerCase(),

        telefono: this.perfil.telefono.trim()
      };

      localStorage.setItem(
        this.clavePerfil(datos.correo),
        JSON.stringify(datos)
      );

      this.perfil = datos;

      return true;

    } catch (error) {

      console.error(
        'Error al guardar perfil:',
        error
      );

      this.mensajeError =
        'No fue posible guardar los datos personales.';

      return false;
    }
  }

  // ==========================================
  // GUARDAR Y CONTINUAR
  // ==========================================

  guardarYContinuar(): void {

    this.mensajeError = '';

    this.perfil.nombre = this.perfil.nombre
      .trim()
      .replace(/ +/g, ' ');

    this.perfil.apellidos = this.perfil.apellidos
      .trim()
      .replace(/ +/g, ' ');

    if (!this.perfilCompleto()) {
      this.mensajeError =
        'El nombre y los apellidos deben contener ' +
        'solo letras y espacios. El teléfono debe ' +
        'tener exactamente 10 dígitos.';
      return;
    }

    this.finalizarInicioSesion();
  }

  // ==========================================
  // FINALIZAR INICIO DE SESIÓN
  // ==========================================

  private finalizarInicioSesion(): void {

    if (!this.usuarioValidado) {
      this.mensajeError =
        'No se encontraron los datos del usuario.';
      return;
    }

    if (!this.perfilCompleto()) {
      this.completandoPerfil = true;
      this.mensajeError =
        'Completa correctamente todos los datos.';
      return;
    }

    if (!this.guardarPerfil()) {
      return;
    }

    // Actualizar AuthService y navbar.
    this.authService.login(this.usuarioValidado);

    this.completandoPerfil = false;
    this.password = '';

    // Redirigir al perfil.
    this.router.navigateByUrl('/miperfil').then(
      (resultado) => {

        if (!resultado) {
          this.mensajeError =
            'No fue posible abrir Mi Perfil.';
        }
      }
    ).catch((error) => {
      console.error('Error de navegación:', error);
      this.mensajeError =
        'Ocurrió un problema al abrir Mi Perfil.';
    });
  }
}
