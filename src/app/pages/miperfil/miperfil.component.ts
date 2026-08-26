import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
export class MiperfilComponent {

  // ==========================================
  // INFORMACIÓN DEL USUARIO
  // ==========================================

  usuario = {
    nombre: 'Juan',
    apellidos: 'Díaz Pérez',
    correo: 'juan.diaz@email.com',
    telefono: '999 123 4567'
  };


  // ==========================================
  // DIRECCIÓN
  // ==========================================

  direccion = {
    calle: 'Calle 25 #120',
    colonia: 'Col. Centro',
    ciudad: 'Mérida',
    estado: 'Yucatán',
    codigoPostal: '97000'
  };


  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  estadisticas = {
    pedidos: 8,
    productos: 12,
    clienteDesde: 2026
  };


  // ==========================================
  // ESTADO DE EDICIÓN
  // ==========================================

  editandoPerfil = false;

  editandoDireccion = false;


  // ==========================================
  // EDITAR PERFIL
  // ==========================================

  editarPerfil(): void {

    this.editandoPerfil = true;

  }


  // ==========================================
  // GUARDAR PERFIL
  // ==========================================

  guardarPerfil(): void {

    this.editandoPerfil = false;

    console.log(
      'Perfil actualizado:',
      this.usuario
    );

  }


  // ==========================================
  // EDITAR DIRECCIÓN
  // ==========================================

  editarDireccion(): void {

    this.editandoDireccion = true;

  }


  // ==========================================
  // GUARDAR DIRECCIÓN
  // ==========================================

  guardarDireccion(): void {

    this.editandoDireccion = false;

    console.log(
      'Dirección actualizada:',
      this.direccion
    );

  }


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  cerrarSesion(): void {

    console.log(
      'Cerrando sesión...'
    );

    // Aquí posteriormente puedes conectar
    // el servicio de autenticación.

  }


  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  cambiarContrasena(): void {

    console.log(
      'Cambiar contraseña'
    );

    // Aquí posteriormente puedes abrir
    // un modal o navegar a otra página.

  }


  // ==========================================
  // NOMBRE COMPLETO
  // ==========================================

  get nombreCompleto(): string {

    return `${this.usuario.nombre} ${this.usuario.apellidos}`;

  }


  // ==========================================
  // INICIALES
  // ==========================================

  get iniciales(): string {

    const nombre =
      this.usuario.nombre?.charAt(0) || '';

    const apellido =
      this.usuario.apellidos?.charAt(0) || '';

    return (
      nombre + apellido
    ).toUpperCase();

  }

}