import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from "./pages/products/products.component";
import { CarritoComponent } from './pages/carrito/carrito.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';
import { NotificacionModalComponent } from './shared/notificacion-modal/notificacion-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    NavbarComponent, 
    HomeComponent, 
    ProductsComponent, 
    CarritoComponent, 
    NosotrosComponent,
    NotificacionModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TEYA';
  private router = inject(Router);
  
  isAdminRoute: boolean = false;
  isAuthRoute: boolean = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Usamos urlAfterRedirects para capturar la URL final tras cualquier redirección
      const url = event.urlAfterRedirects || event.url;
      this.isAdminRoute = url.includes('/admin');
      this.isAuthRoute = url.includes('/login') || url.includes('/register');
    });
  }
}