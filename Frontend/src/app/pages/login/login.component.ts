import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

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
  private authService = inject(AuthService); // Inyectamos el AuthService

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
        // Usamos el AuthService para guardar el token, el usuario y actualizar la señal global
        this.authService.login(res.token, res.usuario);

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