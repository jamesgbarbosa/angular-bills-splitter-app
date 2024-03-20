import { Actions, createEffect, ofType } from "@ngrx/effects";
import { deleteExpenseById, loadState, owedFullAmount, settlePayment, splitEqually, updateExpense } from "./expense.action";
import { catchError, first, from, map, mergeMap, of, switchMap, tap, withLatestFrom } from "rxjs";
import { Injectable } from "@angular/core";
import { ProjectFirebaseService } from "../../../components/project/project.firebase.service";
import { Store, select } from "@ngrx/store";
import { selectExpense, selectProject } from "./expense.selector";

@Injectable()
export class ExpenseEffects {
    log = createEffect(() =>
        this.actions$.pipe(
            ofType(owedFullAmount, splitEqually, settlePayment, deleteExpenseById, updateExpense),
            tap((project) => {
                console.log("Action", project)
            })
        ), { dispatch: false }
    )
    constructor(private actions$: Actions, private projectFirebaseService: ProjectFirebaseService, private store: Store<any>) { }
}