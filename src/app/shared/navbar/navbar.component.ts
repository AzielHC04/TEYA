import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  productosAbierto: boolean = false;
  menuOpen: boolean = false;

  toggleProductos(): void {
    this.productosAbierto = !this.productosAbierto;
  }

  cerrarProductos(): void {
    this.productosAbierto = false;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}