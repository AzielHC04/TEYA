
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

import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/service/auth.service';

interface UsuarioPerfil {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
}

interface DireccionBackend {
  id: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  esPrincipal: boolean;
}

interface EstadisticasPerfil {
  pedidos: number;
  productos: number;
  clienteDesde: number | string;
}

@Component({
  selector: 'app-miperfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './miperfil.component.html',
  styleUrl: './miperfil.component.css'
})
export class MiperfilComponent implements OnInit {

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private correoCuenta = '';
  private userId = '';

  seccionActiva = 'informacion-personal';

  usuario: UsuarioPerfil = this.usuarioVacio();

  direcciones: DireccionBackend[] = [];
  direccionEditando: DireccionBackend | null = null;
  editandoDireccion = false;

  estadisticas: EstadisticasPerfil = {
    pedidos: 0,
    productos: 0,
    clienteDesde: 'No disponible'
  };

  editandoPerfil = false;

  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  private respaldoUsuario: UsuarioPerfil =
    this.usuarioVacio();

  // DATOS DE SEGURIDAD
  contrasenaActual = '';
  nuevaContrasena = '';
  confirmarContrasena = '';

  mostrarActual = false;
  mostrarNueva = false;
  mostrarConfirmacion = false;

  mensajeSeguridad = '';

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // NAVEGACIÓN
  irASeccion(
    seccion: 'informacion-personal' |
      'direcciones' |
      'seguridad'
  ): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.seccionActiva = seccion;

    document.getElementById(seccion)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // UTILIDADES
  private usuarioVacio(): UsuarioPerfil {
    return {
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: ''
    };
  }

  private texto(valor: unknown): string {
    if (typeof valor === 'string') {
      return valor.trim();
    }

    if (typeof valor === 'number') {
      return String(valor);
    }

    return '';
  }

  private leerObjeto(valor: string | null): any | null {
    if (!valor) return null;

    try {
      const datos = JSON.parse(valor);

      if (
        datos &&
        typeof datos === 'object' &&
        !Array.isArray(datos)
      ) {
        return datos;
      }
    } catch (error) {
      console.error('Error al leer datos:', error);
    }

    return null;
  }

  private clavePerfil(): string {
    return 'kabnia_perfil_' +
      encodeURIComponent(this.correoCuenta);
  }

  // CARGAR PERFIL
  cargarPerfil(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    const sesion = this.leerObjeto(
      localStorage.getItem('usuario')
    );

    if (!sesion) {
      this.router.navigate(['/login']);
      return;
    }

    const datos =
      sesion.usuario &&
      typeof sesion.usuario === 'object'
        ? sesion.usuario
        : sesion.user &&
          typeof sesion.user === 'object'
          ? sesion.user
          : sesion;

    const correo = this.texto(
      datos.correo ||
      datos.email ||
      sesion.correo ||
      sesion.email
    ).toLowerCase();

    const idUser = this.texto(
      datos.id || sesion.id
    );

    if (!correo) {
      this.usuario = this.usuarioVacio();

      this.mostrarMensaje(
        'La sesión no contiene un correo electrónico.',
        'error'
      );
      return;
    }

    this.correoCuenta = correo;
    this.userId = idUser;

    const nombreCompleto = this.texto(
      datos.nombreCompleto ||
      datos.name ||
      ''
    );

    const nombreSesion = this.texto(
      datos.nombre ||
      datos.nombres ||
      ''
    );

    const apellidosSesion = this.texto(
      datos.apellidos ||
      datos.apellido ||
      datos.lastName ||
      ''
    );

    const partesNombre = nombreCompleto.split(/\s+/);

    this.usuario = {
      nombre: nombreSesion ||
        (nombreCompleto ? partesNombre[0] : ''),

      apellidos: apellidosSesion ||
        (nombreCompleto
          ? partesNombre.slice(1).join(' ')
          : ''),

      correo,

      telefono: this.texto(
        datos.telefono ||
        datos.phone ||
        datos.celular ||
        ''
      )
    };

    const perfilGuardado = this.leerObjeto(
      localStorage.getItem(this.clavePerfil())
    );

    if (perfilGuardado) {
      this.usuario = {
        nombre: this.texto(
          perfilGuardado.nombre ?? this.usuario.nombre
        ),

        apellidos: this.texto(
          perfilGuardado.apellidos ?? this.usuario.apellidos
        ),

        correo: this.correoCuenta,

        telefono: this.texto(
          perfilGuardado.telefono ?? this.usuario.telefono
        )
      };
    }

    this.respaldoUsuario = { ...this.usuario };

    this.cargarDireccionesBackend();
    this.cargarEstadisticasYPedidos(datos);
  }

