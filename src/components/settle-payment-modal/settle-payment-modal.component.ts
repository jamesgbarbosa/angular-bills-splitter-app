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

  constructor(public dialogRef: MatDialogRef<SettlePaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
    this.usersWithDebts = data.usersWithDebts;
    this.form = this.fb.group({
      userId: ['', Validators.required],
      paymentTo: ['', Validators.required],
      paymentToList: [],
      amountPaid: [0, [Validators.required, Validators.min(0.1)]]
    })
  }

  onChangeUser(event: any) {
    let debts = this.usersWithDebts.find((it) => it.id == event.target.value)?.debts;
    if (debts) {
      let paymentToMap = Object.entries(debts).map(([key, value]) => {
        let user = this.data.users.find((it: any) => it.id == key)
        return {id: key, name: user.name, debt: Math.abs(value as number)}
      })
      this.form.get('paymentToList').setValue(paymentToMap)
    }
  }

  onChangePaymentTo(event: any) {
    let maxDebt = Math.abs((this.form.get('paymentToList').value).find((it: any) => it.id == event.target.value).debt)
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
}
