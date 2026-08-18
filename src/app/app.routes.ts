import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { CarritoComponent } from './pages/carrito/carrito.component';

export const routes: Routes = [

  // Página de inicio
  { path: '', component: HomeComponent },

  // Página de productos
  { path: 'products', component: ProductsComponent },

  // Página del carrito
  { path: 'carrito', component: CarritoComponent },

  // Redirección para rutas inexistentes
  { path: '**', redirectTo: '' }

];