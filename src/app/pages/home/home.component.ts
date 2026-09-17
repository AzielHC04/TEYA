import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Producto } from '../../core/service/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  // Lista base de banners con su color temático (máximo 6 visibles)
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

  // Arreglo limitado a máximo 6 imágenes para la vista
  bannersPromocionales = this.todosLosBanners.slice(0, 6);

  bannerActual = 0;
  autoSlideTimer: any;

  // Listas de productos
  masComprados: Producto[] = [];
  ultimosAgregados: Producto[] = [];

  // Paginación de carruseles de productos
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

    this.masComprados = this.productService.getMasComprados();
    this.ultimosAgregados = this.productService.getUltimosAgregados();

    this.iniciarCarruselesProductos(5000);
  }

  ngOnDestroy(): void {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
    if (this.timerMasComprados) clearInterval(this.timerMasComprados);
    if (this.timerUltimosAgregados) clearInterval(this.timerUltimosAgregados);
  }

  // --- Lógica del Banner Principal ---
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

  // --- Getters para filtrar 5 productos según la página actual ---
  get masCompradosVisibles(): Producto[] {
    const inicio = this.paginaMasComprados * 5;
    return this.masComprados.slice(inicio, inicio + 5);
  }

  get ultimosAgregadosVisibles(): Producto[] {
    const inicio = this.paginaUltimosAgregados * 5;
    return this.ultimosAgregados.slice(inicio, inicio + 5);
  }

  // --- Lógica de Carruseles de Productos ---
  iniciarCarruselesProductos(intervaloMs: number): void {
    this.ngZone.runOutsideAngular(() => {
      this.timerMasComprados = setInterval(() => {
        this.ngZone.run(() => {
          this.paginaMasComprados = this.paginaMasComprados === 0 ? 1 : 0;
        });
      }, intervaloMs);

      this.timerUltimosAgregados = setInterval(() => {
        this.ngZone.run(() => {
          this.paginaUltimosAgregados = this.paginaUltimosAgregados === 0 ? 1 : 0;
        });
      }, intervaloMs);
    });
  }
}