import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../core/service/product.service';
import { CartService } from '../../core/service/cart.service';
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
  private cartService = inject(CartService);

  productos: Product[] = [];
  productosFiltrados: Product[] = [];
  categoriaSeleccionada: string = 'Todas';

  paginaActual: number = 1;
  productosPorPagina: number = 8;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.escucharQueryParams();

    this.productSub = this.productService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.filtrarPorCategoria(this.categoriaSeleccionada);
      },
      error: (err) => console.error('Error al cargar catálogo de productos:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.productSub) this.productSub.unsubscribe();
  }

  agregarAlCarrito(producto: Product): void {
    const resultado = this.cartService.agregarProducto(producto, 1);
    if (!resultado.exito) {
      window.alert(resultado.mensaje);
    } else {
      window.alert(`¡"${producto.nombre}" agregado al carrito correctamente!`);
    }
  }

  private obtenerNombreOriginal(catParam: string): string {
    const normalizado = this.normalizarTexto(catParam);
    if (normalizado === 'microorganismos') return 'Microorganismos';
    if (normalizado === 'fungicidas') return 'Fungicidas';
    if (normalizado === 'insecticidas') return 'Insecticidas';
    if (normalizado === 'adherentes') return 'Adherentes';
    if (normalizado === 'antiestresantes') return 'Antiestresantes';
    return 'Todas';
  }

  private escucharQueryParams(): void {
    if (this.routeSub) this.routeSub.unsubscribe();

    this.routeSub = this.route.queryParams.subscribe(params => {
      const categoriaParam = params['categoria'];
      if (categoriaParam) {
        const nombreReal = this.obtenerNombreOriginal(categoriaParam);
        this.categoriaSeleccionada = nombreReal;
        if (this.productos.length > 0) {
          this.filtrarPorCategoria(nombreReal);
        }
      } else {
        this.categoriaSeleccionada = 'Todas';
        if (this.productos.length > 0) {
          this.filtrarPorCategoria('Todas');
        }
      }
    });
  }

  private normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
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