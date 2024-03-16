import { createReducer, on } from "@ngrx/store";
import { deleteExpenseById, loadState, owedFullAmount, settlePayment, splitEqually } from "./expense.action";
import { Expense } from "../../../model/expenses.model";
import { User } from "../../../model/user.model";
import { initializeAmountBalancePerUser, initializeIsOwedAndDebtsMap, simplifyDebtBalance, updateUserIdToName } from "./expense.reducer.util";

const expenseInitialState: { users: User[], expenses: Expense[] } = {
    users: [
        { id: "user1", name: 'James', amount: 0 },
        { id: "user2", name: 'Jen', amount: 0 },
        { id: "user3", name: 'Jackson', amount: 0 }
    ],
    expenses: [
    ]
}

const expenseActionWrapper = (newState: { users: User[], expenses: Expense[] }, callback?: Function) => {
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
            const expense = action.payload;
            const otherUsersPart = +(+expense.amountPaid / (state.users.length - 1))  * -1;
            const credit = state.users
                .reduce((obj, it) => {
                    let amount = expense.paidBy?.id == it.id ? 
                        +expense.amountPaid : otherUsersPart;
                    return {
                        ...obj,
                        [it.id]: +amount.toFixed(2)
                    }
                }, {})
            return {
                users: state.users,
                expenses: [{ ...action.payload, credit }, ...state.expenses]
            };
        })
    }),
    on(splitEqually, (state, action) => {
        return expenseActionWrapper(state, () => {
            const expense = action.payload;
            const numberOfUsers = state.users.length;

            let payeePart = +((+expense.amountPaid * (numberOfUsers - 1)) / numberOfUsers)
            let otherUsersPart = +(((+expense.amountPaid) / numberOfUsers) * -1)

            const credit = state.users
                .reduce((obj, it) => {
                    let amount = expense.paidBy?.id == it.id ? payeePart : otherUsersPart;
                    return {
                        ...obj,
                        [it.id]: +amount.toFixed(2)
                    }
                }, {})
            return {
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
    })
)