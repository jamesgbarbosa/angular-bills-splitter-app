import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Expense } from '../../model/expenses.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnChanges {
  
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data) {
      this.data = this.data?.map((it: Expense) => ({
        ...it, action: `${it.paidBy.name} paid ( ${it.transactionType})`
      }))
    }
  }
}
