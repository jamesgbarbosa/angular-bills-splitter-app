import { createReducer, on } from "@ngrx/store";
import { deleteExpenseById, loadState, owedFullAmount, pushChanges, settlePayment, splitEqually, updateExpense } from "./expense.action";
import { Expense } from "../../../model/expenses.model";
import { computeOwedFillAmountCredit, computeSettlementCredit, computeSplitEquallyCredit, getCreditObject, processProject } from "./expense.reducer.util";
import { Project } from "../../../model/project.model";
import { ProjectState } from "./expense.model";

const expenseInitialState: ProjectState = {
    project: {
        users: [

        ],
        expenses: [
        ]
    },
    previousProjectState: {
        users: [

        ],
        expenses: [
        ]
    }
}

const expenseActionWrapper = (newState: Project, callback?: Function) => {
    newState = callback ? callback() : newState;
    processProject(newState);
    return newState;
}

const emptyProject = {
    users: [

    ],
    expenses: [
    ]
}

export const expenseReducer = createReducer(expenseInitialState,
    on(loadState, (state, action) => {
        return {
            ...state,
            previousProjectState: { ...action.payload }
        };
    }),

    on(owedFullAmount, (state, action) => {
        const credit = computeOwedFillAmountCredit(state.previousProjectState.users, action.payload)
        let previousProject = {
            users: state.previousProjectState.users,
            expenses: [{ ...action.payload, credit }, ...state.previousProjectState.expenses]
        }
        processProject(previousProject);
        return {
            ...state,
            previousProjectState: previousProject
        };
    }),
    on(splitEqually, (state, action) => {
        const credit = computeSplitEquallyCredit(state.previousProjectState.users, action.payload)
        let previousProject = {
            users: state.previousProjectState.users,
            expenses: [{ ...action.payload, credit }, ...state.previousProjectState.expenses]
        }
        processProject(previousProject);
        return {
            ...state,
            previousProjectState: previousProject
        };
    }), 
    on(settlePayment, (state, action) => {
        const credit = computeSettlementCredit(state.previousProjectState.users, action.payload)
        let previousProject = {
            users: state.previousProjectState.users,
            expenses: [{ ...action.payload, credit }, ...state.previousProjectState.expenses]
        }
        processProject(previousProject);
        return {
            ...state,
            previousProjectState: previousProject
        };
    }),

    on(deleteExpenseById, (state, action) => {
        const id = action.payload;
        let previousProject = {
            users: state.previousProjectState.users,
            expenses:  state.previousProjectState.expenses.filter(it => it.id != id)
        }
        processProject(previousProject);
        return {
            ...state,
            previousProjectState: previousProject
        };
    }),

    on(updateExpense, (state, action) => {
        let previousProject = updateExpenseByExpenseObject(action.payload, state.previousProjectState)
        processProject(previousProject);
        return {
            ...state,
            previousProjectState: previousProject
        };
    }),

    on(pushChanges, (state) => {
        return {
            ...state,
            project: {...state.previousProjectState}
        }
    })
)

const updateExpenseByExpenseObject = (updateExpensed: Expense, project: Project) => {
    updateExpensed = { ...updateExpensed, credit: getCreditObject(project.users, updateExpensed) }
    const prevExpense = project.expenses.find((expense: Expense) => expense.id == updateExpensed.id)
    let indexToUpdate = project.expenses.findIndex((expense: Expense) => expense.id === updateExpensed.id);
    updateExpensed = { ...prevExpense, ...updateExpensed }
    let expenses = [...project.expenses];
    expenses[indexToUpdate] = updateExpensed;

    return { ...project, expenses: expenses }
}

                          