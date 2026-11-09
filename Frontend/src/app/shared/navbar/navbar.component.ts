
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationEnd
} from '@angular/router';

import {
  CartService,
  CartItem
} from '../../core/service/cart.service';

import {
  AuthService
} from '../../core/service/auth.service';

import {
  Subscription,
  filter
} from 'rxjs';

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

  productosAbierto = false;
  totalProductosEnCarrito = 0;

  // Disponible para navbar.component.html:
  public authService = inject(AuthService);

  private cartService = inject(CartService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private cartSub?: Subscription;
  private routerSub?: Subscription;

  // Compatibilidad con código anterior.
  get usuarioLogueado() {
    return this.authService.usuarioActual();
  }

  ngOnInit(): void {

    // CARRITO
    this.cartSub = this.cartService.cartItems$.subscribe(
      (items: CartItem[]) => {

        this.totalProductosEnCarrito = items.reduce(
          (total, item) => total + item.cantidad,
          0
        );

        this.cdr.markForCheck();
      }
    );

    // NAVEGACIÓN
    this.routerSub = this.router.events.pipe(
      filter(
        (evento): evento is NavigationEnd =>
          evento instanceof NavigationEnd
      )
    ).subscribe(() => {
      this.cerrarProductos();
      this.cdr.markForCheck();
    });
  }

  // COMPATIBILIDAD CON VERSIONES ANTERIORES
  verificarSesion(): void {
    this.cdr.markForCheck();
  }

  ionViewWillEnter(): void {
    this.verificarSesion();
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  // PRODUCTOS
  toggleProductos(): void {
    this.productosAbierto = !this.productosAbierto;
  }

  cerrarProductos(): void {
    this.productosAbierto = false;
  }

  // CERRAR SESIÓN
  cerrarSesion(): void {

    this.authService.logout();

    this.cdr.markForCheck();

    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement;

    if (!target.closest('.dropdown')) {
      this.cerrarProductos();
    }
  }
}