  // DIRECCIONES
  cargarDireccionesBackend(): void {

    if (
      !isPlatformBrowser(this.platformId) ||
      !this.userId
    ) return;

    this.http.get<DireccionBackend[]>(
      `http://localhost:3000/api/addresses/user/${this.userId}`
    ).subscribe({
      next: (direccionesDb) => {
        this.direcciones = Array.isArray(direccionesDb)
          ? direccionesDb
          : [];
      },
      error: (err) => {
        console.error('Error al cargar direcciones:', err);
        this.direcciones = [];
      }
    });
  }

  // ESTADÍSTICAS
  cargarEstadisticasYPedidos(datos: any): void {

    const fechaRegistro = this.texto(
      datos.fechaRegistro ||
      datos.createdAt ||
      datos.created_at ||
      ''
    );

    const fecha = fechaRegistro
      ? new Date(fechaRegistro)
      : null;

    let clienteDesde: number | string =
      'No disponible';

    if (fecha && !Number.isNaN(fecha.getTime())) {
      clienteDesde = fecha.getFullYear();
    } else {
      const anio = Number(
        datos.clienteDesde ||
        datos.estadisticas?.clienteDesde
      );

      if (Number.isInteger(anio) && anio >= 2000) {
        clienteDesde = anio;
      }
    }

    this.estadisticas.clienteDesde = clienteDesde;

    if (!this.userId) return;

    this.http.get<any[]>(
      `http://localhost:3000/api/orders/user/${this.userId}`
    ).subscribe({
      next: (pedidos) => {

        const lista = Array.isArray(pedidos)
          ? pedidos
          : [];

        let productos = 0;

        lista.forEach(pedido => {
          if (Array.isArray(pedido.items)) {
            pedido.items.forEach((item: any) => {
              productos += Number(item.quantity) || 0;
            });
          }
        });

        this.estadisticas = {
          pedidos: lista.length,
          productos,
          clienteDesde
        };
      },

      error: (err) => {
        console.error('Error al cargar pedidos:', err);
      }
    });
  }

  // EDITAR PERFIL
  editarPerfil(): void {
    this.respaldoUsuario = { ...this.usuario };
    this.editandoPerfil = true;
    this.mensaje = '';
  }

  cancelarPerfil(): void {
    this.usuario = { ...this.respaldoUsuario };
    this.editandoPerfil = false;
  }

  guardarPerfil(): void {

    if (
      !isPlatformBrowser(this.platformId) ||
      !this.correoCuenta
    ) return;

    const nombre = this.usuario.nombre
      .trim()
      .replace(/\s+/g, ' ');

    const apellidos = this.usuario.apellidos
      .trim()
      .replace(/\s+/g, ' ');

    const telefono = this.usuario.telefono.trim();

    const patronNombre =
      /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

    if (
      nombre.length < 2 ||
      !patronNombre.test(nombre)
    ) {
      this.mostrarMensaje(
        'El nombre debe contener solo letras y espacios.',
        'error'
      );
      return;
    }

    if (
      apellidos.length < 2 ||
      !patronNombre.test(apellidos)
    ) {
      this.mostrarMensaje(
        'Los apellidos deben contener solo letras y espacios.',
        'error'
      );
      return;
    }

    if (telefono && !/^\d{10}$/.test(telefono)) {
      this.mostrarMensaje(
        'El teléfono debe contener 10 dígitos.',
        'error'
      );
      return;
    }

    this.usuario = {
      nombre,
      apellidos,
      correo: this.correoCuenta,
      telefono
    };

    localStorage.setItem(
      this.clavePerfil(),
      JSON.stringify(this.usuario)
    );

    this.respaldoUsuario = { ...this.usuario };
    this.editandoPerfil = false;

    this.mostrarMensaje(
      'Datos personales guardados correctamente.',
      'exito'
    );
  }

