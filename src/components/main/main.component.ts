import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpensesComponent } from '../expenses/expenses.component';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from '../user-info/user-info.component';
import { User } from '../../model/user.model';
import { Expense } from '../../model/expenses.model';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionModalComponent } from '../add-transaction-modal/add-transaction-modal.component';
import { OWED_FULL_AMOUNT, SPLIT_EQUALLY } from '../../constants/transaction-types.constant';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ExpensesComponent, UserInfoComponent, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  isModal = true;
  userData: any = []

  transactionTypes = [
    { id: SPLIT_EQUALLY, name: "Split equally" },
    { id: OWED_FULL_AMOUNT, name: "Owed full amount" }
  ]

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.initialize();
  }

  data: {
    users: User[],
    expenses: Expense[]
  } = {
      users: [
        { id: "user1", name: 'James' },
        { id: "user2", name: 'Jen' },
        { id: "user3", name: 'Jackson' },
        { id: "user4", name: 'Jane' },
      ],
      expenses: []
    }

  openAddTransactionModal() {
    const dialogRef = this.dialog.open(AddTransactionModalComponent, {
      data: { users: this.data.users, transactionTypes: this.transactionTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let paidBy = this.data.users.find(it => it.id == result.userId)

        let expense: Expense = {
          ...result,
          id: new Date().getMilliseconds(),
          paidBy: paidBy,
          dateCreated: new Date()
        }
        expense = this._initializeCredit(expense);

        this.data.expenses = [expense, ...this.data.expenses]
        this.initialize();
      }
    });
  }

  _initializeCredit(expense: Expense) {
    let type = expense.transactionType;
    let credit = {};
    let payeePart = 0;
    let otherUsersPart = 0;
    let numberOfUsers = this.data.users.length;

    switch (type) {
      case SPLIT_EQUALLY: {
        payeePart = +((+expense.amountPaid * (numberOfUsers-1)) / numberOfUsers)
        otherUsersPart = +(((+expense.amountPaid) / numberOfUsers)* -1)
        break;
      }
      case OWED_FULL_AMOUNT: {
        let part = +(+expense.amountPaid / (numberOfUsers-1))
        payeePart = +expense.amountPaid;
        otherUsersPart = part * -1
        break;
      }
    }
    credit = this.data.users
      .reduce((obj, it) => ({ ...obj, [it.id]: expense.paidBy?.id == it.id ? payeePart : otherUsersPart }), {})
    return {...expense, credit: credit};
  }

  initialize() {
    this.userData = this.data.users.map(it => ({ ...it, amount: 0 }))
    this.data.expenses.forEach((it) => {
      for (const [key, value] of Object.entries(it.credit)) {
        this.addBalanceToUser(key, value as number)
      }
    })
  }

  addBalanceToUser(userId: string, amount: number) {
    let user = this.userData.find((it: any) => it.id == userId)
    if (user)
      user['amount'] = ((+user['amount'] ?? 0) + amount).toFixed(2);
  }

}
