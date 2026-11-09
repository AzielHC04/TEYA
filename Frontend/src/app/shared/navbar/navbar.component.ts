import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/service/cart.service';
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
  usuarioLogueado: any = null;

  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cartSub!: Subscription;

  ngOnInit(): void {
    // Suscripción al carrito
    this.cartSub = this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.totalProductosEnCarrito = items.reduce((acc, item) => acc + item.cantidad, 0);
      this.cdr.markForCheck();
    });

    // Verificamos de forma segura el estado de la sesión en el navegador
    this.verificarSesion();
  }

  // Método para leer la sesión actual del almacenamiento local
  verificarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado && usuarioGuardado !== 'undefined' && usuarioGuardado !== 'null') {
        try {
          this.usuarioLogueado = JSON.parse(usuarioGuardado);
        } catch (e) {
          console.error('Error al parsear el usuario', e);
          this.usuarioLogueado = null;
        }
      } else {
        this.usuarioLogueado = null; // Forzamos a null si no hay sesión real
      }
    }
  }

  // Se ejecuta cada vez que el componente se vuelve visible o navega
  ionViewWillEnter() {
    this.verificarSesion();
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
    }
    this.usuarioLogueado = null;
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