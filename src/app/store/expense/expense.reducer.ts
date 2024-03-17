import { createReducer, on } from "@ngrx/store";
import { deleteExpenseById, loadState, owedFullAmount, settlePayment, splitEqually, updateExpense } from "./expense.action";
import { Expense } from "../../../model/expenses.model";
import { getCreditObject, initializeAmountBalancePerUser, initializeIsOwedAndDebtsMap, simplifyDebtBalance, updateUserIdToName } from "./expense.reducer.util";
import { Project } from "../../../model/project.model";

const expenseInitialState: Project = {
    users: [

    ],
    expenses: [
    ]
}

const expenseActionWrapper = (newState: Project, callback?: Function) => {
    newState = callback ? callback() : newState;
    initializeAmountBalancePerUser(newState);
    initializeIsOwedAndDebtsMap(newState)
    simplifyDebtBalance(newState)
    updateUserIdToName(newState);
    return newState;
}

export const expenseReducer = createReducer(expenseInitialState,
    on(loadState, (state, action) => {
        return expenseActionWrapper({ ...action.payload })
    }),

    on(owedFullAmount, (state, action) => {
        return expenseActionWrapper(state, () => {
            const credit = getCreditObject(state.users, action.payload)
            return {
                ...state,
                users: state.users,
                expenses: [{ ...action.payload, credit }, ...state.expenses]
            };
        })
    }),
    on(splitEqually, (state, action) => {
        return expenseActionWrapper(state, () => {
            const credit = getCreditObject(state.users, action.payload)
            return {
                ...state,
                users: state.users,
                expenses: [{ ...action.payload, credit }, ...state.expenses]
            }
        })
    }),

    on(settlePayment, (state, action) => {
        return expenseActionWrapper(state, () => {
            let expense = action.payload;
            if (expense && expense.paidBy && expense.paidBy.id && expense.settlementTo) {
                const credit = {
                    [expense.paidBy.id]: expense.amountPaid,
                    [expense.settlementTo]: -Math.abs(expense.amountPaid),
                }
                const newCredit = state.users.map(it => it.id).reduce((object, userId) => {
                    return {
                        ...object,
                        [userId]: credit[userId] ? credit[userId] : 0
                    }
                }, {})
                expense = {
                    ...expense,
                    credit: newCredit
                }
            }

            return {
                ...state,
                users: state.users,
                expenses: [expense, ...state.expenses]
            }
        })
    }),

    on(deleteExpenseById, (state, action) => {
        return expenseActionWrapper(state, () => {
            const id = action.payload;
            return { ...state, expenses: state.expenses.filter(it => it.id != id) }
        })
    }),

    on(updateExpense, (state, action) => {
        return expenseActionWrapper(state, () => {
            let updateExpense = action.payload;
            updateExpense = { ...updateExpense, credit: getCreditObject(state.users, updateExpense) }
            const prevExpense = state.expenses.find((expense: Expense) => expense.id == updateExpense.id)
            let indexToUpdate = state.expenses.findIndex((expense: Expense) => expense.id === updateExpense.id);
            updateExpense = { ...prevExpense, ...updateExpense }
            let expenses = [...state.expenses];
            expenses[indexToUpdate] = updateExpense;

            return { ...state, expenses: expenses }
        })
    })
)