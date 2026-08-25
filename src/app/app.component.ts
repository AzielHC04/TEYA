import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import {ProductsComponent} from "./pages/products/products.component";
import { CarritoComponent } from './pages/carrito/carrito.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, HomeComponent, ProductsComponent, CarritoComponent, NosotrosComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TEYA';
}
