import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../core/service/product.service';
import { ProductCardComponent } from '../../shared/navbar/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  private todosLosBanners = [
    {
      imagen: 'assets/descuento 1.png',
      titulo: 'HASTA 40% OFF',
      subtitulo: 'ENVÍOS RÁPIDOS Y DESCUENTOS EN BIOINSUMOS',
      bgColor: '#00a650'
    },
    {
      imagen: 'assets/descuento 2.png',
      titulo: 'SOLUCIONES PARA TU CULTIVO',
      subtitulo: 'REGENERA TU SUELO CON BIOESTIMULANTES',
      bgColor: '#703522'
    },
    {
      imagen: 'assets/descuento 3.png',
      titulo: 'PROTECCIÓN INTEGRAL',
      subtitulo: 'BIOPLAGUICIDAS Y CONTROL ORGÁNICO',
      bgColor: '#2b5d38'
    },
    {
      imagen: 'assets/descuento 4.png',
      titulo: 'NUTRICIÓN FOLIAR',
      subtitulo: 'MAXIMIZA EL RENDIMIENTO DE TU COSECHA',
      bgColor: '#aa8024'
    },
    {
      imagen: 'assets/descuento 5.png',
      titulo: 'OFERTAS DE TEMPORADA',
      subtitulo: 'MEJORES PRECIOS EN FERTILIZANTES',
      bgColor: '#2b5d38'
    },
    {
      imagen: 'assets/descuento 6.png',
      titulo: 'ENVIOS GRATIS',
      subtitulo: 'EN COMPRAS MAYORES A $999',
      bgColor: '#703522'
    }
  ];

  bannersPromocionales = this.todosLosBanners.slice(0, 6);

  bannerActual = 0;
  autoSlideTimer: any;

  masComprados: Product[] = [];
  ultimosAgregados: Product[] = [];

  paginaMasComprados = 0;
  paginaUltimosAgregados = 0;

  timerMasComprados: any;
  timerUltimosAgregados: any;

  constructor(
    private ngZone: NgZone,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.iniciarAutoSlideBanners();
    this.cargarProductosDesdeAPI();
  }

  ngOnDestroy(): void {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    if (this.timerMasComprados) clearInterval(this.timerMasComprados);
    if (this.timerUltimosAgregados) clearInterval(this.timerUltimosAgregados);
  }

  cargarProductosDesdeAPI(): void {
    this.productService.getProductos().subscribe({
      next: (productos: Product[]) => {
        this.masComprados = productos.filter(p => p.masComprado);
        this.ultimosAgregados = productos.filter(p => p.ultimoAgregado);

        this.iniciarCarruselesProductosSiEsNecesario(5000);
      },
      error: (err) => console.error('Error al cargar productos en Home:', err)
    });
  }

  iniciarAutoSlideBanners(): void {
    this.ngZone.runOutsideAngular(() => {
      this.autoSlideTimer = setInterval(() => {
        this.ngZone.run(() => {
          this.siguienteBanner();
        });
      }, 5000);
    });
  }

  siguienteBanner(): void {
    this.bannerActual = (this.bannerActual + 1) % this.bannersPromocionales.length;
  }

  anteriorBanner(): void {
    this.bannerActual = (this.bannerActual - 1 + this.bannersPromocionales.length) % this.bannersPromocionales.length;
  }

  seleccionarBanner(index: number): void {
    this.bannerActual = index;
  }

  get masCompradosVisibles(): Product[] {
    const inicio = this.paginaMasComprados * 4;
    return this.masComprados.slice(inicio, inicio + 4);
  }

  get ultimosAgregadosVisibles(): Product[] {
    const inicio = this.paginaUltimosAgregados * 4;
    return this.ultimosAgregados.slice(inicio, inicio + 4);
  }

  iniciarCarruselesProductosSiEsNecesario(intervaloMs: number): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.masComprados.length > 4) {
        this.timerMasComprados = setInterval(() => {
          this.ngZone.run(() => {
            const maxPaginas = Math.ceil(this.masComprados.length / 4);
            this.paginaMasComprados = (this.paginaMasComprados + 1) % maxPaginas;
          });
        }, intervaloMs);
      }

      if (this.ultimosAgregados.length > 4) {
        this.timerUltimosAgregados = setInterval(() => {
          this.ngZone.run(() => {
            const maxPaginas = Math.ceil(this.ultimosAgregados.length / 4);
            this.paginaUltimosAgregados = (this.paginaUltimosAgregados + 1) % maxPaginas;
          });
        }, intervaloMs);
      }
    });
  }
}