  // EDITAR DIRECCIONES
  iniciarEdicionDireccion(dir: DireccionBackend): void {
    this.direccionEditando = { ...dir };
    this.editandoDireccion = true;
    this.mensaje = '';
    this.irASeccion('direcciones');
  }

  cancelarEdicionDireccion(): void {
    this.direccionEditando = null;
    this.editandoDireccion = false;
  }

  guardarDireccionEditada(): void {

    if (!this.direccionEditando?.id) return;

    const payload = {
      calle: this.direccionEditando.calle.trim(),
      colonia: this.direccionEditando.colonia.trim(),
      ciudad: this.direccionEditando.ciudad.trim(),
      estado: this.direccionEditando.estado.trim(),
      codigoPostal:
        this.direccionEditando.codigoPostal.trim()
    };

    if (
      !payload.calle ||
      !payload.colonia ||
      !payload.ciudad ||
      !payload.estado ||
      !payload.codigoPostal
    ) {
      this.mostrarMensaje(
        'Todos los campos de dirección son obligatorios.',
        'error'
      );
      return;
    }

    if (!/^\d{5}$/.test(payload.codigoPostal)) {
      this.mostrarMensaje(
        'El código postal debe tener 5 dígitos.',
        'error'
      );
      return;
    }

    const id = this.direccionEditando.id;

    this.http.put(
      `http://localhost:3000/api/addresses/${id}`,
      payload
    ).subscribe({
      next: () => {
        this.mostrarMensaje(
          'Dirección actualizada correctamente.',
          'exito'
        );

        this.direccionEditando = null;
        this.editandoDireccion = false;
        this.cargarDireccionesBackend();
      },

      error: (err) => {
        console.error('Error al actualizar dirección:', err);

        this.mostrarMensaje(
          'No se pudo actualizar la dirección.',
          'error'
        );
      }
    });
  }

  eliminarDireccion(id: string): void {

    if (!isPlatformBrowser(this.platformId)) return;

    if (!window.confirm(
      '¿Deseas eliminar esta dirección?'
    )) return;

    this.http.delete(
      `http://localhost:3000/api/addresses/${id}`
    ).subscribe({
      next: () => {
        this.mostrarMensaje(
          'Dirección eliminada correctamente.',
          'exito'
        );

        this.cargarDireccionesBackend();
      },
      error: (err) => {
        console.error('Error al eliminar dirección:', err);

        this.mostrarMensaje(
          'No se pudo eliminar la dirección.',
          'error'
        );
      }
    });
  }

  // ==========================================
  // EVALUACIÓN DE SEGURIDAD DE CONTRASEÑA
  // ==========================================

  private evaluarContrasena(): number {

    const clave = this.nuevaContrasena;

    if (!clave) {
      return 0;
    }

    let puntos = 0;

    // La longitud aumenta la seguridad estimada.
    if (clave.length >= 8) puntos += 1;
    if (clave.length >= 12) puntos += 1;
    if (clave.length >= 16) puntos += 1;

    // La variedad de caracteres aporta puntos,
    // pero no es obligatoria.
    let tipos = 0;

    if (/[a-záéíóúüñ]/.test(clave)) tipos++;
    if (/[A-ZÁÉÍÓÚÜÑ]/.test(clave)) tipos++;
    if (/[0-9]/.test(clave)) tipos++;
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(clave)) {
      tipos++;
    }

    if (tipos >= 2) puntos++;
    if (tipos >= 3) puntos++;

    // Penalizar contraseñas demasiado previsibles.
    const comun =
      /password|contraseña|123456|qwerty|admin|abcdef/i;

    if (
      comun.test(clave) ||
      /(.)\1{4,}/.test(clave)
    ) {
      puntos = Math.min(puntos, 1);
    }

    if (clave.length < 8) {
      return 1;
    }

