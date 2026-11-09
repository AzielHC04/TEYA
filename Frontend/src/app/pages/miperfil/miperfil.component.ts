
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

import {
  Router,
  RouterModule
} from '@angular/router';

interface UsuarioPerfil {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
}

interface DireccionPerfil {
  calle: string;
  numero: string;
  interior: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  referencias: string;
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

  private correoCuenta = '';

  usuario: UsuarioPerfil = this.usuarioVacio();
  direccion: DireccionPerfil = this.direccionVacia();

  estadisticas: EstadisticasPerfil = {
    pedidos: 0,
    productos: 0,
    clienteDesde: 'No disponible'
  };

  editandoPerfil = false;
  editandoDireccion = false;

  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  private respaldoUsuario: UsuarioPerfil = this.usuarioVacio();
  private respaldoDireccion: DireccionPerfil = this.direccionVacia();

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // OBJETOS INICIALES

  private usuarioVacio(): UsuarioPerfil {
    return {
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: ''
    };
  }

  private direccionVacia(): DireccionPerfil {
    return {
      calle: '',
      numero: '',
      interior: '',
      colonia: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
      referencias: ''
    };
  }

  // CONVERSIÓN SEGURA DE VALORES

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
    if (!valor) {
      return null;
    }

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
      console.error(
        'No se pudieron leer los datos guardados:',
        error
      );
    }

    return null;
  }

  // CLAVES DE ALMACENAMIENTO POR USUARIO

  private clavePerfil(): string {
    return 'kabnia_perfil_' +
      encodeURIComponent(this.correoCuenta);
  }

  private claveDireccion(): string {
    return 'kabnia_direccion_' +
      encodeURIComponent(this.correoCuenta);
  }

  // RECUPERAR USUARIO QUE INICIÓ SESIÓN

  cargarPerfil(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const sesion = this.leerObjeto(
      localStorage.getItem('usuario')
    );

    if (!sesion) {
      this.router.navigate(['/login']);
      return;
    }

    // Admite distintos formatos frecuentes de login.
    const datos = (
      sesion.usuario &&
      typeof sesion.usuario === 'object'
    )
      ? sesion.usuario
      : (
          sesion.user &&
          typeof sesion.user === 'object'
        )
          ? sesion.user
          : sesion;

    const correo = this.texto(
      datos.correo ||
      datos.email ||
      sesion.correo ||
      sesion.email
    ).toLowerCase();

    // Es necesario un identificador de cuenta.
    if (!correo) {
      this.usuario = this.usuarioVacio();

      this.mostrarMensaje(
        'La sesión no contiene un correo electrónico. ' +
        'Revisa los datos que guarda tu login.',
        'error'
      );

      return;
    }

    this.correoCuenta = correo;

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

    // Datos reales proporcionados por la sesión.
    this.usuario = {
      nombre: nombreSesion ||
        (nombreCompleto ? partesNombre[0] : ''),

      apellidos: apellidosSesion ||
        (
          nombreCompleto
            ? partesNombre.slice(1).join(' ')
            : ''
        ),

      correo: correo,

      telefono: this.texto(
        datos.telefono ||
        datos.phone ||
        datos.celular ||
        ''
      )
    };

    // Recuperar cambios locales del mismo usuario.
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

    this.cargarDireccion();
    this.cargarEstadisticas(datos);
  }

  // RECUPERAR DIRECCIÓN

  cargarDireccion(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.correoCuenta
    ) {
      return;
    }

    let datos = this.leerObjeto(
      localStorage.getItem(this.claveDireccion())
    );

    // Compatibilidad con dirección del carrito.
    if (!datos) {
      const direccionCarrito = this.leerObjeto(
        localStorage.getItem('direccion_kabnia')
      );

      const correoDireccion = this.texto(
        direccionCarrito?.correo
      ).toLowerCase();

      // Nunca cargar la dirección de otro correo.
      if (correoDireccion === this.correoCuenta) {
        datos = direccionCarrito;
      }
    }

    if (!datos) {
      this.direccion = this.direccionVacia();
      return;
    }

    this.direccion = {
      calle: this.texto(datos.calle),
      numero: this.texto(datos.numero),
      interior: this.texto(datos.interior),
      colonia: this.texto(datos.colonia),
      ciudad: this.texto(datos.ciudad),
      estado: this.texto(datos.estado),
      codigoPostal: this.texto(datos.codigoPostal),
      referencias: this.texto(datos.referencias)
    };

    this.respaldoDireccion = { ...this.direccion };
  }

  // ESTADÍSTICAS DISPONIBLES EN SESIÓN

  private cargarEstadisticas(datos: any): void {
    const actividad = datos.estadisticas || {};

    const pedidos = Number(
      actividad.pedidos ?? datos.totalPedidos
    );

    const productos = Number(
      actividad.productos ?? datos.totalProductos
    );

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
        datos.clienteDesde ??
        actividad.clienteDesde
      );

      if (Number.isInteger(anio) && anio >= 2000) {
        clienteDesde = anio;
      }
    }

    this.estadisticas = {
      pedidos: Number.isFinite(pedidos) && pedidos >= 0
        ? pedidos
        : 0,

      productos: Number.isFinite(productos) && productos >= 0
        ? productos
        : 0,

      clienteDesde
    };
  }

  // EDITAR INFORMACIÓN PERSONAL

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
    ) {
      return;
    }

    const nombre = this.usuario.nombre.trim();
    const apellidos = this.usuario.apellidos.trim();
    const telefono = this.usuario.telefono
      .replace(/\D/g, '');

    if (nombre.length < 2) {
      this.mostrarMensaje(
        'Introduce un nombre válido.',
        'error'
      );
      return;
    }

    if (apellidos.length < 2) {
      this.mostrarMensaje(
        'Introduce tus apellidos.',
        'error'
      );
      return;
    }

    if (telefono && !/^\d{10}$/.test(telefono)) {
      this.mostrarMensaje(
        'El teléfono debe tener 10 dígitos.',
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

    // Almacenar únicamente datos de presentación.
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

  // EDITAR DIRECCIÓN

  editarDireccion(): void {
    this.respaldoDireccion = { ...this.direccion };
    this.editandoDireccion = true;
    this.mensaje = '';
  }

  cancelarDireccion(): void {
    this.direccion = { ...this.respaldoDireccion };
    this.editandoDireccion = false;
  }

  guardarDireccion(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.correoCuenta
    ) {
      return;
    }

    const direccion: DireccionPerfil = {
      calle: this.direccion.calle.trim(),
      numero: this.direccion.numero.trim(),
      interior: this.direccion.interior.trim(),
      colonia: this.direccion.colonia.trim(),
      ciudad: this.direccion.ciudad.trim(),
      estado: this.direccion.estado.trim(),
      codigoPostal: this.direccion.codigoPostal.trim(),
      referencias: this.direccion.referencias.trim()
    };

    if (
      !direccion.calle ||
      !direccion.numero ||
      !direccion.colonia ||
      !direccion.ciudad ||
      !direccion.estado
    ) {
      this.mostrarMensaje(
        'Completa todos los campos obligatorios ' +
        'de la dirección.',
        'error'
      );
      return;
    }

    if (!/^\d{5}$/.test(direccion.codigoPostal)) {
      this.mostrarMensaje(
        'El código postal debe tener 5 dígitos.',
        'error'
      );
      return;
    }

    this.direccion = direccion;

    // Dirección exclusiva del perfil actual.
    localStorage.setItem(
      this.claveDireccion(),
      JSON.stringify(direccion)
    );

    // Mantener compatibilidad con el carrito actual.
    localStorage.setItem(
      'direccion_kabnia',
      JSON.stringify({
        ...direccion,
        nombre: this.nombreCompleto,
        telefono: this.usuario.telefono,
        correo: this.correoCuenta
      })
    );

    this.respaldoDireccion = { ...direccion };
    this.editandoDireccion = false;

    this.mostrarMensaje(
      'Dirección principal guardada correctamente.',
      'exito'
    );
  }

  // CERRAR SESIÓN

  cerrarSesion(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const confirmar = window.confirm(
      '¿Deseas cerrar tu sesión de KABNIA?'
    );

    if (!confirmar) {
      return;
    }

    localStorage.removeItem('usuario');

    // Evita dejar visible una dirección del usuario
    // anterior en el formulario general del carrito.
    localStorage.removeItem('direccion_kabnia');

    // Los perfiles guardados por cuenta permanecen
    // disponibles para un siguiente inicio de sesión.
    this.usuario = this.usuarioVacio();
    this.direccion = this.direccionVacia();
    this.correoCuenta = '';

    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  // CAMBIAR CONTRASEÑA

  cambiarContrasena(): void {
    this.mostrarMensaje(
      'Para cambiar tu contraseña es necesario ' +
      'conectar esta función con el sistema de autenticación.',
      'error'
    );
  }

  // MENSAJES

  private mostrarMensaje(
    texto: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }

  // NOMBRE COMPLETO

  get nombreCompleto(): string {
    const nombre = [
      this.usuario.nombre,
      this.usuario.apellidos
    ].filter(Boolean).join(' ');

    return nombre || 'Usuario KABNIA';
  }

  // INICIALES

  get iniciales(): string {
    const nombre = this.usuario.nombre.charAt(0);
    const apellido = this.usuario.apellidos.charAt(0);

    const resultado = (nombre + apellido).toUpperCase();

    return resultado || 'K';
  }

  // DIRECCIÓN DISPONIBLE

  get tieneDireccion(): boolean {
    return !!(
      this.direccion.calle &&
      this.direccion.colonia &&
      this.direccion.ciudad
    );
  }
}
