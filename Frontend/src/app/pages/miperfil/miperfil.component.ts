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

import { HttpClient } from '@angular/common/http';

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

  private correoCuenta = '';
  private userId = '';

  usuario: UsuarioPerfil = this.usuarioVacio();
  
  direcciones: DireccionBackend[] = [];

  direccionEditando: any = null;
  editandoDireccion = false;

  estadisticas: EstadisticasPerfil = {
    pedidos: 0,
    productos: 0,
    clienteDesde: 'No disponible'
  };

  editandoPerfil = false;

  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  private respaldoUsuario: UsuarioPerfil = this.usuarioVacio();

  ngOnInit(): void {
    this.cargarPerfil();
  }

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
    if (!valor) {
      return null;
    }
    try {
      const datos = JSON.parse(valor);
      if (datos && typeof datos === 'object' && !Array.isArray(datos)) {
        return datos;
      }
    } catch (error) {
      console.error('No se pudieron leer los datos guardados:', error);
    }
    return null;
  }

  private clavePerfil(): string {
    return 'kabnia_perfil_' + encodeURIComponent(this.correoCuenta);
  }

  cargarPerfil(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const sesion = this.leerObjeto(localStorage.getItem('usuario'));

    if (!sesion) {
      this.router.navigate(['/login']);
      return;
    }

    const datos = (sesion.usuario && typeof sesion.usuario === 'object')
      ? sesion.usuario
      : (sesion.user && typeof sesion.user === 'object')
        ? sesion.user
        : sesion;

    const correo = this.texto(
      datos.correo || datos.email || sesion.correo || sesion.email
    ).toLowerCase();

    const idUser = this.texto(datos.id || sesion.id);

    if (!correo) {
      this.usuario = this.usuarioVacio();
      this.mostrarMensaje('La sesión no contiene un correo electrónico.', 'error');
      return;
    }

    this.correoCuenta = correo;
    this.userId = idUser;

    const nombreCompleto = this.texto(datos.nombreCompleto || datos.name || '');
    const nombreSesion = this.texto(datos.nombre || datos.nombres || '');
    const apellidosSesion = this.texto(datos.apellidos || datos.apellido || datos.lastName || '');
    const partesNombre = nombreCompleto.split(/\s+/);

    this.usuario = {
      nombre: nombreSesion || (nombreCompleto ? partesNombre[0] : ''),
      apellidos: apellidosSesion || (nombreCompleto ? partesNombre.slice(1).join(' ') : ''),
      correo: correo,
      telefono: this.texto(datos.telefono || datos.phone || datos.celular || '')
    };

    const perfilGuardado = this.leerObjeto(localStorage.getItem(this.clavePerfil()));
    if (perfilGuardado) {
      this.usuario = {
        nombre: this.texto(perfilGuardado.nombre ?? this.usuario.nombre),
        apellidos: this.texto(perfilGuardado.apellidos ?? this.usuario.apellidos),
        correo: this.correoCuenta,
        telefono: this.texto(perfilGuardado.telefono ?? this.usuario.telefono)
      };
    }

    this.respaldoUsuario = { ...this.usuario };

    this.cargarDireccionesBackend();
    this.cargarEstadisticasYPedidos(datos);
  }

  cargarDireccionesBackend(): void {
    if (!isPlatformBrowser(this.platformId) || !this.userId) {
      return;
    }

    this.http.get<DireccionBackend[]>(`http://localhost:3000/api/addresses/user/${this.userId}`).subscribe({
      next: (direccionesDb) => {
        this.direcciones = direccionesDb || [];
      },
      error: (err) => {
        console.error('Error al cargar direcciones desde el servidor:', err);
        this.direcciones = [];
      }
    });
  }

  // CONSULTAR PEDIDOS Y CALCULAR ESTADÍSTICAS REALES
  cargarEstadisticasYPedidos(datos: any): void {
    const fechaRegistro = this.texto(datos.fechaRegistro || datos.createdAt || datos.created_at || '');
    const fecha = fechaRegistro ? new Date(fechaRegistro) : null;

    let clienteDesde: number | string = 'No disponible';
    if (fecha && !Number.isNaN(fecha.getTime())) {
      clienteDesde = fecha.getFullYear();
    } else {
      const anio = Number(datos.clienteDesde || datos.estadisticas?.clienteDesde);
      if (Number.isInteger(anio) && anio >= 2000) {
        clienteDesde = anio;
      }
    }

    this.estadisticas.clienteDesde = clienteDesde;

    if (!this.userId) return;

    // Llamada al endpoint para calcular el total de pedidos y sumar las cantidades de productos
    this.http.get<any[]>(`http://localhost:3000/api/orders/user/${this.userId}`).subscribe({
      next: (pedidos) => {
        const totalPedidos = pedidos.length;
        
        let totalProductos = 0;
        pedidos.forEach(pedido => {
          if (pedido.items && Array.isArray(pedido.items)) {
            pedido.items.forEach((item: any) => {
              totalProductos += Number(item.quantity) || 0;
            });
          }
        });

        this.estadisticas = {
          pedidos: totalPedidos,
          productos: totalProductos,
          clienteDesde: clienteDesde
        };
      },
      error: (err) => {
        console.error('Error al calcular estadísticas de pedidos:', err);
      }
    });
  }

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
    if (!isPlatformBrowser(this.platformId) || !this.correoCuenta) {
      return;
    }

    const nombre = this.usuario.nombre.trim();
    const apellidos = this.usuario.apellidos.trim();
    const telefono = this.usuario.telefono.replace(/\D/g, '');

    if (nombre.length < 2) {
      this.mostrarMensaje('Introduce un nombre válido.', 'error');
      return;
    }

    if (apellidos.length < 2) {
      this.mostrarMensaje('Introduce tus apellidos.', 'error');
      return;
    }

    if (telefono && !/^\d{10}$/.test(telefono)) {
      this.mostrarMensaje('El teléfono debe tener 10 dígitos.', 'error');
      return;
    }

    this.usuario = {
      nombre,
      apellidos,
      correo: this.correoCuenta,
      telefono
    };

    localStorage.setItem(this.clavePerfil(), JSON.stringify(this.usuario));
    this.respaldoUsuario = { ...this.usuario };
    this.editandoPerfil = false;

    this.mostrarMensaje('Datos personales guardados correctamente.', 'exito');
  }

  iniciarEdicionDireccion(dir: DireccionBackend): void {
    this.direccionEditando = { ...dir };
    this.editandoDireccion = true;
    this.mensaje = '';
  }

  cancelarEdicionDireccion(): void {
    this.direccionEditando = null;
    this.editandoDireccion = false;
  }

  guardarDireccionEditada(): void {
    if (!this.direccionEditando || !this.direccionEditando.id) {
      return;
    }

    const payload = {
      calle: this.direccionEditando.calle.trim(),
      colonia: this.direccionEditando.colonia.trim(),
      ciudad: this.direccionEditando.ciudad.trim(),
      estado: this.direccionEditando.estado.trim(),
      codigoPostal: this.direccionEditando.codigoPostal.trim()
    };

    if (!payload.calle || !payload.colonia || !payload.ciudad || !payload.estado || !payload.codigoPostal) {
      this.mostrarMensaje('Todos los campos de la dirección son obligatorios.', 'error');
      return;
    }

    if (!/^\d{5}$/.test(payload.codigoPostal)) {
      this.mostrarMensaje('El código postal debe tener 5 dígitos.', 'error');
      return;
    }

    this.http.put(`http://localhost:3000/api/addresses/${this.direccionEditando.id}`, payload).subscribe({
      next: () => {
        this.mostrarMensaje('Dirección actualizada correctamente.', 'exito');
        this.editandoDireccion = false;
        this.direccionEditando = null;
        this.cargarDireccionesBackend();
      },
      error: (err) => {
        console.error('Error al actualizar dirección:', err);
        this.mostrarMensaje('No se pudo actualizar la dirección en el servidor.', 'error');
      }
    });
  }

  eliminarDireccion(id: string): void {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta dirección?');
    if (!confirmar) {
      return;
    }

    this.http.delete(`http://localhost:3000/api/addresses/${id}`).subscribe({
      next: () => {
        this.mostrarMensaje('Dirección eliminada correctamente.', 'exito');
        this.cargarDireccionesBackend();
      },
      error: (err) => {
        console.error('Error al eliminar dirección:', err);
        this.mostrarMensaje('No se pudo eliminar la dirección.', 'error');
      }
    });
  }

  cerrarSesion(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const confirmar = window.confirm('¿Deseas cerrar tu sesión de KABNIA?');
    if (!confirmar) {
      return;
    }

    localStorage.removeItem('usuario');
    localStorage.removeItem('direccion_kabnia');

    this.usuario = this.usuarioVacio();
    this.direcciones = [];
    this.correoCuenta = '';
    this.userId = '';

    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  cambiarContrasena(): void {
    this.mostrarMensaje('Para cambiar tu contraseña es necesario conectar esta función con el sistema de autenticación.', 'error');
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }

  get nombreCompleto(): string {
    const nombre = [this.usuario.nombre, this.usuario.apellidos].filter(Boolean).join(' ');
    return nombre || 'Usuario KABNIA';
  }

  get iniciales(): string {
    const nombre = this.usuario.nombre.charAt(0);
    const apellido = this.usuario.apellidos.charAt(0);
    const resultado = (nombre + apellido).toUpperCase();
    return resultado || 'K';
  }

  get tieneDirecciones(): boolean {
    return this.direcciones.length > 0;
  }
}