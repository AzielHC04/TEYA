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
  FormsModule,
  Validators
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';

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
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private cartSub?: Subscription;
  private formSub?: Subscription;

  carrito: CartItem[] = [];
  total: number = 0;
  direccionGuardada: boolean = false;

  // Direcciones guardadas del perfil del usuario
  direccionesGuardadasUsuario: any[] = [];
  direccionSeleccionadaId: string = '';

  estados: string[] = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  direccionForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    calle: ['', Validators.required],
    numero: ['S/N'],
    interior: [''],
    colonia: ['', Validators.required],
    ciudad: ['', Validators.required],
    estado: ['', Validators.required],
    codigoPostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    referencias: ['']
  });

  ngOnInit(): void {
    this.cartSub = this.cartService.cartItems$.subscribe({
      next: (items: CartItem[]) => {
        this.carrito = [...items];
        this.calcularTotal();
      },
      error: (error) => console.error('Error al recibir el carrito:', error)
    });

    if (isPlatformBrowser(this.platformId)) {
      this.cargarDatosUsuarioLogueado();
      this.cargarDireccionesGuardadas();
    }

    this.formSub = this.direccionForm.valueChanges.subscribe(() => {
      // Si el usuario edita el formulario manualmente, desmarcamos la selección previa
      if (!this.direccionSeleccionadaId) {
        this.direccionGuardada = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.formSub?.unsubscribe();
  }

  get cantidadProductos(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  calcularTotal(): void {
    this.total = this.carrito.reduce((acumulado, item) => {
      const precio = Number(item.producto.precio) || 0;
      const cantidad = Number(item.cantidad) || 0;
      return acumulado + (precio * cantidad);
    }, 0);
  }

  aumentarCantidad(item: CartItem): void {
    const res = this.cartService.actualizarCantidad(item.producto.id, item.cantidad + 1, item.producto.stock);
    if (!res.exito) alert(res.mensaje);
  }

  disminuirCantidad(item: CartItem): void {
    if (item.cantidad <= 1) return;
    const res = this.cartService.actualizarCantidad(item.producto.id, item.cantidad - 1, item.producto.stock);
    if (!res.exito) alert(res.mensaje);
  }

  eliminarItem(item: CartItem): void {
    if (confirm(`¿Deseas eliminar "${item.producto.nombre}" del carrito?`)) {
      const res = this.cartService.removerItem(item.producto.id);
      if (!res.exito) alert(res.mensaje);
    }
  }

  vaciarCarrito(): void {
    if (this.carrito.length === 0) return;
    if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
      this.cartService.limpiarCarrito();
    }
  }

  campoInvalido(nombre: string): boolean {
    const campo = this.direccionForm.get(nombre);
    return !!(campo && campo.invalid && (campo.touched || campo.dirty));
  }

  // Pre-llenar correo y nombre si el usuario inició sesión
  cargarDatosUsuarioLogueado(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) return;
    try {
      const u = JSON.parse(usuarioGuardado);
      const datos = u.usuario || u.user || u;
      this.direccionForm.patchValue({
        correo: datos.correo || datos.email || '',
        nombre: [datos.nombre, datos.apellidos].filter(Boolean).join(' ') || datos.nombreCompleto || '',
        telefono: datos.telefono || datos.phone || ''
      }, { emitEvent: false });
    } catch {}
  }

  // Cargar lista de direcciones guardadas del backend
  cargarDireccionesGuardadas(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const usuarioGuardado = localStorage.getItem('usuario');
    let userId = '';
    if (usuarioGuardado) {
      try {
        const u = JSON.parse(usuarioGuardado);
        userId = u.id || u.usuario?.id || u.user?.id || '';
      } catch {}
    }

    if (!userId) return;

    this.http.get<any[]>(`http://localhost:3000/api/addresses/user/${userId}`).subscribe({
      next: (direcciones) => {
        this.direccionesGuardadasUsuario = direcciones || [];
        // Autoseleccionar la dirección principal si existe
        if (this.direccionesGuardadasUsuario.length > 0) {
          const principal = this.direccionesGuardadasUsuario.find(d => d.esPrincipal) || this.direccionesGuardadasUsuario[0];
          this.aplicarDireccionGuardada(principal);
        }
      },
      error: (err) => console.error('Error al cargar direcciones desde el servidor:', err)
    });
  }

  // Selección manual en el menú desplegable
  seleccionarDireccionGuardada(event: any): void {
    const direccionId = event.target.value;
    this.direccionSeleccionadaId = direccionId;

    if (!direccionId) {
      this.direccionGuardada = false;
      return;
    }

    const encontrada = this.direccionesGuardadasUsuario.find(d => d.id === direccionId);
    if (encontrada) {
      this.aplicarDireccionGuardada(encontrada);
    }
  }

  private aplicarDireccionGuardada(dir: any): void {
    this.direccionSeleccionadaId = dir.id;
    this.direccionForm.patchValue({
      calle: dir.calle || '',
      numero: dir.numero || 'S/N',
      colonia: dir.colonia || '',
      ciudad: dir.ciudad || '',
      estado: dir.estado || '',
      codigoPostal: dir.codigoPostal || ''
    }, { emitEvent: false });

    this.direccionGuardada = true;
  }

  // Guardar una nueva dirección introducida en el formulario
  guardarDireccion(): void {
    if (this.direccionForm.invalid) {
      this.direccionForm.markAllAsTouched();
      alert('Por favor, completa todos los campos obligatorios del formulario.');
      return;
    }

    const usuarioGuardado = localStorage.getItem('usuario');
    let userId = '';
    if (usuarioGuardado) {
      try {
        const u = JSON.parse(usuarioGuardado);
        userId = u.id || u.usuario?.id || u.user?.id || '';
      } catch {}
    }

    if (!userId) {
      alert('Debes iniciar sesión para guardar tu dirección.');
      this.router.navigate(['/login']);
      return;
    }

    const formValues = this.direccionForm.getRawValue();
    const payload = {
      userId,
      calle: formValues.calle,
      colonia: formValues.colonia,
      ciudad: formValues.ciudad,
      estado: formValues.estado,
      codigoPostal: formValues.codigoPostal,
      esPrincipal: false
    };

    this.http.post('http://localhost:3000/api/addresses', payload).subscribe({
      next: () => {
        this.direccionGuardada = true;
        alert('¡Dirección guardada correctamente en tu cuenta!');
        this.cargarDireccionesGuardadas();
      },
      error: (err) => {
        console.error('Error al guardar dirección:', err);
        alert('No se pudo guardar la dirección en el servidor.');
      }
    });
  }

  // PROCEDER AL PAGO Y REDIRIGIR A MIS PEDIDOS (/orders) O A CLIP
  procederAlPago(): void {
    if (this.carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega productos para continuar.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) return;

    const usuarioGuardado = localStorage.getItem('usuario');
    let userId = '';
    if (usuarioGuardado) {
      try {
        const u = JSON.parse(usuarioGuardado);
        userId = u.id || u.usuario?.id || u.user?.id || '';
      } catch {}
    }

    if (!userId) {
      alert('Para realizar tu compra, primero debes iniciar sesión.');
      this.router.navigate(['/login']);
      return;
    }

    const tieneDireccionValida = this.direccionGuardada || (this.direccionSeleccionadaId !== '') || this.direccionForm.valid;

    if (!tieneDireccionValida) {
      this.direccionForm.markAllAsTouched();
      alert('Por favor selecciona una dirección guardada o completa los datos del formulario de entrega.');
      return;
    }

    const payload = {
      userId: userId,
      items: this.carrito.map(item => ({
        productId: item.producto.id,
        quantity: item.cantidad,
        price: Number(item.producto.precio)
      })),
      total: this.total
    };

    // Petición al backend NestJS para registrar la orden e iniciar cobro
    this.http.post('http://localhost:3000/api/orders', payload).subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta del servidor de órdenes:', respuesta);

        // Limpiar el carrito local
        this.cartService.limpiarCarrito();

        // 1. Redirigir a Clip si existe enlace oficial de pago
        if (respuesta.paymentUrl && typeof respuesta.paymentUrl === 'string' && respuesta.paymentUrl.startsWith('http')) {
          window.location.href = respuesta.paymentUrl;
        } else {
          // 2. Si no hay redirección externa de Clip, notificar y llevar directamente a /orders
          alert('¡Pedido registrado correctamente! Redirigiendo a tus pedidos...');
          this.router.navigate(['/orders']);
        }
      },
      error: (err) => {
        console.error('Error al procesar la orden:', err);
        alert(err.error?.message || 'Ocurrió un error al procesar tu pedido. Por favor intenta de nuevo.');
      }
    });
  }
}