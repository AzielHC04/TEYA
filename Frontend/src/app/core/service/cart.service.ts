import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product.service';

export interface CartItem {
  producto: Product;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.cargarDesdeStorage());
  public cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

  constructor() {}

  // Genera una llave única basada en el usuario logueado actualmente
  private obtenerCartKey(): string {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado && usuarioGuardado !== 'undefined' && usuarioGuardado !== 'null') {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          // Si el usuario tiene ID o email, lo usamos para separar su carrito
          return `kabnia_cart_${usuario.id || usuario.email}`;
        } catch (e) {
          return 'kabnia_cart_invitado';
        }
      }
    }
    return 'kabnia_cart_invitado';
  }

  private cargarDesdeStorage(): CartItem[] {
    if (isPlatformBrowser(this.platformId)) {
      const key = this.obtenerCartKey();
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  private guardarEnStorage(items: CartItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      const key = this.obtenerCartKey();
      localStorage.setItem(key, JSON.stringify(items));
    }
    this.cartItemsSubject.next(items);
  }

  // Método que llama el AuthService al iniciar sesión para recargar el carrito de ese usuario específico
  public recargarCarritoUsuario(): void {
    const items = this.cargarDesdeStorage();
    this.cartItemsSubject.next(items);
  }

  public agregarProducto(producto: Product, cantidadAgregar: number = 1): { exito: boolean; mensaje: string } {
    let items = this.cargarDesdeStorage();
    const index = items.findIndex(i => String(i.producto.id) === String(producto.id));
    
    const stockDisponible = producto.stock ?? 99;
    const cantidadActual = index > -1 ? items[index].cantidad : 0;

    if ((cantidadActual + cantidadAgregar) > stockDisponible) {
      return { 
        exito: false, 
        mensaje: `No es posible agregar más. Stock disponible: ${stockDisponible}` 
      };
    }

    if (index > -1) {
      items[index].cantidad += cantidadAgregar;
    } else {
      items.push({ producto, cantidad: cantidadAgregar });
    }

    this.guardarEnStorage(items);
    return { exito: true, mensaje: 'Producto agregado al carrito.' };
  }

  public actualizarCantidad(productoId: string | number, nuevaCantidad: number, stockMaximo: number): { exito: boolean; mensaje: string } {
    let items = this.cargarDesdeStorage();
    
    if (nuevaCantidad <= 0) {
      return this.removerItem(productoId);
    }

    if (nuevaCantidad > stockMaximo) {
      return { 
        exito: false, 
        mensaje: `Solo hay ${stockMaximo} unidades disponibles en stock.` 
      };
    }

    const item = items.find(i => String(i.producto.id) === String(productoId));
    if (item) {
      item.cantidad = nuevaCantidad;
      this.guardarEnStorage(items);
    }

    return { exito: true, mensaje: 'Cantidad actualizada.' };
  }

  public removerItem(productoId: string | number): { exito: boolean; mensaje: string } {
    const items = this.cargarDesdeStorage().filter(i => String(i.producto.id) !== String(productoId));
    this.guardarEnStorage(items);
    return { exito: true, mensaje: 'Producto eliminado del carrito.' };
  }

  // Ya no borramos el localStorage del carrito al salir, solo limpiamos la vista actual en memoria
  public limpiarCarrito(): void {
    this.cartItemsSubject.next([]);
  }
}