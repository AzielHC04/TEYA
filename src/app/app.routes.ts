import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component'; // Ajusta la ruta según tu estructura de carpetas

export const routes: Routes = [
  // Ruta predeterminada (Página de inicio)
  { path: '', component: HomeComponent },
  
  // Opcional: redirección o ruta explícita /home
  { path: 'home', component: HomeComponent },

  // Comodín para redirigir si escriben una URL inexistente
  { path: '**', redirectTo: '' }
];