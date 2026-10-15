import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from "./pages/products/products.component";
import { CarritoComponent } from './pages/carrito/carrito.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';

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
    NosotrosComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TEYA';
  private router = inject(Router);
  isAdminRoute: boolean = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Cada vez que cambie de ruta, verificamos si incluye '/admin'
      this.isAdminRoute = event.url.includes('/admin');
    });
  }
}