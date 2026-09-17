import { Injectable } from '@angular/core';

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  imagen: string;
  // Campos comerciales opcionales para la vista del Home
  precio?: number;
  precioAnterior?: number;
  descuento?: string;
  envioGratis?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productos: Producto[] = [
    // --- ORGÁNICOS ---
    { id: 'bp-calcio', nombre: 'BP-CALCIO', categoria: 'Orgánicos', descripcion: 'Fertilizante líquido rico en calcio de alta asimilación para estructura celular.', imagen: 'assets/Producto.jpg', precio: 241, precioAnterior: 350, descuento: '31% OFF', envioGratis: true },
    { id: 'bp-magnesio', nombre: 'BP-MAGNESIO', categoria: 'Orgánicos', descripcion: 'Aporte de magnesio soluble para potenciar la actividad fotosintética.', imagen: 'assets/Producto.jpg', precio: 825, precioAnterior: 1194, descuento: '30% OFF', envioGratis: true },
    { id: 'bp-potasio', nombre: 'BP-POTASIO', categoria: 'Orgánicos', descripcion: 'Optimiza el llenado de frutos y mejora la resistencia a estrés hídrico.', imagen: 'assets/Producto.jpg', precio: 681, envioGratis: true },
    { id: 'bp-moots', nombre: 'BP-MOOTS', categoria: 'Orgánicos', descripcion: 'Bioestimulante radicular para un desarrollo radicular fuerte y sano.', imagen: 'assets/Producto.jpg', precio: 198, precioAnterior: 298, descuento: '33% OFF', envioGratis: true },
    { id: 'ae-calcium', nombre: 'AE CALCIUM', categoria: 'Orgánicos', descripcion: 'Acondicionador de suelo y corrector de deficiencias de calcio.', imagen: 'assets/Producto.jpg', precio: 310, envioGratis: false },

    // --- BIOESTIMULANTES ---
    { id: 'bio-root-plus', nombre: 'BIO-ROOT PLUS', categoria: 'Bioestimulantes', descripcion: 'Inductor del enraizamiento y desarrollo de cabellera radicular profunda.', imagen: 'assets/Producto.jpg', precio: 420, envioGratis: true },
    { id: 'bio-stress-control', nombre: 'BIO-STRESS CONTROL', categoria: 'Bioestimulantes', descripcion: 'Formulación a base de aminoácidos para recuperación activa de estrés.', imagen: 'assets/Producto.jpg', precio: 390, envioGratis: true },
    { id: 'algaboost-premium', nombre: 'ALGA-BOOST PREMIUM', categoria: 'Bioestimulantes', descripcion: 'Extracto concentrado de algas marinas que estimula el vigor vegetal.', imagen: 'assets/Producto.jpg', precio: 510, precioAnterior: 600, descuento: '15% OFF', envioGratis: true },
    { id: 'phyto-bloom-active', nombre: 'PHYTO-BLOOM ACTIVE', categoria: 'Bioestimulantes', descripcion: 'Promotor de floración uniforme y amarre de frutos en cultivos de alto valor.', imagen: 'assets/Producto.jpg', precio: 275, envioGratis: false },

    // --- NUTRICIÓN LÍQUIDA ---
    { id: 'nitro-max-liquid', nombre: 'NITRO-MAX LIQUID', categoria: 'Nutrición Líquida', descripcion: 'Aporte nitrógeno foliar de rápida absorción para desarrollo vegetativo.', imagen: 'assets/Producto.jpg', precio: 390, precioAnterior: 500, descuento: '22% OFF', envioGratis: true },
    { id: 'phos-tek-flow', nombre: 'PHOS-TEK FLOW', categoria: 'Nutrición Líquida', descripcion: 'Fósforo asimilable de alta concentración para etapas iniciales y radiculares.', imagen: 'assets/Producto.jpg', precio: 450, envioGratis: true },
    { id: 'k-shuttle-fructus', nombre: 'K-SHUTTLE FRUCTUS', categoria: 'Nutrición Líquida', descripcion: 'Potasio foliar libre de cloruros diseñado para maduración y calibre.', imagen: 'assets/Producto.jpg', precio: 480, envioGratis: true },
    { id: 'micro-mix-chelate', nombre: 'MICRO-MIX CHELATE', categoria: 'Nutrición Líquida', descripcion: 'Complejo balanceado de micronutrientes quelatados para fertirriego.', imagen: 'assets/Producto.jpg', precio: 520, envioGratis: true },

    // --- ESPECIALIDADES ---
    { id: 'ph-corrector-adj', nombre: 'pH-CORRECTOR ADJ', categoria: 'Especialidades', descripcion: 'Acondicionador de agua de aplicación con indicador visual de pH.', imagen: 'assets/Producto.jpg', precio: 210, envioGratis: false },
    { id: 'surf-adjuvant-gold', nombre: 'SURF-ADJUVANT GOLD', categoria: 'Especialidades', descripcion: 'Coadyuvante organosiliconado de alta humectación y penetración.', imagen: 'assets/Producto.jpg', precio: 340, envioGratis: true },
    { id: 'soil-revitalizer', nombre: 'SOIL-REVITALIZER', categoria: 'Especialidades', descripcion: 'Regenerador de suelos degradados y desbloqueador de nutrientes.', imagen: 'assets/Producto.jpg', precio: 890, envioGratis: true },
    { id: 'antitranspirante-agro', nombre: 'ANTITRANSPIRANTE AGRO', categoria: 'Especialidades', descripcion: 'Protector foliar contra la deshidratación y quemaduras de sol.', imagen: 'assets/Producto.jpg', precio: 310, envioGratis: false },

    // --- BIOPLAGUICIDAS ---
    { id: 'bio-fungi-stop', nombre: 'BIO-FUNGI STOP', categoria: 'Bioplaguicidas', descripcion: 'Fungicida biológico a base de cepas antagónicas de Trichoderma.', imagen: 'assets/Producto.jpg', precio: 450, envioGratis: true },
    { id: 'neem-shield-bio', nombre: 'NEEM-SHIELD BIO', categoria: 'Bioplaguicidas', descripcion: 'Extracto botánico concentrado para control de plagas chupadoras.', imagen: 'assets/Producto.jpg', precio: 380, envioGratis: true },
    { id: 'bacillus-thuri-guard', nombre: 'BACILLUS THURI-GUARD', categoria: 'Bioplaguicidas', descripcion: 'Insecticida microbiológico específico para el control de larvas de lepidópteros.', imagen: 'assets/Producto.jpg', precio: 490, envioGratis: true },
    { id: 'cu-bacter-pro', nombre: 'CU-BACTER PRO', categoria: 'Bioplaguicidas', descripcion: 'Bactericida y bacteriostático de acción preventiva y curativa.', imagen: 'assets/Producto.jpg', precio: 530, envioGratis: true }
  ];

  getProductos(): Producto[] {
    return this.productos;
  }

  getMasComprados(): Producto[] {
    return this.productos.slice(0, 10);
  }

  getUltimosAgregados(): Producto[] {
    return [...this.productos].reverse().slice(0, 10);
  }
}