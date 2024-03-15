import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ExpensesComponent } from '../expenses/expenses.component';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from '../user-info/user-info.component';
import { User } from '../../model/user.model';
import { Expense } from '../../model/expenses.model';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionModalComponent } from '../add-transaction-modal/add-transaction-modal.component';
import { OWED_FULL_AMOUNT, SETTLE, SPLIT_EQUALLY } from '../../constants/transaction-types.constant';
import { SettlePaymentModalComponent } from '../settle-payment-modal/settle-payment-modal.component';
import { Project } from '../../model/project.model';
import { Store } from '@ngrx/store';
import { loadState, owedFullAmount, settlePayment, splitEqually } from '../../app/store/expense/expense.action';

@Component({
  selector: 'project-detail',
  standalone: true,
  imports: [ExpensesComponent, UserInfoComponent, CommonModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  @Input() data!: Project;
  isModal = true;
  userData: any = []
  // expense$: Observable<any>;
  expenseReducerOutput: any = { users: [], expenses: [] };

  transactionTypes = [
    { id: SPLIT_EQUALLY, name: "Split equally" },
    { id: OWED_FULL_AMOUNT, name: "Owed full amount" }
  ]

  constructor(private dialog: MatDialog, private store: Store<any>) {
    
  }

  loadState() {
    const state = {
      users: [
        { id: "user1", name: 'James', amount: 0 },
        { id: "user2", name: 'Jen', amount: 0 },
        { id: "user3", name: 'Jackson', amount: 0 }
      ],
      expenses: [
        {
          "id": "428",
          "paidBy": {
            "id": "user3",
            "name": "Jackson"
          },
          "dateCreated": "2024-03-15T13:30:26.428Z",
          "amountPaid": 20.5,
          "name": "Settle payment to user James(user1)",
          "transactionType": "SETTLE",
          "settlementTo": "user1",
          "credit": {
            "user1": -20.5,
            "user2": 0,
            "user3": 20.5
          }
        },
        {
          "id": "702",
          "paidBy": {
            "id": "user2",
            "name": "Jen"
          },
          "dateCreated": "2024-03-15T13:30:16.702Z",
          "amountPaid": 41,
          "name": "Settle payment to user James(user1)",
          "transactionType": "SETTLE",
          "settlementTo": "user1",
          "credit": {
            "user1": -41,
            "user2": 41,
            "user3": 0
          }
        },
        {
          "id": "474",
          "paidBy": {
            "id": "user3",
            "name": "Jackson"
          },
          "dateCreated": "2024-03-15T13:30:03.474Z",
          "amountPaid": 41,
          "name": "Foods and drinks",
          "transactionType": "OWED_FULL_AMOUNT",
          "credit": {
            "user1": -20.5,
            "user2": -20.5,
            "user3": 41
          }
        },
        {
          "id": "790",
          "paidBy": {
            "id": "user1",
            "name": "James"
          },
          "dateCreated": "2024-03-15T13:29:48.790Z",
          "amountPaid": 123,
          "name": "Foods and drinks",
          "transactionType": "SPLIT_EQUALLY",
          "credit": {
            "user1": 82,
            "user2": -41,
            "user3": -41
          }
        }
      ]
    }

    this.store.dispatch(loadState({ payload: state }));
  }

  ngOnInit(): void {
    this.store.select("expense").subscribe((it: { users: User[], expenses: Expense[] }) => {
      this.expenseReducerOutput = it;
    })
  }

  _initializeExpense(result: any) {
    let paidBy = this.data.users.find(it => it.id == result.userId)
    let expense: Expense = {
      // userId: paidBy.id,
      id: new Date().getMilliseconds() + "",
      paidBy: paidBy,
      dateCreated: new Date(),
      amountPaid: result.amountPaid,
      name: result.name,
      transactionType: result.transactionType
    }
    switch (expense.transactionType) {
      case SPLIT_EQUALLY: {
        this.store.dispatch(splitEqually({ payload: expense }))
        break;
      }
      case OWED_FULL_AMOUNT: {
        this.store.dispatch(owedFullAmount({ payload: expense }))
        break;
      }
      case SETTLE: {
        let e = { ...expense }
        e.settlementTo = result.paymentTo
        let paymentTo = this.data.users.find(it => it.id == result.paymentTo)
        e.name = 'Settle payment to user ' + `${paymentTo?.name}(${paymentTo?.id})`
        this.store.dispatch(settlePayment({ payload: e }))
        break;
      }
    }
  }


  onAddTransactionModal() {
    const dialogRef = this.dialog.open(AddTransactionModalComponent, {
      data: { users: this.expenseReducerOutput.users, transactionTypes: this.transactionTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._initializeExpense(result);
      }
    });
  }

  onSettlePaymentModal() {
    let usersWithDebts = this.expenseReducerOutput.users.filter((it: any) => (it?.debts && Object.keys(it?.debts).length > 0))
    const dialogRef = this.dialog.open(SettlePaymentModalComponent, {
      data: { users: this.expenseReducerOutput.users, usersWithDebts: usersWithDebts, transactionTypes: this.transactionTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.transactionType = SETTLE;
        this._initializeExpense(result);
      }
    });
  }
}
