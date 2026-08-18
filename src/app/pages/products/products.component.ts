import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  // Catálogo completo de productos ampliados
  productos: Producto[] = [
    // --- ORGÁNICOS ---
    { 
      id: 'bp-calcio', 
      nombre: 'BP-CALCIO', 
      categoria: 'Orgánicos', 
      descripcion: 'Fertilizante líquido rico en calcio de alta asimilación para estructura celular.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'bp-magnesio', 
      nombre: 'BP-MAGNESIO', 
      categoria: 'Orgánicos', 
      descripcion: 'Aporte de magnesio soluble para potenciar la actividad fotosintética.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'bp-potasio', 
      nombre: 'BP-POTASIO', 
      categoria: 'Orgánicos', 
      descripcion: 'Optimiza el llenado de frutos y mejora la resistencia a estrés hídrico.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'bp-moots', 
      nombre: 'BP-MOOTS', 
      categoria: 'Orgánicos', 
      descripcion: 'Bioestimulante radicular para un desarrollo radicular fuerte y sano.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'ae-calcium', 
      nombre: 'AE CALCIUM', 
      categoria: 'Orgánicos', 
      descripcion: 'Acondicionador de suelo y corrector de deficiencias de calcio.', 
      imagen: 'assets/Producto.jpg' 
    },

    // --- BIOESTIMULANTES ---
    { 
      id: 'bio-root-plus', 
      nombre: 'BIO-ROOT PLUS', 
      categoria: 'Bioestimulantes', 
      descripcion: 'Inductor del enraizamiento y desarrollo de cabellera radicular profunda.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'bio-stress-control', 
      nombre: 'BIO-STRESS CONTROL', 
      categoria: 'Bioestimulantes', 
      descripcion: 'Formulación a base de aminoácidos para recuperación activa de estrés.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'algaboost-premium', 
      nombre: 'ALGA-BOOST PREMIUM', 
      categoria: 'Bioestimulantes', 
      descripcion: 'Extracto concentrado de algas marinas que estimula el vigor vegetal.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'phyto-bloom-active', 
      nombre: 'PHYTO-BLOOM ACTIVE', 
      categoria: 'Bioestimulantes', 
      descripcion: 'Promotor de floración uniforme y amarre de frutos en cultivos de alto valor.', 
      imagen: 'assets/Producto.jpg'
    },

    // --- NUTRICIÓN LÍQUIDA ---
    { 
      id: 'nitro-max-liquid', 
      nombre: 'NITRO-MAX LIQUID', 
      categoria: 'Nutrición Líquida', 
      descripcion: 'Aporte nitrógeno foliar de rápida absorción para desarrollo vegetativo.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'phos-tek-flow', 
      nombre: 'PHOS-TEK FLOW', 
      categoria: 'Nutrición Líquida', 
      descripcion: 'Fósforo asimilable de alta concentración para etapas iniciales y radiculares.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'k-shuttle-fructus', 
      nombre: 'K-SHUTTLE FRUCTUS', 
      categoria: 'Nutrición Líquida', 
      descripcion: 'Potasio foliar libre de cloruros diseñado para maduración y calibre.', 
      imagen: 'assets/Producto.jpg'
    },
    { 
      id: 'micro-mix-chelate', 
      nombre: 'MICRO-MIX CHELATE', 
      categoria: 'Nutrición Líquida', 
      descripcion: 'Complejo balanceado de micronutrientes quelatados para fertirriego.', 
      imagen: 'assets/Producto.jpg' 
    },

    // --- ESPECIALIDADES ---
    { 
      id: 'ph-corrector-adj', 
      nombre: 'pH-CORRECTOR ADJ', 
      categoria: 'Especialidades', 
      descripcion: 'Acondicionador de agua de aplicación con indicador visual de pH.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'surf-adjuvant-gold', 
      nombre: 'SURF-ADJUVANT GOLD', 
      categoria: 'Especialidades', 
      descripcion: 'Coadyuvante organosiliconado de alta humectación y penetración.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'soil-revitalizer', 
      nombre: 'SOIL-REVITALIZER', 
      categoria: 'Especialidades', 
      descripcion: 'Regenerador de suelos degradados y desbloqueador de nutrientes.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'antitranspirante-agro', 
      nombre: 'ANTITRANSPIRANTE AGRO', 
      categoria: 'Especialidades', 
      descripcion: 'Protector foliar contra la deshidratación y quemaduras de sol.', 
      imagen: 'assets/Producto.jpg' 
    },

    // --- BIOPLAGUICIDAS ---
    { 
      id: 'bio-fungi-stop', 
      nombre: 'BIO-FUNGI STOP', 
      categoria: 'Bioplaguicidas', 
      descripcion: 'Fungicida biológico a base de cepas antagónicas de Trichoderma.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'neem-shield-bio', 
      nombre: 'NEEM-SHIELD BIO', 
      categoria: 'Bioplaguicidas', 
      descripcion: 'Extracto botánico concentrado para control de plagas chupadoras.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'bacillus-thuri-guard', 
      nombre: 'BACILLUS THURI-GUARD', 
      categoria: 'Bioplaguicidas', 
      descripcion: 'Insecticida microbiológico específico para el control de larvas de lepidópteros.', 
      imagen: 'assets/Producto.jpg' 
    },
    { 
      id: 'cu-bacter-pro', 
      nombre: 'CU-BACTER PRO', 
      categoria: 'Bioplaguicidas', 
      descripcion: 'Bactericida y bacteriostático de acción preventiva y curativa.', 
      imagen: 'assets/Producto.jpg' 
    }
  ];

  productosFiltrados: Producto[] = [];
  categoriaSeleccionada: string = 'Todas';

  // Configuración de Paginación (Mostraremos 8 por página)
  paginaActual: number = 1;
  productosPorPagina: number = 8;

  ngOnInit(): void {
    this.productosFiltrados = [...this.productos];
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.paginaActual = 1;

    if (categoria === 'Todas') {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(
        p => p.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }
  }

  get productosPaginados(): Producto[] {
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