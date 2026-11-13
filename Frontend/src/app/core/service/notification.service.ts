import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'info' | 'confirmacion';

export interface DatosNotificacion {
  visible: boolean;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  textoBoton: string;
  textoCancelar?: string;
  onConfirmar?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private timerCierre?: any;

  public estado = signal<DatosNotificacion>({
    visible: false,
    titulo: '',
    mensaje: '',
    tipo: 'exito',
    textoBoton: 'Aceptar'
  });

  mostrarExito(titulo: string, mensaje: string, autoCerrarMs: number = 2800): void {
    this.abrir(titulo, mensaje, 'exito', 'Entendido', autoCerrarMs);
  }

  mostrarError(titulo: string, mensaje: string): void {
    this.abrir(titulo, mensaje, 'error', 'Cerrar', 0);
  }

  mostrarInfo(titulo: string, mensaje: string, autoCerrarMs: number = 3000): void {
    this.abrir(titulo, mensaje, 'info', 'Aceptar', autoCerrarMs);
  }

  confirmar(
    titulo: string,
    mensaje: string,
    onConfirmar: () => void,
    textoConfirmar: string = 'Sí, eliminar',
    textoCancelar: string = 'Cancelar'
  ): void {
    if (this.timerCierre) {
      clearTimeout(this.timerCierre);
    }

    this.estado.set({
      visible: true,
      titulo,
      mensaje,
      tipo: 'confirmacion',
      textoBoton: textoConfirmar,
      textoCancelar,
      onConfirmar
    });
  }

  aceptarConfirmacion(): void {
    const accion = this.estado().onConfirmar;
    this.cerrar();
    if (accion) {
      accion();
    }
  }

  private abrir(
    titulo: string,
    mensaje: string,
    tipo: TipoNotificacion,
    textoBoton: string,
    autoCerrarMs: number
  ): void {
    if (this.timerCierre) {
      clearTimeout(this.timerCierre);
    }

    this.estado.set({
      visible: true,
      titulo,
      mensaje,
      tipo,
      textoBoton
    });

    if (autoCerrarMs > 0) {
      this.timerCierre = setTimeout(() => {
        this.cerrar();
      }, autoCerrarMs);
    }
  }

  cerrar(): void {
    if (this.timerCierre) {
      clearTimeout(this.timerCierre);
    }
    this.estado.update((actual) => ({
      ...actual,
      visible: false,
      onConfirmar: undefined
    }));
  }
}