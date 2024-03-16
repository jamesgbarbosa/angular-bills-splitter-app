import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-project-modal.component.html',
  styleUrl: './create-project-modal.component.scss'
})
export class CreateProjectModalComponent implements OnInit {
  form: FormGroup;

  constructor(public dialogRef: MatDialogRef<CreateProjectModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) {
    this.form = this.fb.group({
      projectName: ['', Validators.required],
      users: this.fb.array([])
    })
    this.addUser();
    this.addUser();
  }

  get users() {
    return this.form.get('users') as FormArray;
  }

  ngOnInit(): void {

  }

  addUser() {
    const fg = this.fb.group({
      name: ['', Validators.required]
    })
    this.users.push(fg)
  }

  deleteUser(i: number) {
    this.users.removeAt(i);
  }

  close() {
    this.dialogRef.close();
  }

  create() {
    this.dialogRef.close(this.form.value)
  }
}
