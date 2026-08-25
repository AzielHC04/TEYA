import { Component } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';


@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './navbar.component.html',

  styleUrl: './navbar.component.css'
})


export class NavbarComponent {

  /*
   * Controla si el menú de Productos
   * está abierto.
   *
   * false = cerrado
   * true  = abierto
   */
  productosAbierto: boolean = false;


  /*
   * Abre o cierra el menú
   * cuando el usuario hace clic
   * en "Productos".
   */
  toggleProductos(): void {

    this.productosAbierto =
      !this.productosAbierto;

  }


  /*
   * Cierra el menú cuando
   * el usuario selecciona
   * una categoría.
   */
  cerrarProductos(): void {

    this.productosAbierto = false;

  }

}