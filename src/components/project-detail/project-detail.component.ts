import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { ExpensesComponent } from '../expenses/expenses.component';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from '../user-info/user-info.component';
import { User } from '../../model/user.model';
import { Expense } from '../../model/expenses.model';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';
import { CUSTOM, OWED_FULL_AMOUNT, SETTLE, SPLIT_EQUALLY } from '../../constants/transaction-types.constant';
import { SettlePaymentModalComponent } from '../settle-payment-modal/settle-payment-modal.component';
import { Project } from '../../model/project.model';
import { Store } from '@ngrx/store';
import { customExpense, deleteExpenseById, loadState, owedFullAmount, pushChanges, settlePayment, splitEqually, updateExpense } from '../../app/store/expense/expense.action';
import { ActivatedRoute, Route, Router } from '@angular/router';
import sample from './sample.json'
import { Observable } from 'rxjs';
import { previousProjectState, selectExpense, selectProject } from '../../app/store/expense/expense.selector';
import { processProject } from '../../app/store/expense/expense.reducer.util';
import { ProjectFirebaseService } from '../project/project.firebase.service';

@Component({
  selector: 'project-detail',
  standalone: true,
  imports: [ExpensesComponent, UserInfoComponent, CommonModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  dialog = inject(MatDialog)
  store = inject(Store<any>)
  router = inject(Router)
  route = inject(ActivatedRoute)
  isLoading = false;
  isModal = true;
  userData: any = []
  currentProjectState: any = { users: [], expenses: [] };
  previousProjectState: any = { users: [], expenses: [] };

  projectFireBaseId = "";
  transactionTypes = [
    { id: SPLIT_EQUALLY, name: "Split equally" },
    { id: OWED_FULL_AMOUNT, name: "Owed full amount" },
    { id: CUSTOM, name: "Custom" }
  ]

  constructor(private projectFirebaseService: ProjectFirebaseService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((query: any) => {
      let id = query.params.id;
      this.projectFireBaseId = id;
      this.initializeProjectDetailData(id)
    });

    this.store.select(selectProject).subscribe((it: { users: User[], expenses: Expense[] }) => {
      this.currentProjectState = it;
    })
    this.store.select(previousProjectState).subscribe((it: { users: User[], expenses: Expense[] }) => {
      this.previousProjectState = it;
    })
    // this.store.dispatch(loadState({payload: sample}))
  }

  initializeProjectDetailData(id: string) {
    this.isLoading = true;
    this.projectFirebaseService.getProjectById(id).then((project: any) => {
      this.store.dispatch(loadState({ payload: project.data() }))
      this.store.dispatch(pushChanges())
    }).finally(() => {
      this.isLoading = false;
    })
  }

  _initializeExpense(result: Expense) {
    let paidBy = this.currentProjectState.users.find((it: any) => it.id == result.userId)
    let expense: Expense = {
      // userId: paidBy.id,
      id: new Date().getMilliseconds() + "",
      paidBy: paidBy,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      amountPaid: result.amountPaid,
      name: result.name,
      transactionType: result.transactionType
    }

    switch (expense.transactionType) {
      case SPLIT_EQUALLY: {
        this.initFirebaseProcess(() => {
          this.store.dispatch(splitEqually({ payload: expense }))
        })
        break;
      }
      case OWED_FULL_AMOUNT: {
        this.initFirebaseProcess(() => {
          this.store.dispatch(owedFullAmount({ payload: expense }))
        })
        break;
      }
      case CUSTOM: {
        this.initFirebaseProcess(() => {
          expense.credit = result.credit;
          this.store.dispatch(customExpense({ payload: expense }))
        })
        break;
      }
      case SETTLE: {
        let newExpense = { ...expense }
        const settlementTo = this.currentProjectState.users.find((it: any) => it.id == result.settlementTo)
        newExpense.settlementTo = result.settlementTo
        newExpense.name = this.getSettlementExpenseName(settlementTo);

        this.initFirebaseProcess(() => {
          this.store.dispatch(settlePayment({ payload: newExpense }))
        })
        break;
      }
    }
  }

  initFirebaseProcess(callback?: Function) {
    let previousState = { ...this.currentProjectState }
    if (callback) {
      callback();
    }
    this.projectFirebaseService.updateProject(this.projectFireBaseId, this.previousProjectState).then((result) => {
      console.log("Successfully saved")
      this.store.dispatch(pushChanges());
    }).catch((error) => {
      this.store.dispatch(loadState({ payload: previousState }))
      alert("Service is currently unavailable");
      // this.store.dispatch(loadState({ payload: previousProjectState }))
    });
  }


  onAddExpenseModal() {
    const dialogRef = this.dialog.open(ExpenseModalComponent, {
      data: { users: this.currentProjectState.users, transactionTypes: this.transactionTypes, mode: 'ADD' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._initializeExpense(result);
      }
    });
  }

  onEditExpenseButtonClick(id: string) {
    const expense = this.currentProjectState.expenses.find((it: any) => it.id == id)
    switch (expense.transactionType) {
      case 'CUSTOM': {
        this.openEditExpenseModal(expense);
        break;
      }
      case 'SPLIT_EQUALLY': {
        this.openEditExpenseModal(expense);
        break;
      }
      case 'OWED_FULL_AMOUNT': {
        this.openEditExpenseModal(expense);
        break;
      }
      case 'SETTLE': {
        this._openEditSettleModal(expense);
        break;
      }
    }
  }

  openEditExpenseModal(expense: Expense) {
    if (expense) {
      const dialogRef = this.dialog.open(ExpenseModalComponent, {
        data: { users: this.currentProjectState.users, transactionTypes: this.transactionTypes, mode: 'EDIT', expense }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let paidBy = this.currentProjectState.users.find((it: any) => it.id == result.userId)
          let newExpense: Expense = {
            ...result ,
            id: expense.id,
            paidBy: paidBy,
            dateUpdated: new Date(),
            amountPaid: +result.amountPaid,
            name: result.name,
            transactionType: result.transactionType
          }

          this.initFirebaseProcess(() => {
            this.store.dispatch(updateExpense({ payload: newExpense }))
          })
        }
      });
    } else {
      console.error("User not found!")
    }
  }

  _openEditSettleModal(expense: Expense) {
    if (expense) {
      // delete expense from this.currentProjectState
      // to intiialize values to settlement modal 
      let projectTemp = { ...this.currentProjectState }
      projectTemp = { ...projectTemp, expenses: projectTemp.expenses.filter((e: Expense) => e.id != expense.id) }
      processProject(projectTemp);

      const dialogRef = this.dialog.open(SettlePaymentModalComponent, {
        data: { currentUsersState: { ...this.currentProjectState }.users, previousUsersState: projectTemp.users, expense, mode: 'EDIT' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let paidBy = this.currentProjectState.users.find((it: any) => it.id == result.userId)
          let settlementTo = this.currentProjectState.users.find((it: any) => it.id == result.settlementTo)
          let newExpense: Expense = {
            ...result,
            id: expense.id,
            paidBy: paidBy,
            dateUpdated: new Date(),
            settlementTo: result.settlementTo,
            amountPaid: +result.amountPaid,
            transactionType: expense.transactionType,
            name: this.getSettlementExpenseName(settlementTo)
          }

          this.initFirebaseProcess(() => {
            this.store.dispatch(updateExpense({ payload: newExpense }))
          })
        }
      });
    } else {
      console.error("User not found!")
    }
  }

  onSettlePaymentModal() {
    const dialogRef = this.dialog.open(SettlePaymentModalComponent, {
      data: { previousUsersState: this.currentProjectState.users, currentUsersState: this.currentProjectState.users, transactionTypes: this.transactionTypes, mode: 'ADD' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.transactionType = SETTLE;
        this._initializeExpense(result);
      }
    });
  }

  getSettlementExpenseName(user: User) {
    return 'Settle payment to user ' + `${user?.name}`
  }

  deleteExpense(id: string) {
    const dialogRef = this.dialog.open(ExpenseModalComponent, {
      data: { users: this.currentProjectState.users, transactionTypes: this.transactionTypes, mode: 'DELETE' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.initFirebaseProcess(() => {
          this.store.dispatch(deleteExpenseById({ payload: id }))
        });
      }
    });
  }

  goToHome() {
    this.router.navigate(["/"])
  }
}