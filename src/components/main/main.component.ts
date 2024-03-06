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
        { id: "user5", name: 'Bob' },
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
        payeePart = +((+expense.amountPaid * (numberOfUsers - 1)) / numberOfUsers)
        otherUsersPart = +(((+expense.amountPaid) / numberOfUsers) * -1)
        break;
      }
      case OWED_FULL_AMOUNT: {
        let part = +(+expense.amountPaid / (numberOfUsers - 1))
        payeePart = +expense.amountPaid;
        otherUsersPart = part * -1
        break;
      }
    }

    credit = this.data.users
      .reduce((obj, it) => {
        let amount = expense.paidBy?.id == it.id ? payeePart : otherUsersPart;
        return {
          ...obj,
          [it.id]: amount
        }
      }, {})
    return { ...expense, credit: credit };
  }

  initialize() {
    this.initializeDebtsObject();
    this.initializeIsOwedObject();

    this.simplifyDebtBalance();
    this.initInfoMapping();
  }

  _checkAmount(data: any, userId: string) {
    try {
      return data[userId];
    } catch (err) {
      console.log("ERROR", data)
      return 0;
    }
  }

  // addDebtTrackerToUser(expenseUserId: any, userId: string, amount: any) {
  //   //debt computer
  //   let currUser = this.userData.find((it: any) => it.id == userId)

  //   if (userId != expenseUserId) {
  //     if (!currUser?.debts) {
  //       currUser.debts = {}
  //     }
  //     if (!currUser?.debts[expenseUserId]) {
  //       currUser.debts[expenseUserId] = 0
  //     }
  //     currUser['debts'] = {
  //       ...currUser['debts'],
  //       [expenseUserId]: currUser['debts'][expenseUserId] + Math.abs(amount)
  //     }
  //   }
  // }

  addBalanceToUser(userId: string, credit: number) {
    let user = this.userData.find((it: any) => it.id == userId)
    if (user)
      user['amount'] = ((+user['amount'] ?? 0) + credit).toFixed(2);
  }

  initializeDebtsObject() {
    this.userData = this.data.users.map(it => ({ ...it, amount: 0 }))

    this.data.expenses.forEach((it) => {
      for (const [userId, credit] of Object.entries(it.credit)) {
        this.addBalanceToUser(userId, credit as number)
        // this.addDebtTrackerToUser(it.paidBy.id, userId, credit)

        let expenseUserId = it.paidBy.id
        let currUser = this.userData.find((user: any) => user.id == userId)
        if (userId != expenseUserId) {

          if (!currUser?.debts) {
            currUser.debts = {}
          }
          if (!currUser?.debts[expenseUserId]) {
            currUser.debts[expenseUserId] = 0
          }

          currUser.debts = {
            ...currUser['debts'],
            [expenseUserId]: currUser.debts[expenseUserId] + (credit as number)
          }
        }
      }
    })
  }
  initializeIsOwedObject() {
    // Initialize isOwed object
    this.userData.forEach((user: User) => {
      if (user['debts']) {
        let currentUserId = user.id;
        for (const [userId, debt] of Object.entries(user['debts'])) {
          // find userId in userData
          let currUser = this.userData.find((it: any) => it.id == userId)
          // make isOwed object
          if (!currUser.isOwed) {
            currUser['isOwed'] = {}
          }
          // attach currentUserId : currentUserId + debt
          currUser.isOwed = {
            ...currUser.isOwed,
            [currentUserId]: (currUser[userId] || 0) + debt
          }
        }
      }
    })
  }

  simplifyDebtBalance() {
    // Remove 0's from records
    this.userData.forEach((user: any) => {
      if (user['debts']) {
        for (const [userId, value] of Object.entries(user['debts'])) {
          if ((value as number) == 0) {
            delete user.debts[userId]
          }
        }
      }

      if (user['isOwed']) {
        for (const [userId, value] of Object.entries(user['isOwed'])) {
          if ((value as number) == 0) {
            delete user.isOwed[userId]
          }
        }
      }
    })

    this.userData.forEach((user: any) => {
      if (user['isOwed']) {
        user['totalOwed'] = Object.entries(user['isOwed']).reduce((val, [key, value]) => { return val + (value as number) }, 0)
      }
    })
  }

  initInfoMapping() {
    // User mapping
    this.userData.forEach((user: User) => {
      if (user['isOwed']) {
        for (const [userId, val] of Object.entries(user['isOwed'])) {
          let currUser = this.userData.find((it: any) => it.id == userId)

          if (!user.isOwedMap) {
            user['isOwedMap'] = {}
          }

          user.isOwedMap = {
            ...user.isOwedMap,
            [currUser.name]: user.isOwed[userId]
          }
        }
      }

      if (user['debts']) {
        for (const [userId, val] of Object.entries(user['debts'])) {
          let currUser = this.userData.find((it: any) => it.id == userId)

          if (!user.debtsMap) {
            user['debtsMap'] = {}
          }

          user.debtsMap = {
            ...user.debtsMap,
            [currUser.name]: user.debts[userId]
          }
        }
      }
    })
  }
}
