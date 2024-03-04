import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpensesComponent } from '../expenses/expenses.component';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from '../user-info/user-info.component';
import { User } from '../../model/user.model';
import { Expense } from '../../model/expenses.model';
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
  e : any;
  constructor(private dialog: MatDialog) {}

  data: {
    users: User[],
    expenses: Expense[]
  } = {
      users: [
        { id: "user1", name: 'James' },
        { id: "user2", name: 'Jen' },
        { id: "user3", name: 'Jackson' },
      ],
      expenses: []
    }

  openAddTransactionModal() {
    const dialogRef = this.dialog.open(AddTransactionModalComponent, {
      data: { users: this.data.users }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let numberOfUsers = this.data.users.length;
        let paidBy = this.data.users.find(it => it.id == result.userId)
        let part = +(+result.amountPaid / numberOfUsers).toFixed(2);

        let debts = this.data.users.map(it => ({
          id: it.id,
          amount: paidBy?.id == it.id ? part : part * -1
        }))

        let expense: Expense = {
          ...result,
          id: new Date().getMilliseconds(),
          paidBy: paidBy,
          debts: debts,
          dateCreader: new Date()
        }

        this.data.expenses = [expense, ...this.data.expenses]
        this.e = expense;
        this.initialize();
      }
    });
  }

  userData: any = []


  ngOnInit(): void {
    this.initialize();
  }

  initialize() {
    this.userData = this.data.users.map(it => ({...it, amount: 0}))
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
