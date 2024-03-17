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
  usersWithDebts: User[] = [];
  title = 'Settle Payment'

  constructor(public dialogRef: MatDialogRef<SettlePaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
    this.usersWithDebts = data.usersWithDebts;
    this.title = this.getTitleByMode(data.mode);
    let expense = data.expense;

    this.form = this.fb.group({
      userId: [expense?.paidBy?.id ?? '', Validators.required],
      settlementTo: [expense?.settlementTo ?? '', Validators.required],
      settlementToList: [expense?.paidBy?.id ? this._initSettlementToListBySelectedUserId(expense?.paidBy?.id) : []],
      amountPaid: [expense?.amountPaid ?? 0, [Validators.required, Validators.min(0.1)]]
    })
  }

  onChangeUser(event: any) {
    this.form.get('settlementToList').setValue(this._initSettlementToListBySelectedUserId(event.target.value))
  }

  _initSettlementToListBySelectedUserId(id: string) {
    let debts = this.usersWithDebts.find(it => it.id == id)?.debts;
    if (debts) {
      let settlementToMap = Object.entries(debts).map(([key, value]) => {
        let user = this.data.users.find((it:any) => (it.id == key))
        return {id: key, name: user.name, debt: Math.abs(value as number)}
      })
      return settlementToMap
    }
    return [];
  }

  onChangeSettlementTo(event: any) {
    let maxDebt = Math.abs((this.form.get('settlementToList').value).find((it: any) => it.id == event.target.value).debt)
    this.form.get('amountPaid').setValidators([Validators.required, Validators.min(0.1), Validators.max(maxDebt)])
    this.form.get('amountPaid').updateValueAndValidity();
    this.form.get('amountPaid').setValue(maxDebt)
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
