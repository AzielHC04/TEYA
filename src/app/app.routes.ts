import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component'; // Ajusta la ruta según tu estructura de carpetas
import {ProductsComponent} from "./pages/products/products.component";

export const routes: Routes = [
  // Ruta predeterminada (Página de inicio)
  { path: '', component: HomeComponent },
  
  // Ruta para la página de productos
  { path: 'products', component: ProductsComponent },


  // Comodín para redirigir si escriben una URL inexistente
  { path: '**', redirectTo: '' }
];