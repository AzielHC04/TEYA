import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/service/notification.service';

@Component({
  selector: 'app-notificacion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-modal.component.html',
  styleUrls: ['./notificacion-modal.component.css']
})
export class NotificacionModalComponent {
  public notificacionService = inject(NotificationService);
}