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

  // Ruta principal del Panel de Administración (Layout + Subrutas)
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { 
        path: 'productos', 
        loadComponent: () => import('./pages/admin/admin-productos/admin-productos.component').then(m => m.AdminProductosComponent) 
      },
      { 
        path: 'tablas', 
        loadComponent: () => import('./pages/admin/admin-tablas/admin-tablas.component').then(m => m.AdminTablasComponent) 
      },
      { 
        path: 'users', 
        loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent) 
      },
      { 
        path: 'reportes', 
        loadComponent: () => import('./pages/admin/admin-reportes/admin-reportes.component').then(m => m.AdminReportesComponent) 
      },
    ]
  },

  // Redirección para rutas inexistentes (SIEMPRE debe ir al final)
  { path: '**', redirectTo: '' }

];