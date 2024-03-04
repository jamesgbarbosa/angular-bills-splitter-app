import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [],
  templateUrl: './add-transaction-modal.component.html',
  styleUrl: './add-transaction-modal.component.scss'
})
export class AddTransactionModalComponent {
  constructor(public dialogRef: MatDialogRef<AddTransactionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }
}
