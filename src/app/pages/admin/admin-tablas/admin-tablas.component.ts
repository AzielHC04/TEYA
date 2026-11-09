import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../core/service/product.service';

@Component({
  selector: 'app-admin-tablas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tablas.component.html',
  styleUrls: ['./admin-tablas.component.css']
})
export class AdminTablasComponent implements OnInit {
  private productService = inject(ProductService);

  productos: Product[] = [];
  cargando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  // Control del Modal de Edición Completa
  productoEditando: Product | null = null;
  
  // Campos del formulario en el Modal
  editNombre: string = '';
  editCategoria: string = 'Orgánicos';
  editDescripcion: string = '';
  editPrecio: number = 0;
  
  editTieneDescuento: boolean = false;
  editPorcentajeDescuento: number = 0;

  editStock: number = 0;
  editEnvioGratis: boolean = false;
  editMasComprado: boolean = false;
  editUltimoAgregado: boolean = false;

  // Imagen nueva (opcional al editar)
  archivoImagen: File | null = null;
  vistaPrevia: string | null = null;

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productService.getProductos().subscribe({
      next: (data: Product[]) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error(err);
        this.cargando = false;
        this.mensajeError = 'Error al cargar el inventario.';
      }
    });
  }

  // Cálculo en tiempo real del precio final con descuento dentro del modal
  get precioFinalEdit(): number {
    if (!this.editPrecio) return 0;
    if (this.editTieneDescuento && this.editPorcentajeDescuento > 0) {
      const descuento = (this.editPrecio * this.editPorcentajeDescuento) / 100;
      return Number((this.editPrecio - descuento).toFixed(2));
    }
    return this.editPrecio;
  }

  // Abrir modal y cargar los datos actuales del producto
  abrirModalEditar(producto: Product): void {
    this.productoEditando = producto;
    this.editNombre = producto.nombre;
    this.editCategoria = producto.categoria || 'Orgánicos';
    this.editDescripcion = producto.descripcion || '';
    this.editPrecio = producto.precioAnterior ? producto.precioAnterior : producto.precio;
    
    // Detectar si ya tenía descuento guardado
    if (producto.descuento) {
      this.editTieneDescuento = true;
      const numDesc = parseInt(producto.descuento.replace('% OFF', '').trim());
      this.editPorcentajeDescuento = isNaN(numDesc) ? 0 : numDesc;
    } else {
      this.editTieneDescuento = false;
      this.editPorcentajeDescuento = 0;
    }

    this.editStock = producto.stock;
    this.editEnvioGratis = producto.envioGratis;
    this.editMasComprado = producto.masComprado;
    this.editUltimoAgregado = producto.ultimoAgregado;

    this.archivoImagen = null;
    this.vistaPrevia = producto.imagen; // Mostrar la imagen actual por defecto
  }

  cerrarModal(): void {
    this.productoEditando = null;
    this.archivoImagen = null;
    this.vistaPrevia = null;
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

  guardarCambiosProducto(): void {
    if (!this.productoEditando) return;

    const formData = new FormData();
    formData.append('nombre', this.editNombre);
    formData.append('categoria', this.editCategoria);
    formData.append('descripcion', this.editDescripcion);

    if (this.editTieneDescuento && this.editPorcentajeDescuento > 0) {
      formData.append('precio', this.precioFinalEdit.toString());
      formData.append('precioAnterior', this.editPrecio.toString());
      formData.append('descuento', `${this.editPorcentajeDescuento}% OFF`);
    } else {
      formData.append('precio', this.editPrecio.toString());
      formData.append('precioAnterior', ''); // Limpiar si no hay descuento
      formData.append('descuento', '');
    }

    formData.append('stock', this.editStock.toString());
    formData.append('envioGratis', this.editEnvioGratis.toString());
    formData.append('masComprado', this.editMasComprado.toString());
    formData.append('ultimoAgregado', this.editUltimoAgregado.toString());

    // Solo adjuntar si el usuario seleccionó una nueva imagen
    if (this.archivoImagen) {
      formData.append('file', this.archivoImagen);
    }

    this.productService.actualizarProducto(this.productoEditando.id, formData).subscribe({
      next: (res: any) => {
        this.mensajeExito = '¡Producto actualizado correctamente!';
        this.cerrarModal();
        this.cargarProductos();
        setTimeout(() => this.mensajeExito = '', 4000);
      },
      error: (err: any) => {
        console.error(err);
        this.mensajeError = 'Error al actualizar el producto.';
        setTimeout(() => this.mensajeError = '', 4000);
      }
    });
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) {
      this.productService.eliminarProducto(id).subscribe({
        next: () => {
          this.mensajeExito = 'Producto eliminado con éxito.';
          this.cargarProductos();
          setTimeout(() => this.mensajeExito = '', 4000);
        },
        error: (err: any) => {
          console.error(err);
          this.mensajeError = 'No se pudo eliminar el producto.';
        }
      });
    }
  }
}