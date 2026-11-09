import { Component, OnInit, OnDestroy, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/service/cart.service';
import { AuthService } from '../../core/service/auth.service';
import { Subscription } from 'rxjs';

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
export class NavbarComponent implements OnInit, OnDestroy {
  productosAbierto: boolean = false;
  totalProductosEnCarrito: number = 0;

  private cartService = inject(CartService);
  public authService = inject(AuthService); // Inyectamos el AuthService
  private router = inject(Router);
  private cartSub!: Subscription;

  ngOnInit(): void {
    // Suscripción al carrito
    this.cartSub = this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.totalProductosEnCarrito = items.reduce((acc, item) => acc + item.cantidad, 0);
    });
  }

  ngOnDestroy(): void {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }

  toggleProductos(): void {
    this.productosAbierto = !this.productosAbierto;
  }

  cerrarProductos(): void {
    this.productosAbierto = false;
  }

  cerrarSesion(): void {
    this.authService.logout(); // Esto limpia todo automáticamente
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.cerrarProductos();
    }
  }
}