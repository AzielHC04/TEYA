import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../core/service/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {

  private routeSub!: Subscription;
  private productSub!: Subscription;

  // Catálogo devuelto desde la API
  productos: Product[] = [];
  productosFiltrados: Product[] = [];
  categoriaSeleccionada: string = 'Todas';

  // Configuración de Paginación
  paginaActual: number = 1;
  productosPorPagina: number = 8;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // 1. Cargar productos desde el Backend (NestJS / Supabase)
    this.productSub = this.productService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        // Una vez cargados los datos, aplicamos el filtro activo si venía por URL
        this.escucharQueryParams();
      },
      error: (err) => console.error('Error al cargar catálogo de productos:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.productSub) this.productSub.unsubscribe();
  }

  // Escucha los cambios en la URL (?categoria=xxx)
  private escucharQueryParams(): void {
    if (this.routeSub) this.routeSub.unsubscribe(); // Prevenir suscripciones duplicadas

    this.routeSub = this.route.queryParams.subscribe(params => {
      const categoriaParam = params['categoria'];
      if (categoriaParam) {
        this.filtrarPorCategoria(categoriaParam);
      } else {
        this.filtrarPorCategoria('Todas');
      }
    });
  }

  // Normaliza textos para comparar ignorando acentos, mayúsculas y espacios/guiones
  private normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .toLowerCase()
      .replace(/\s+/g, '-')            // Cambia espacios por guiones
      .trim();
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.paginaActual = 1;

    const catNormalizada = this.normalizarTexto(categoria);

    if (catNormalizada === 'todas' || catNormalizada === 'todos') {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(
        p => this.normalizarTexto(p.categoria) === catNormalizada
      );
    }
  }

  get productosPaginados(): Product[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}