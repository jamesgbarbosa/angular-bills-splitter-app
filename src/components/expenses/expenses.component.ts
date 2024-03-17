import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Expense } from '../../model/expenses.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
  
  @Input() data: Expense[] | any;
  @Output() onDeleteExpense = new EventEmitter<string>();
  @Output() onEditExpense = new EventEmitter<string>();

  deleteExpense(id: string) {
    this.onDeleteExpense.emit(id);
  }

  editExpense(id: string) {
    this.onEditExpense.emit(id);
  }
}
