import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpensesComponent } from '../expenses/expenses.component';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from '../user-info/user-info.component';
import { User } from '../../model/user.model';
import { Expense } from '../../model/expenses.model';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionModalComponent } from '../add-transaction-modal/add-transaction-modal.component';
import { OWED_FULL_AMOUNT, SETTLE, SPLIT_EQUALLY } from '../../constants/transaction-types.constant';
import { SettlePaymentModalComponent } from '../settle-payment-modal/settle-payment-modal.component';

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
    this.initializeUsers();
    this.initialize();
  }

  initializeUsers() {
    this.data.users = [
      { id: "user1", name: 'James' },
      { id: "user2", name: 'Jen' },
      { id: "user3", name: 'Jackson' },
      // { id: "user4", name: 'Jane' },
      // { id: "user5", name: 'Bob' },
    ]
  }

  data: {
    users: User[],
    expenses: Expense[]
  } = {
      users: [],
      expenses: []
    }

  _initializeExpense(result: any) {
    let paidBy = this.data.users.find(it => it.id == result.userId)
    let expense: Expense = {
      userId: '',
      id: new Date().getMilliseconds() + "",
      paidBy: paidBy,
      dateCreated: new Date(),
      amountPaid: result.amountPaid,
      name : result.name,
      transactionType: result.transactionType
    }

    switch (expense.transactionType) {
      case SPLIT_EQUALLY: {
        let numberOfUsers = this.data.users.length;
        let payeePart = +((+expense.amountPaid * (numberOfUsers - 1)) / numberOfUsers)
        let otherUsersPart = +(((+expense.amountPaid) / numberOfUsers) * -1)

        expense.credit = this.data.users
          .reduce((obj, it) => {
            let amount = expense.paidBy?.id == it.id ? payeePart : otherUsersPart;
            return {
              ...obj,
              [it.id]: +amount.toFixed(2)
            }
          }, {})

        break;
      }
      case OWED_FULL_AMOUNT: {
        let numberOfUsers = this.data.users.length;
        let part = +(+expense.amountPaid / (numberOfUsers - 1))
        let payeePart = +expense.amountPaid;
        let otherUsersPart = part * -1;

        expense.credit = this.data.users
          .reduce((obj, it) => {
            let amount = expense.paidBy?.id == it.id ? payeePart : otherUsersPart;
            return {
              ...obj,
              [it.id]: +amount.toFixed(2)
            }
          }, {})
        break;
      }
      case SETTLE: {
        let paymentTo = this.data.users.find(it => it.id == result.paymentTo)
        expense.name = 'Settle payment to user ' + `${paymentTo?.name}(${paymentTo?.id})`
        expense.credit = {
          [result.userId]: result.amountPaid,
          [result.paymentTo]: -Math.abs(result.amountPaid),
        }
        break;
      }
    }

    return expense;
  }

  initialize() {
    // Reset userData to original state
    this.userData = this.data.users.map(it => ({ ...it, amount: 0 }))
    this.initializeAmountBalancePerUser();
    this.initializeDebtsObject();
    this.initializeIsOwedObject();

    this.simplifyDebtBalance();
    this.updateKeys();
  }

  _addBalanceToUser(userId: string, credit: number) {
    let user = this._findUserById(userId);
    if (user) {
      let amount = +((+user['amount'] ?? 0) + credit).toFixed(2);
      if (Math.abs(amount) < 0.02) {
        amount = 0;
      }
      user['amount'] = amount;
    }
  }

  initializeAmountBalancePerUser() {
    this.data.expenses.forEach((it: any) => {
      for (const [userId, credit] of Object.entries(it.credit)) {
        this._addBalanceToUser(userId, credit as number)
      }
    })
  }

  initializeDebtsObject() {
    this.data.expenses.forEach((it: any) => {
      for (const [userId, credit] of Object.entries(it.credit)) {

        let expenseUserId = it.paidBy.id
        let currUser = this._findUserById(userId);
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
    this.userData.forEach((user: User) => {
      if (user['debts']) {
        let currentUserId = user.id;
        for (const [userId, debt] of Object.entries(user['debts'])) {
          let currUser = this._findUserById(userId);
          if (!currUser.isOwed) {
            currUser['isOwed'] = {}
          }
          currUser.isOwed = {
            ...currUser.isOwed,
            [currentUserId]: (currUser[userId] || 0) + debt
          }
        }
      }
    })
  }

  simplifyDebtBalance() {
    // Simplify difference between debts and owes
    this.userData.forEach((it: any) => {
      if (it.debts && it.isOwed) {
        let commonKeys = this._intersect(it.debts, it.isOwed)
        commonKeys.forEach((common) => {
          let d = Math.abs(it.debts[common])
          let o = Math.abs(it.isOwed[common])
          let minNumber = Math.min(d, o)
          it.debts[common] = d - minNumber;
          it.isOwed[common] = o - minNumber;
        })
      }
    })

    // Remove 0's from records
    this.userData.forEach((user: any) => {
      if (user['debts']) {
        for (const [userId, value] of Object.entries(user['debts'])) {
          let val = (value as number);
          if (val == 0) {
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
  }

  updateKeys() {
    this.userData.forEach((user: User) => {
      if (user['isOwed']) {
        for (const [userId, val] of Object.entries(user['isOwed'])) {
          let currUser = this._findUserById(userId);
          user.isOwed = {
            ...user.isOwed,
            [currUser.name]: user.isOwed[userId]
          }
          delete user.isOwed[currUser.id]
        }
      }

      if (user['debts']) {
        for (const [userId, val] of Object.entries(user['debts'])) {
          let currUser = this._findUserById(userId);
          user.debts = {
            ...user.debts,
            [currUser.name]: user.debts[userId]
          }
          delete user.debts[currUser.id]
        }
      }
    })
  }

  onAddTransactionModal() {
    const dialogRef = this.dialog.open(AddTransactionModalComponent, {
      data: { users: this.data.users, transactionTypes: this.transactionTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let expense = this._initializeExpense(result);
        this.data.expenses = [expense, ...this.data.expenses]
        this.initialize();
      }
    });
  }

  onSettlePaymentModal() {
    let usersWithDebts = this.userData.filter((it: any) => (it?.debts && Object.keys(it?.debts).length > 0))
    const dialogRef = this.dialog.open(SettlePaymentModalComponent, {
      data: { users: this.userData, usersWithDebts: usersWithDebts, transactionTypes: this.transactionTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.transactionType = SETTLE;
        let expense = this._initializeExpense(result);
        this.data.expenses = [expense, ...this.data.expenses]
        this.initialize();
      }
    });
  }

  _findUserById(userId: string) {
    return this.userData.find((it: User) => it.id == userId)
  }


  _intersect(o1: any, o2: any) {
    return Object.keys(o1).filter(k => Object.hasOwn(o2, k))
  }
}
