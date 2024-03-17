import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-settle-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settle-payment-modal.component.html',
  styleUrl: './settle-payment-modal.component.scss'
})
export class SettlePaymentModalComponent {
  form: FormGroup | any;
  title = 'Settle Payment'

  constructor(public dialogRef: MatDialogRef<SettlePaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
    this.title = this.getTitleByMode(data.mode);
    let expense = data.expense;
    expense = {...expense, settlementName:  expense?.settlementTo ? this._findUserBy(expense?.settlementTo)?.name : ''}
    this.form = this.fb.group({
      userId: [expense?.paidBy?.id ?? '', Validators.required],
      userName: [expense?.paidBy?.name ?? ''],
      settlementTo: [expense?.settlementTo ?? '', Validators.required],
      settlementToName: [expense?.settlementName ?? ''],
      settlementToList: [expense?.paidBy?.id ? this._initSettlementToListBySelectedUserId(expense?.paidBy?.id) : []],
      amountPaid: [expense?.amountPaid ?? 0, [Validators.required, Validators.min(0.1)]],
      debt: []
    })
    if (expense?.settlementTo) {
      this.updateAmountPaidValidation(expense?.settlementTo)
    }
  }

  get usersWithDebts(): User[] {
    return this.data.users.filter((it: any) => (it?.debts && Object.keys(it?.debts).length > 0));
  }

  onChangeUser(event: any) {
    let user = this._findUserBy(event.target.value);
    this.form.get('userName').setValue(user.name)
    this.form.get('settlementToList').setValue(this._initSettlementToListBySelectedUserId(event.target.value))
  }

  _initSettlementToListBySelectedUserId(id: string) {
    let debts = this.usersWithDebts.find(it => it.id == id)?.debts;
    if (debts) {
      let settlementToMap = Object.entries(debts).map(([key, value]) => {
        let user = this._findUserBy(key);
        return {id: key, name: user.name, debt: Math.abs(value as number)}
      })
      return settlementToMap
    }
    return [];
  }

  _findUserBy(id: any) {
    return this.data.users.find((it:any) => (it.id == id))
  }

  onChangeSettlementTo(event: any) {
    let user = this._findUserBy(event.target.value);
    this.form.get('settlementToName').setValue(user.name)
    this.updateAmountPaidValidation(event.target.value)
  }

  updateAmountPaidValidation(userId: any) {
    let maxDebt = Math.abs((this.form.get('settlementToList').value).find((it: any) => it.id == userId).debt)
    this.form.get('debt').setValue(maxDebt);
    this.form.get('amountPaid').setValidators([Validators.required, Validators.min(0.1), Validators.max(maxDebt)])
    this.form.get('amountPaid').updateValueAndValidity();
    this.form.get('amountPaid').setValue(maxDebt)
  }

  get debtInfoMessage() {
    const settlementToName = this.form.get('settlementToName').value;
    return settlementToName ? `(${this.form.get('userName').value} owes ${settlementToName} $${this.form.get('debt').value})` : '';
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  settle() {
    this.dialogRef.close(this.form.value)
  }

  getTitleByMode(mode: string): string {
    switch (mode) {
      case "ADD": {
        return 'Settle Payment';
      }
      case "EDIT": {
        return 'Edit Settle Payment';
      }
      case "DELETE": {
        return 'Delete Settlement';
      }
      default: {
        return 'Settle Payment'
      }
    }
  }
}
