import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';
import { MiperfilComponent } from './pages/miperfil/miperfil.component';

export const routes: Routes = [

  // Página de inicio
  { path: '', component: HomeComponent },

  // Página de productos
  { path: 'products', component: ProductsComponent },

  // Página del carrito
  { path: 'carrito', component: CarritoComponent },

  // Página de nosotros 
  { path: 'nosotros', component: NosotrosComponent },
  
  // Página de mi perfil
  { path: 'miperfil', component: MiperfilComponent },

  // Redirección para rutas inexistentes
  { path: '**', redirectTo: '' }



];