import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent {
  @Input() userData: any;
  @Output() onAddTransaction = new EventEmitter<any>();

  addTransaction() {
    this.onAddTransaction.emit();
  }
}