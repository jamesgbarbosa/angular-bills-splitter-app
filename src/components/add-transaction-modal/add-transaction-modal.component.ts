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
  templateUrl: './add-transaction-modal.component.html',
  styleUrl: './add-transaction-modal.component.scss'
})
export class AddTransactionModalComponent implements OnInit {
  form: FormGroup | any;

  constructor(public dialogRef: MatDialogRef<AddTransactionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
    let user1 = data.users.length > 0 ? data.users[0].id : null;
    this.form = this.fb.group({
      userId: [user1, Validators.required],
      name: ['', Validators.required],
      amountPaid: [0, Validators.required]
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
