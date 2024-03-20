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
  creditObj = {};

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
      credits: this.fb.array([])
    })
    this.initCreditObject(defaultUser.id)
  }

  ngOnInit(): void {
  }

  get creditArray() {
    return this.form.get('credits') as FormArray
  }

  addCredit(id: string, amount: string) {
    const user = this.data.users.find((it: any) => it.id == id)
    const creditFg = this.fb.group({
      id: [user?.id],
      userName: [user?.name],
      amount: [amount],
    })
    if (this.form.get('userId').value == id) {
      creditFg.disable();
    }
    this.creditArray.push(creditFg)
  }

  onUserChange(event: any) {
    const id = event.target.value;
    const user = this.data.users.find((it: User) => it.id == id)
    this.form.get('userName').setValue(user.name);
    this.initCreditObject(id)
  }

  initCreditObject(id: string) {
    this.creditArray.clear();
    [...this.data.users].sort((a, b) => (a.id == id ? -1 : 1)
    ).forEach((user: User | any) => {
      this.addCredit(user.id, "0")
    })
  }

  get totalCredit() {
    return this.creditArray.value.filter((it: any) => (it.userId != this.form.get('userName').value)).reduce((total: number, obj: any) => {
      return total + +obj.amount;
    }, 0)
  }

  get isCreditMapValueEqualAmountPaid() {
    return this.form.get('transactionType').value == 'CUSTOM' && this.totalCredit == +this.form.get('amountPaid').value
  }


  get isCreditMapExceedsAmountPaid() {
     return this.form.get('transactionType').value == 'CUSTOM' && this.totalCredit > +this.form.get('amountPaid').value 
  }

  get validateCustomCredit() {
    const transactionType = this.form.get('transactionType').value
    if (transactionType == 'CUSTOM') {
      return this.isCreditMapValueEqualAmountPaid;
    } else {
      return true;
    }
  }

  close(bool = false) {
    this.dialogRef.close(bool);
  }

  add() {
    console.log(this.initCredit())
    let obj = this.form.value;
    delete obj['credits']
    obj['credit'] = this.initCredit();
    this.dialogRef.close(obj)
  }

  onAmountPaidChange(event: any) {
    const amount = event.target.value;
    // this.form.get('userName').value
    const control = this.creditArray.at(0).get('amount') as FormControl;
    if (control) {
      control.setValue(amount);
    }
  }

  initCredit() {
    const userId = this.form.get('userId').value;
    const obj = this.creditArray.value.reduce((obj: any, it: any) => {
      return {
        ...obj,
        [it.id] : -Math.abs(+it.amount)
      }
    }, {})
    obj[userId] = +this.form.get('amountPaid').value;
    return obj;
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
