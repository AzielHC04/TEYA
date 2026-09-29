import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  precio: number;
  precioAnterior?: number;
  descuento?: string;
  envioGratis: boolean;
  imagen: string;
  stock: number;
  masComprado: boolean;
  ultimoAgregado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/productos';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos reales desde NestJS / Supabase
  getProductos(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Obtener un solo producto por ID
  getProductoById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Descontar el stock en la base de datos al realizar la compra
  comprarProducto(id: string, cantidad: number = 1): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/comprar`, { cantidad });
  }
}