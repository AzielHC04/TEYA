
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  CartService,
  CartItem
} from '../../core/service/cart.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);

  private cartSub?: Subscription;
  private formSub?: Subscription;

  carrito: CartItem[] = [];
  total: number = 0;
  direccionGuardada: boolean = false;

  estados: string[] = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Coahuila',
    'Colima',
    'Durango',
    'Estado de México',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas'
  ];


  direccionForm = this.fb.group({
    correo: ['', [
      Validators.required,
      Validators.email
    ]],

    nombre: ['', [
      Validators.required,
      Validators.minLength(3)
    ]],

    telefono: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]],

    calle: ['', Validators.required],
    numero: ['', Validators.required],
    interior: [''],
    colonia: ['', Validators.required],
    ciudad: ['', Validators.required],
    estado: ['', Validators.required],

    codigoPostal: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{5}$/)
    ]],

    referencias: ['']
  });

  // INICIALIZACIÓN
  ngOnInit(): void {

    // Escuchamos los productos del carrito real.
    this.cartSub = this.cartService.cartItems$.subscribe({
      next: (items: CartItem[]) => {

        this.carrito = [...items];

        this.calcularTotal();

        console.log(
          'Carrito KABNIA actualizado:',
          this.carrito
        );
      },

      error: (error) => {
        console.error(
          'Error al recibir el carrito:',
          error
        );
      }
    });

    // Recuperar dirección guardada.
    if (isPlatformBrowser(this.platformId)) {
      this.cargarDireccion();
    }

    // Detectar modificaciones en el formulario.
    this.formSub = this.direccionForm.valueChanges.subscribe(() => {
      this.direccionGuardada = false;
    });
  }

  // LIBERAR SUSCRIPCIONES
  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.formSub?.unsubscribe();
  }

  // CANTIDAD TOTAL DE PRODUCTOS
  get cantidadProductos(): number {
    return this.carrito.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }


  calcularTotal(): void {

    this.total = this.carrito.reduce(
      (acumulado, item) => {

        const precio = Number(item.producto.precio) || 0;
        const cantidad = Number(item.cantidad) || 0;

        return acumulado + (precio * cantidad);
      },
      0
    );
  }

  // AUMENTAR CANTIDAD
  aumentarCantidad(item: CartItem): void {

    const nuevaCantidad = item.cantidad + 1;

    const stockMaximo = item.producto.stock;

    const resultado = this.cartService.actualizarCantidad(
      item.producto.id,
      nuevaCantidad,
      stockMaximo
    );

    if (!resultado.exito) {
      alert(resultado.mensaje);
    }
  }

  // DISMINUIR CANTIDAD
  disminuirCantidad(item: CartItem): void {

    if (item.cantidad <= 1) {
      return;
    }

    const nuevaCantidad = item.cantidad - 1;
    const stockMaximo = item.producto.stock;

    const resultado = this.cartService.actualizarCantidad(
      item.producto.id,
      nuevaCantidad,
      stockMaximo
    );

    if (!resultado.exito) {
      alert(resultado.mensaje);
    }
  }

  // ELIMINAR UN PRODUCTO
  eliminarItem(item: CartItem): void {

    const confirmar = confirm(
      `¿Deseas eliminar "${item.producto.nombre}" del carrito?`
    );

    if (!confirmar) {
      return;
    }

    const resultado = this.cartService.removerItem(
      item.producto.id
    );

    if (!resultado.exito) {
      alert(resultado.mensaje);
    }
  }

  // VACIAR TODO EL CARRITO
  vaciarCarrito(): void {

    if (this.carrito.length === 0) {
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que deseas vaciar tu carrito?'
    );

    if (!confirmar) {
      return;
    }

    this.cartService.limpiarCarrito();
  }

  // VALIDAR CAMPOS DEL FORMULARIO
  campoInvalido(nombre: string): boolean {

    const campo = this.direccionForm.get(nombre);

    return !!(
      campo &&
      campo.invalid &&
      (campo.touched || campo.dirty)
    );
  }

  // GUARDAR DIRECCIÓN DE ENTREGA
  guardarDireccion(): void {

    if (this.direccionForm.invalid) {

      this.direccionForm.markAllAsTouched();

      alert(
        'Por favor, completa correctamente todos los campos obligatorios.'
      );

      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const direccion = this.direccionForm.getRawValue();

    const correo = (direccion.correo || '')
      .trim()
      .toLowerCase();

    const datosDireccion = {
      ...direccion,
      correo
    };

    localStorage.setItem(
      'direccion_kabnia',
      JSON.stringify(datosDireccion)
    );

    this.direccionForm.patchValue(
      { correo },
      { emitEvent: false }
    );

    this.direccionGuardada = true;

    alert(
      '¡Tus datos de entrega se guardaron correctamente!'
    );
  }

  // CARGAR DIRECCIÓN GUARDADA
  cargarDireccion(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const guardado = localStorage.getItem(
      'direccion_kabnia'
    );

    if (!guardado) {
      return;
    }

    try {

      const datos = JSON.parse(guardado);

      if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        return;
      }

      this.direccionForm.patchValue(
        datos,
        { emitEvent: false }
      );

      this.direccionGuardada = this.direccionForm.valid;

    } catch (error) {

      console.error(
        'Error al recuperar la dirección:',
        error
      );

      this.direccionGuardada = false;
    }
  }

  // PROCEDER AL PAGO
  procederAlPago(): void {

    // Validar que existan productos.
    if (this.carrito.length === 0) {

      alert(
        'Tu carrito está vacío. Agrega productos para continuar.'
      );

      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Comprobar sesión.
    const usuarioGuardado = localStorage.getItem('usuario');

    let usuarioValido = false;

    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);

        usuarioValido = (
          usuario !== null &&
          typeof usuario === 'object' &&
          !Array.isArray(usuario)
        );
      } catch {
        usuarioValido = false;
      }
    }

    if (!usuarioValido) {

      alert(
        'Para realizar tu compra, primero debes iniciar sesión o registrarte.'
      );

      this.router.navigate(['/login']);

      return;
    }

    // Comprobar dirección.
    if (
      !this.direccionGuardada ||
      this.direccionForm.invalid
    ) {

      this.direccionForm.markAllAsTouched();

      alert(
        'Debes completar y guardar una dirección válida antes de pagar.'
      );

      return;
    }

    // Navegar al checkout.
    this.router.navigate(['/checkout']);
  }
}
