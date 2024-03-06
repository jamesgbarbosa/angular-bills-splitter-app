import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbsPipe } from '../../pipes/abs.pipe';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [AbsPipe, CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent {
  @Input() userData: any;
  @Output() onAddTransaction = new EventEmitter<any>();
  @Output() onSettlePayment = new EventEmitter<any>();

  addTransaction() {
    this.onAddTransaction.emit();
  }

  settlePayment() {
    this.onSettlePayment.emit();
  }
}
