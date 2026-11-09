import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  name: string = '';
  email: string = '';
  password: string = '';
  
  mensajeError: string = '';
  mensajeExito: string = '';

  registrarUsuario(): void {
    const payload = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: 'CLIENT' // Por defecto se registran como clientes
    };

    this.http.post('http://localhost:3000/api/users/register', payload).subscribe({
      next: () => {
        this.mensajeExito = '¡Registro exitoso! Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = err.error?.message || 'Error al registrar el usuario.';
      }
    });
  }
}