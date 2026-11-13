import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/service/cart.service';
import { NotificationService } from '../../core/service/notification.service';

@Component({
  selector: 'app-ficha',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ficha.component.html',
  styleUrls: ['./ficha.component.css']
})
export class FichaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private notificacion = inject(NotificationService);

  producto: any = null;
  cargando: boolean = true;
  errorCarga: boolean = false;
  cantidadSeleccionada: number = 1;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(id);
    } else {
      this.cargando = false;
      this.errorCarga = true;
    }
  }

  cargarProducto(id: string): void {
    this.http.get<any>(`https://teya-d5iz.onrender.com/productos/${id}`).subscribe({
      next: (data) => {
        this.producto = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la ficha técnica del producto:', err);
        this.cargando = false;
        this.errorCarga = true;
      }
    });
  }

  obtenerClaseCategoria(categoria: string): string {
    if (!categoria) return 'cat-default';
    
    const cat = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (cat.includes('microorganismo')) {
      return 'cat-microorganismos';
    }
    if (cat.includes('fungicida')) {
      return 'cat-fungicidas';
    }
    if (cat.includes('insecticida')) {
      return 'cat-insecticidas';
    }
    if (cat.includes('adherente')) {
      return 'cat-adherentes';
    }
    if (cat.includes('antiestresante')) {
      return 'cat-antiestresantes';
    }

    return 'cat-default';
  }

  aumentarCantidad(): void {
    const stockDisponible = this.producto?.stock ?? 99;
    if (this.producto && this.cantidadSeleccionada < stockDisponible) {
      this.cantidadSeleccionada++;
    }
  }

  disminuirCantidad(): void {
    if (this.cantidadSeleccionada > 1) {
      this.cantidadSeleccionada--;
    }
  }

  agregarAlCarrito(): void {
    if (!this.producto) return;

    if (this.producto.stock !== undefined && this.producto.stock <= 0) {
      this.notificacion.mostrarError(
        'Producto agotado',
        'Lo sentimos, este producto no tiene existencias por el momento.'
      );
      return;
    }

    const respuesta = this.cartService.agregarProducto(this.producto, this.cantidadSeleccionada);
    
    if (respuesta.exito) {
      this.notificacion.mostrarExito(
        '¡Agregado al carrito!',
        `${this.cantidadSeleccionada} unidad(es) de "${this.producto.nombre}" agregada(s) correctamente.`
      );
    } else {
      this.notificacion.mostrarError('No se pudo agregar', respuesta.mensaje);
    }
  }
}