import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './expense-modal.component.html',
  styleUrl: './expense-modal.component.scss'
})
export class ExpenseModalComponent implements OnInit {
  form: FormGroup | any;
  transactionTypes: any;
  title = 'New Expense'
  
  constructor(public dialogRef: MatDialogRef<ExpenseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
    let defaultUser = data.users.length > 0 ? data.users[0].id : null;
    this.title = this.getTitleByMode(data.mode);
    this.transactionTypes = data.transactionTypes;
    let expense = data.expense;
    this.form = this.fb.group({
      userId: [expense?.paidBy?.id ?? defaultUser, Validators.required],
      name: [expense?.name ?? '', Validators.required],
      transactionType: [expense?.transactionType ?? this.transactionTypes[0].id, Validators.required],
      amountPaid: [expense?.amountPaid ?? 0, [Validators.required, Validators.min(1)]]
    })
  }

  ngOnInit(): void {
  }

  close(bool = false) {
    this.dialogRef.close(bool);
  }

  add() {
    this.dialogRef.close(this.form.value)
  }

  getTitleByMode(mode: string): string {
    switch (mode) {
      case "ADD": {
        return 'New Expense';
      }
      case "EDIT": {
        return 'Update Expense';
      }
      case "DELETE": {
        return 'Delete Expense';
      }
      default: {
        return 'New Expense'
      }
    }
  }

}
