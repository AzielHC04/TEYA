import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PasoProceso {
  paso: string;
  titulo: string;
  descripcion: string;
  icono: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NosotrosComponent {

  pasosElaboracion: PasoProceso[] = [
    {
      paso: '01',
      titulo: 'Selección Botánica',
      descripcion: 'Recolectamos materias primas orgánicas y extractos vegetales bioactivos seleccionados bajo rigurosos estándares de calidad.',
      icono: '🌱'
    },
    {
      paso: '02',
      titulo: 'Bio-Fermentación Controlada',
      descripcion: 'Sometemos los insumos a procesos de fermentación biológica con microorganismos benéficos para maximizar la absorción de nutrientes.',
      icono: '🧪'
    },
    {
      paso: '03',
      titulo: 'Enriquecimiento Mineral',
      descripcion: 'Añadimos elementos clave (Calcio, Magnesio y Potasio) en formas quelatadas solubles, garantizando alta disponibilidad para la planta.',
      icono: '🔬'
    },
    {
      paso: '04',
      titulo: 'Control y Envasado',
      descripcion: 'Filtrado fino y envasado en recipientes de alta densidad para proteger la estabilidad biológica del producto hasta su aplicación.',
      icono: '📦'
    }
  ];

}