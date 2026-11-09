import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  mensajeError: string = '';

  iniciarSesion(): void {
    const payload = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:3000/api/users/login', payload).subscribe({
      next: (res) => {
        // Guardamos los datos básicos del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(res.usuario));

        // Redirigimos dependiendo del rol
        if (res.usuario.role === 'ADMIN') {
          this.router.navigate(['/admin/tablas']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = err.error?.message || 'Correo o contraseña incorrectos.';
      }
    });
  }
}