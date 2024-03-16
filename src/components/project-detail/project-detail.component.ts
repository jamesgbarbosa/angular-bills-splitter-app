import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
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
import { deleteExpenseById, loadState, owedFullAmount, settlePayment, splitEqually } from '../../app/store/expense/expense.action';
import { Router } from '@angular/router';

@Component({
  selector: 'project-detail',
  standalone: true,
  imports: [ExpensesComponent, UserInfoComponent, CommonModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  // @Input() data!: Project;
  isModal = true;
  userData: any = []
  // expense$: Observable<any>;
  expenseReducerOutput: any = { users: [], expenses: [] };

  transactionTypes = [
    { id: SPLIT_EQUALLY, name: "Split equally" },
    { id: OWED_FULL_AMOUNT, name: "Owed full amount" }
  ]

  dialog = inject(MatDialog)
  store = inject(Store<any>)
  router = inject(Router)

  constructor() {}

  ngOnInit(): void {
    this.store.select("expense").subscribe((it: { users: User[], expenses: Expense[] }) => {
      this.expenseReducerOutput = it;
    })
  }

  _initializeExpense(result: any) {
    let paidBy = this.expenseReducerOutput.users.find((it: any) => it.id == result.userId)
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
        let paymentTo = this.expenseReducerOutput.users.find((it: any) => it.id == result.paymentTo)
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

  deleteExpense(id: string) {
    if (confirm(`Are you sure you want to delete expense: ${id}?`) == true) {
      this.store.dispatch(deleteExpenseById({payload: id}))
    } 
  }

  goToHome() {
    this.router.navigate(["/"])
  }
}