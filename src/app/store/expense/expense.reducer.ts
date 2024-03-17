import { createReducer, on } from "@ngrx/store";
import { deleteExpenseById, loadState, owedFullAmount, settlePayment, splitEqually, updateExpense } from "./expense.action";
import { Expense } from "../../../model/expenses.model";
import { getCreditObject, processProject } from "./expense.reducer.util";
import { Project } from "../../../model/project.model";

const expenseInitialState: Project = {
    users: [

    ],
    expenses: [
    ]
}

const expenseActionWrapper = (newState: Project, callback?: Function) => {
    newState = callback ? callback() : newState;
    processProject(newState);
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
            expense = {
                ...expense,
                credit: getCreditObject(state.users, expense)
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
            return updateExpenseByExpenseObject(action.payload, state)
        })
    })
)

const updateExpenseByExpenseObject= (updateExpensed: Expense, project: Project) => {
    updateExpensed = { ...updateExpensed, credit: getCreditObject(project.users, updateExpensed) }
    const prevExpense = project.expenses.find((expense: Expense) => expense.id == updateExpensed.id)
    let indexToUpdate = project.expenses.findIndex((expense: Expense) => expense.id === updateExpensed.id);
    updateExpensed = { ...prevExpense, ...updateExpensed }
    let expenses = [...project.expenses];
    expenses[indexToUpdate] = updateExpensed;

    return { ...project, expenses: expenses }
}

