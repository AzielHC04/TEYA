import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/service/product.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.component.html',
  styleUrls: ['./admin-productos.component.css']
})
export class AdminProductosComponent { // 👈 Agregado 'export' aquí
  private productService = inject(ProductService);

  // Modelo del formulario
  nombre: string = '';
  categoria: string = 'Orgánicos';
  descripcion: string = '';
  precio: number | null = null;
  
  // Descuento
  tieneDescuento: boolean = false;
  porcentajeDescuento: number = 0; // Ej. 15 para 15%

  stock: number | null = null;
  envioGratis: boolean = false;
  masComprado: boolean = false;
  ultimoAgregado: boolean = true;

  // Imagen
  archivoImagen: File | null = null;
  vistaPrevia: string | null = null;

  // Mensajes de feedback
  mensajeExito: string = '';
  mensajeError: string = '';
  cargando: boolean = false;

  // Cálculo en tiempo real del precio final con descuento
  get precioFinal(): number {
    if (!this.precio) return 0;
    if (this.tieneDescuento && this.porcentajeDescuento > 0) {
      const descuento = (this.precio * this.porcentajeDescuento) / 100;
      return Number((this.precio - descuento).toFixed(2));
    }
    return this.precio;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoImagen = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.vistaPrevia = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.nombre || !this.precio || !this.stock) {
      this.mensajeError = 'Por favor, completa los campos obligatorios (Nombre, Precio y Stock).';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('categoria', this.categoria);
    formData.append('descripcion', this.descripcion);
    
    // Si hay descuento, el precio original pasa a ser precioAnterior y el nuevo precio es el rebajado
    if (this.tieneDescuento && this.porcentajeDescuento > 0) {
      formData.append('precio', this.precioFinal.toString());
      formData.append('precioAnterior', this.precio.toString());
      formData.append('descuento', `${this.porcentajeDescuento}% OFF`);
    } else {
      formData.append('precio', this.precio.toString());
    }

    formData.append('stock', this.stock.toString());
    formData.append('envioGratis', this.envioGratis.toString());
    formData.append('masComprado', this.masComprado.toString());
    formData.append('ultimoAgregado', this.ultimoAgregado.toString());

    if (this.archivoImagen) {
      formData.append('file', this.archivoImagen);
    }

    this.productService.createProduct(formData).subscribe({
      next: (res: any) => { // 👈 Tipado añadido
        this.cargando = false;
        this.mensajeExito = '¡Producto registrado y guardado con éxito en la base de datos!';
        this.resetForm();
      },
      error: (err: any) => { // 👈 Tipado añadido
        console.error(err);
        this.cargando = false;
        this.mensajeError = 'Ocurrió un error al registrar el producto en el servidor.';
      }
    });
  }

  resetForm(): void {
    this.nombre = '';
    this.categoria = 'Orgánicos';
    this.descripcion = '';
    this.precio = null;
    this.tieneDescuento = false;
    this.porcentajeDescuento = 0;
    this.stock = null;
    this.envioGratis = false;
    this.masComprado = false;
    this.ultimoAgregado = true;
    this.archivoImagen = null;
    this.vistaPrevia = null;
  }
}