    return Math.max(1, Math.min(5, puntos));
  }

  get nivelSeguridad(): string {

    if (!this.nuevaContrasena) {
      return 'Sin evaluar';
    }

    const niveles = [
      'Sin evaluar',
      'Muy débil',
      'Débil',
      'Aceptable',
      'Buena',
      'Muy segura'
    ];

    return niveles[this.evaluarContrasena()];
  }

  get fortalezaPorcentaje(): number {

    if (!this.nuevaContrasena) {
      return 0;
    }

    return this.evaluarContrasena() * 20;
  }

  get colorFortaleza(): string {

    const nivel = this.evaluarContrasena();

    switch (nivel) {
      case 1:
        return '#dc2626';

      case 2:
        return '#ea580c';

      case 3:
        return '#ca8a04';

      case 4:
        return '#65a30d';

      case 5:
        return '#15803d';

      default:
        return '#94a3b8';
    }
  }

  get sugerenciaSeguridad(): string {

    if (!this.nuevaContrasena) {
      return '';
    }

    if (this.nuevaContrasena.length < 8) {
      return 'Agrega más caracteres para alcanzar el mínimo.';
    }

    switch (this.evaluarContrasena()) {

      case 1:
        return 'Esta contraseña es fácil de adivinar. ' +
          'Prueba una frase más larga y menos previsible.';

      case 2:
        return 'Puedes mejorarla utilizando una ' +
          'contraseña más larga y original.';

      case 3:
        return 'Seguridad aceptable. Una contraseña ' +
          'más larga puede mejorarla.';

      case 4:
        return 'Buena combinación. Procura no ' +
          'utilizarla en otras cuentas.';

      case 5:
        return 'La contraseña tiene buenas características, ' +
          'aunque ninguna contraseña es invulnerable.';

      default:
        return '';
    }
  }

  // ==========================================
  // VALIDAR CAMBIO DE CONTRASEÑA
  // ==========================================

  get contrasenaLista(): boolean {

    return (
      this.contrasenaActual.length > 0 &&
      this.nuevaContrasena.length >= 8 &&
      this.nuevaContrasena !== this.contrasenaActual &&
      this.confirmarContrasena === this.nuevaContrasena
    );
  }

  // ==========================================
  // GUARDAR NUEVA CONTRASEÑA
  // ==========================================

  guardarNuevaContrasena(): void {

    this.mensajeSeguridad = '';

    if (!this.contrasenaLista) {
      this.mensajeSeguridad =
        'Comprueba que la nueva contraseña tenga ' +
        'al menos 8 caracteres, sea diferente ' +
        'de la actual y coincida con su confirmación.';
      return;
    }

    // PENDIENTE DE INTEGRACIÓN:
    // No se dispone del endpoint real para cambiar
    // contraseñas en el backend.
    // Nunca almacenar contraseñas en localStorage.

    this.mensajeSeguridad =
      'El formulario es válido, pero la contraseña ' +
      'no ha sido actualizada. Falta conectar esta ' +
      'operación con el backend de KABNIA.';

    this.cancelarCambioContrasena(false);
  }

  cancelarCambioContrasena(
    limpiarMensaje: boolean = true
  ): void {

    this.contrasenaActual = '';
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';

    this.mostrarActual = false;
    this.mostrarNueva = false;
    this.mostrarConfirmacion = false;

    if (limpiarMensaje) {
      this.mensajeSeguridad = '';
    }
  }

  cambiarContrasena(): void {
    this.irASeccion('seguridad');
  }

  // CERRAR SESIÓN
  cerrarSesion(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    if (!window.confirm(
      '¿Deseas cerrar tu sesión de KABNIA?'
    )) return;

    this.cancelarCambioContrasena();
    this.authService.logout();

    this.usuario = this.usuarioVacio();
    this.direcciones = [];
    this.userId = '';
    this.correoCuenta = '';

    this.router.navigate(['/login']);
  }

  private mostrarMensaje(
    texto: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }

  get nombreCompleto(): string {
    const nombre = [
      this.usuario.nombre,
      this.usuario.apellidos
    ].filter(Boolean).join(' ');

    return nombre || 'Usuario KABNIA';
  }

  get iniciales(): string {
    const resultado = (
      this.usuario.nombre.charAt(0) +
      this.usuario.apellidos.charAt(0)
    ).toUpperCase();

    return resultado || 'K';
  }

  get tieneDirecciones(): boolean {
    return this.direcciones.length > 0;
  }
}
