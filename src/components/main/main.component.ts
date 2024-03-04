import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpensesComponent } from '../expenses/expenses.component';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from '../user-info/user-info.component';
import { User } from '../../model/user.model';
import { Expenses } from '../../model/expenses.model';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionModalComponent } from '../add-transaction-modal/add-transaction-modal.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ExpensesComponent, UserInfoComponent, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  isModal = true;

  constructor(private dialog: MatDialog) {
    
  }

  data: {
    users: User[],
    expenses: Expenses[]
  } = {
    users: [
      { id: "user1", name: 'James'},
      { id: "user2", name: 'Jen' },
    ],
    expenses: [
      {
        id: "e1",
        name: 'Grocery',
        dataCreated: new Date(),
        paidBy: { id: "user1", name: 'James' },
        debts: [ {id: "user1", amount: 100} , {id: "user2", amount: -100}],
        amountPaid: 200
      },
      {
        id: "e2",
        name: 'Bills',
        dataCreated: new Date(),
        paidBy: { id: "user2", name: 'Jen' },
        debts: [{id: "user2", amount: 50}, {id: "user1", amount: -50}],
        amountPaid: 100
      }
    ]
  }

  openAddTransactionModal() {
    const dialogRef = this.dialog.open(AddTransactionModalComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  userData : any = []


  ngOnInit(): void {
    this.initialize();
  }

  initialize() {
    this.userData = [...this.data.users]
    this.data.expenses.forEach((it) => {
      it.debts.forEach((debt) => {
        this.addToUser(debt.id, debt.amount)
      })
    })
  }

  addToUser(userId: string, amount: number) {
    let user = this.userData.find((it: any) => it.id == userId)
    if (user)
    user['amount'] = (user['amount'] ?? 0) + amount;
  }

}
