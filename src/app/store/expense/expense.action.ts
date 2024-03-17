import { createAction, props } from "@ngrx/store";
import { Expense } from "../../../model/expenses.model";
import { User } from "../../../model/user.model";

export const splitEqually = createAction(
    '[Expense] Split Equally',
    props<{payload: Expense}>()
)

export const owedFullAmount = createAction(
    '[Expense] Owed Full Amount',
    props<{payload: Expense}>()
)

export const settlePayment = createAction(
    '[Expense] Settle Payment',
    props<{payload: Expense}>()
)

export const loadState = createAction(
    '[Expense] Load State',
    props<{payload: {users: User[], expenses: Expense[]}}>()
)

export const deleteExpenseById = createAction(
    '[Expense] Delete Expense',
    props<{payload: string}>()
)

export const updateExpense = createAction(
    '[Expense] Update Expense',
    props<{payload: Expense}>()
)