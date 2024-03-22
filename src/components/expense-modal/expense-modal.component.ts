import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
import { User } from '../../model/user.model';
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
    let defaultUser = data.users.length > 0 ? data.users[0] : null;
    this.title = this.getTitleByMode(data.mode);
    this.transactionTypes = data.transactionTypes;
    let expense = data.expense;
    this.form = this.fb.group({
      userId: [expense?.paidBy?.id ?? defaultUser.id, Validators.required],
      userName: [expense?.paidBy?.name ?? defaultUser.name],
      name: [expense?.name ?? '', Validators.required],
      transactionType: [expense?.transactionType ?? this.transactionTypes[0].id, Validators.required],
      amountPaid: [expense?.amountPaid ?? 0, [Validators.required, Validators.min(1)]],
    })

    if (this.data.users.length > 1) {
      this.form.addControl('credit', this.fb.array([]))
    }

    this.bindCreditToCreditArray(defaultUser.id)
  }

  ngOnInit(): void {
    
  }

  get creditArray() {
    return this.form.get('credit') as FormArray
  }

  addCredit(id: string, amount: string) {
    const user = this.data.users.find((it: any) => it.id == id)
    const creditFg = this.fb.group({
      id: [user?.id],
      userName: [user?.name],
      amount: [amount],
    })
    this.creditArray.push(creditFg)
  }

  onUserChange(event: any) {
    const id = event.target.value;
    const user = this.data.users.find((it: User) => it.id == id)
    this.form.get('userName').setValue(user.name);
    this.bindCreditToCreditArray(id)
  }

  bindCreditToCreditArray(id: string) {
    const existingExpense = this.data?.expense?.credit;
    this.creditArray.clear();
    [...this.data.users].filter((it) => it.id != id)
    .forEach((user: User | any) => {
      this.addCredit(user.id, existingExpense ? Math.abs(existingExpense[user.id])+"" : "0")
    })
  }

  get totalCredit() {
    return +this.creditArray.value.reduce((total: number, obj: any) => {
      return total + +obj.amount;
    }, 0).toFixed(2)
  }

  get isCreditMapValueEqualAmountPaid() {
    return this.form.get('transactionType').value == 'OWED_FULL_AMOUNT_CUSTOM' && this.totalCredit == +this.form.get('amountPaid').value
  }


  get isCreditMapExceedsAmountPaid() {
     return this.form.get('transactionType').value == 'OWED_FULL_AMOUNT_CUSTOM' && this.totalCredit > +this.form.get('amountPaid').value 
  }

  get validateCustomCredit() {
    const transactionType = this.form.get('transactionType').value
    if (transactionType == 'OWED_FULL_AMOUNT_CUSTOM') {
      return this.isCreditMapValueEqualAmountPaid;
    } else {
      return true;
    }
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
