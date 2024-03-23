import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
import { Expense } from '../../model/expenses.model';
@Component({
  selector: 'app-cexpense-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './expense-details-modal.component.html',
  styleUrl: './expense-details-modal.component.scss'
})
export class ExpenseDetailsModalComponent implements OnInit {
  expense: Expense = <any>[];
  totalCredit = 0
  constructor(public dialogRef: MatDialogRef<ExpenseDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
        this.expense = data.expense;
        this.totalCredit = data.expense.credit.reduce((total:number, it:any) => (+total + +it.amount),0)
  }


  ngOnInit(): void {

  }

  close() {
    this.dialogRef.close();
  }
}
