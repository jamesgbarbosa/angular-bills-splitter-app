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
    expense = { ...expense, settlementName: expense?.settlementTo ? this._findUserBy(expense?.settlementTo)?.name : '' }
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

  get previousUsersState(): User[] {
    return this.data.previousUsersState;
  }

  get currentUsersState(): User[] {
    return this.data.currentUsersState;
  }

  onChangeWhoPaid(event: any) {
    let user = this._findUserBy(event.target.value);
    this.form.get('userName').setValue(user?.name)
    this.form.get('settlementTo').setValue('')
    this.form.get('settlementToName').setValue('')
    this._resetAmountPaidToZero();
    this.form.get('settlementToList').setValue(this._initSettlementToListBySelectedUserId(event.target.value))
  }

  onChangeSettlementTo(event: any) {
    let user = this._findUserBy(event.target.value);
    this.form.get('settlementToName').setValue(user?.name)
    this.updateAmountPaidValidation(event.target.value)
    this._resetAmountPaidToZero();
  }

  _resetAmountPaidToZero() {
    this.form.get('amountPaid').setValue(0);
    this.form.markAsPristine();
  }

  _initSettlementToListBySelectedUserId(id: string) {
    return this.previousUsersState.filter(it => it.id != id).map((user: User) => ({ ...user, debtInfo: `(is owed $${this.getDebt(id, user.id)})` }))
  }

  _findUserBy(id: any) {
    return this.previousUsersState.find((it: any) => (it.id == id))
  }

  updateAmountPaidValidation(userId: any) {
    this.form.get('debt').setValue(this.getDebt(this.form.get('userId').value, userId));
    this.form.get('amountPaid').setValidators([Validators.required, Validators.min(0.1)])
    this.form.get('amountPaid').updateValueAndValidity();
  }

  getUserDebtByUserid(whoPaidUser: any, settlementToId: any) {
    let debt = whoPaidUser?.debts.hasOwnProperty(settlementToId) ? whoPaidUser.debts[settlementToId] : 0;
    return Math.abs(+debt);
  }

  getUserIsOwedByUserid(whoPaidUser: any, settlementToId: any) {
    let owed = whoPaidUser?.isOwed.hasOwnProperty(this.form.get('settlementTo').value) ? whoPaidUser.isOwed[this.form.get('settlementTo').value] : 0;
    return Math.abs(+owed);
  }

  getInfoMessagesVariables(usersSource: User[]) {
    const whoPaidUser = usersSource.find(it => it.id == (this.form.get('userId').value))
    let debt = this.getUserDebtByUserid(whoPaidUser, this.form.get('settlementTo').value)
    let owed = this.getUserIsOwedByUserid(whoPaidUser, this.form.get('settlementTo').value)

    const settlementToName = this.form.get('settlementToName').value;
    const amountToPay = +this.form.get('amountPaid').value;
    return { whoPaidUser, settlementToName, debt, owed, amountToPay }
  }

  get settlementInfoMessages() {
    const { whoPaidUser, settlementToName, debt, owed, amountToPay } = this.getInfoMessagesVariables(this.previousUsersState);
    let messages = []
    if (this.data.mode == 'ADD') {
      if (settlementToName && whoPaidUser) {
        const remainder = Math.abs(amountToPay - debt).toFixed(2);
        if (amountToPay > 0) {
          if (debt > 0 && amountToPay < debt) {
            messages.push(`${whoPaidUser.name} owe ${settlementToName} $${remainder} debt`)
          } else if (amountToPay == debt) {
            messages.push(`${whoPaidUser.name} is settling debt full amount to ${settlementToName}`)
          } else {
            if (debt == 0) {
              messages.push(`${settlementToName} owes ${whoPaidUser.name} $${remainder}`)
            } else {
              messages.push(`Debt paid and ${settlementToName} now owes ${whoPaidUser.name} $${remainder}`)
            }
          }
        }
      }
    }

    if (this.data.mode == 'EDIT') {
      messages = [...this.initEditModalInfoMessages()]
    }
    return messages;
  }

  initEditModalInfoMessages() {
    const { whoPaidUser, settlementToName, debt, owed, amountToPay } = this.getInfoMessagesVariables(this.previousUsersState);
    const messages: string[] = []
    if (whoPaidUser) {
      // messages.push(`${whoPaidUser.name} owes ${settlementToName} $${owed}`)
      if (debt > 0) {
        let remainder = +(debt - amountToPay).toFixed(2);
        if (0 == remainder) {
          messages.push(`${whoPaidUser.name} is paying full debt to ${settlementToName}`)
        } else if (debt > amountToPay) {
          messages.push(`${whoPaidUser.name} owes ${settlementToName} $${remainder}`)
        } else if (debt < amountToPay) {
          messages.push(`Debt paid and ${settlementToName} now owes ${whoPaidUser.name} $${Math.abs(remainder)}`)
        }
      } else if (owed >= 0) {
        this._isOwedMessages(messages)
      }
    }
    return messages;
  }

  _isOwedMessages(messages: any) {
    const { whoPaidUser, settlementToName, debt, owed, amountToPay } = this.getInfoMessagesVariables(this.currentUsersState);
    const amountPreviouslyPaid = +(+this.data.expense?.amountPaid).toFixed(2)
    let remainder = owed - amountPreviouslyPaid + amountToPay;
    if (whoPaidUser) {
      if (amountToPay > 0) {
        messages.push(`${settlementToName} owes ${whoPaidUser.name} $${remainder}`)
      } 
    }
  }

  getDebt(whoPaidId: any, settlementToId: any) {
    const whoPaidUser = this.previousUsersState.find(it => it.id == whoPaidId)
    let debt = whoPaidUser?.debts.hasOwnProperty(settlementToId) ? whoPaidUser.debts[settlementToId] : 0;
    return Math.abs(debt);
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
