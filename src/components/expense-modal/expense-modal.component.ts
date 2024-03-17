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

  constructor(public dialogRef: MatDialogRef<ExpenseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
    let user1 = data.users.length > 0 ? data.users[0].id : null;
    this.transactionTypes = data.transactionTypes;
    this.form = this.fb.group({
      userId: [user1, Validators.required],
      name: ['', Validators.required],
      transactionType: [this.transactionTypes[0].id, Validators.required],
      amountPaid: [0, [Validators.required, Validators.min(1)]]
    })
  }

  ngOnInit(): void {

  }

  close() {
    this.dialogRef.close();
  }

  add() {
    this.dialogRef.close(this.form.value)
  }
}
