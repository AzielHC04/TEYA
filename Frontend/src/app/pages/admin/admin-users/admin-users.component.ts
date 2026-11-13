import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  
  usuarios: User[] = [];
  cargando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.http.get<User[]>('https://teya-d5iz.onrender.com/api/users').subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar los usuarios.';
      }
    });
  }

  eliminarUsuario(id: string): void {
    if (confirm('¿Estás seguro de eliminar este usuario de la plataforma?')) {
      this.http.delete(`https://teya-d5iz.onrender.com/api/users/${id}`).subscribe({
        next: () => {
          this.mensajeExito = 'Usuario eliminado exitosamente.';
          this.cargarUsuarios();
          setTimeout(() => this.mensajeExito = '', 4000);
        },
        error: () => {
          this.mensajeError = 'Error al eliminar el usuario.';
          setTimeout(() => this.mensajeError = '', 4000);
        }
      });
    }
  }
}