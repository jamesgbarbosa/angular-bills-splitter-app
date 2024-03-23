import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Expense } from '../../model/expenses.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit {
  @Input() data: Expense[] | any;
  @Output() onDeleteExpense = new EventEmitter<string>();
  @Output() onEditExpense = new EventEmitter<string>();
  @Output() onRowClick = new EventEmitter<Expense>();
  expenses: any = [];

  deleteExpense(event: Event, id: string) {
    event.stopPropagation();
    this.onDeleteExpense.emit(id);
  }

  editExpense(event: Event, id: string) {
    event.stopPropagation();
    this.onEditExpense.emit(id);
  }

  ngOnInit(): void {
   
  }

  clickRow(expense: Expense) {
    this.onRowClick.emit(expense);
  }
}
