import { createReducer, on } from "@ngrx/store";
import { deleteExpenseById, loadState, owedFullAmount, settlePayment, splitEqually } from "./expense.action";
import { Expense } from "../../../model/expenses.model";
import { User } from "../../../model/user.model";

const expenseInitialState: { users: User[], expenses: Expense[] } = {
    users: [
        { id: "user1", name: 'James', amount: 0 },
        { id: "user2", name: 'Jen', amount: 0 },
        { id: "user3", name: 'Jackson', amount: 0 }
    ],
    expenses: [
    ]
}

export const expenseReducer = createReducer(expenseInitialState,
    on(loadState, (state, action) => {
        let newState = { ...action.payload }
        initializeAmountBalancePerUser(newState);
        initializeDebtsObject(newState);
        initializeIsOwedObject(newState);
        simplifyDebtBalance(newState)
        updateUserIdToName(newState);

        return newState;
    }),

    on(owedFullAmount, (state, action) => {
        const expense = action.payload;
        const numberOfUsers = state.users.length;

        let part = +(+expense.amountPaid / (numberOfUsers - 1))
        let payeePart = +expense.amountPaid;
        let otherUsersPart = part * -1;

        const credit = state.users
            .reduce((obj, it) => {
                let amount = expense.paidBy?.id == it.id ? payeePart : otherUsersPart;
                return {
                    ...obj,
                    [it.id]: +amount.toFixed(2)
                }
            }, {})

        let newState = {
            users: state.users,
            expenses: [{ ...action.payload, credit }, ...state.expenses]
        }

        initializeAmountBalancePerUser(newState);
        initializeDebtsObject(newState);
        initializeIsOwedObject(newState);
        simplifyDebtBalance(newState)
        updateUserIdToName(newState);
        return newState;
    }),
    on(splitEqually, (state, action) => {
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

        let newState = {
            users: state.users,
            expenses: [{ ...action.payload, credit }, ...state.expenses]
        }

        initializeAmountBalancePerUser(newState);
        initializeDebtsObject(newState, "Split Equally");
        initializeIsOwedObject(newState);
        simplifyDebtBalance(newState)
        updateUserIdToName(newState);
        return newState;
    }),
    on(settlePayment, (state, action) => {
        let expense = action.payload;
        if (expense && expense.paidBy && expense.paidBy.id && expense.settlementTo) {
            const credit = {
                [expense.paidBy.id]: expense.amountPaid,
                [expense.settlementTo]: -Math.abs(expense.amountPaid),
            }
            const newCredit = state.users.map(it => it.id).reduce((object, userId) => {
                let value = credit[userId] ? credit[userId] : 0;
                return {
                    ...object,
                    [userId]: value
                }
            }, {})
            expense = {
                ...expense,
                credit: newCredit
            }
        }

        let newState = {
            users: state.users,
            expenses: [expense, ...state.expenses]
        }

        initializeAmountBalancePerUser(newState);
        initializeDebtsObject(newState);
        initializeIsOwedObject(newState);
        simplifyDebtBalance(newState)
        updateUserIdToName(newState);
        return newState;
    }),

    on(deleteExpenseById, (state, action) => {
        const id = action.payload;
        const newState = {...state, expenses: state.expenses.filter(it => it.id != id)}
        initializeAmountBalancePerUser(newState);
        initializeDebtsObject(newState);
        initializeIsOwedObject(newState);
        simplifyDebtBalance(newState)
        updateUserIdToName(newState);
        return newState;
    })
)

const initializeIsOwedObject = (project: { users: User[], expenses: Expense[] }) => {
    const calculateOwedMap = (owedUser: User) => {
        let totalOwed = project.users.reduce((total, user: User) => {
            // per expense, if id owns the expense, skip, else check debts
            if (user && (user.id != owedUser.id)) {
                // check if owedUser.id is in debts object of user
                if (user.debts && user.debts[owedUser.id]) {
                    let amount = user.debts[owedUser.id];
                    return {
                        ...total,
                        [user.id]: +((total[user.id] ?? 0) + amount).toFixed(2)
                    }
                }
            }
            return total;
        }, <any>{})
        return totalOwed;
    }
    project.users = project.users.map((it: any) => {
        return { ...it, isOwed: calculateOwedMap(it) }
    })
}

const initializeDebtsObject = (project: { users: User[], expenses: Expense[] }, name = "Else") => {
    console.log(name)
    const calculateDebtsMap = (user: User) => {
        let totalDebt = project.expenses.reduce((total, expense: Expense) => {
            // per expense, if id owns the expense, skip; else check
            if (expense && expense.paidBy && (expense['paidBy'].id != user.id)) {
                let expenseOwner = expense['paidBy'].id;
                let credit = expense.credit[user.id]
                return {
                    ...total,
                    [expenseOwner]: +((total[expenseOwner] ?? 0) + credit).toFixed(2)
                }
            }
            return total;
        }, <any>{})
        return totalDebt;
    }
    project.users = project.users.map((it: any) => {
        return { ...it, debts: calculateDebtsMap(it) }
    })
}

const initializeAmountBalancePerUser = (project: { users: User[], expenses: Expense[] }) => {
    const calculateTotalAmount = (id: string) => {
        return project.expenses.reduce((total, expense) => {
            return +(total + (expense.credit[id] ?? 0)).toFixed(2)
        }, 0)
    }

    project.users = project.users.map((it: any) => {
        return { ...it, amount: calculateTotalAmount(it.id) }
    })

}

const simplifyDebtBalance = (project: { users: User[], expenses: Expense[] }) => {
    // Simplify difference between debts and owes
    project.users.forEach((it: any) => {
        if (it.debts && it.isOwed) {
            let commonKeys = _intersect(it.debts, it.isOwed)
            commonKeys.forEach((common) => {
                let d = Math.abs(it.debts[common])
                let o = Math.abs(it.isOwed[common])
                let minNumber = Math.min(d, o)
                it.debts[common] = +(d - minNumber).toFixed(2) ?? 0;
                it.isOwed[common] = +(o - minNumber).toFixed(2) ?? 0;
            })
        }
    })

    // Remove 0's from records
    project.users.forEach((user: any) => {
        if (user['debts']) {
            for (const [userId, value] of Object.entries(user['debts'])) {
                let val = (value as number);
                if (!val || val == 0) {
                    delete user.debts[userId]
                }
            }
        }

        if (user['isOwed']) {
            for (const [userId, value] of Object.entries(user['isOwed'])) {
                let val = (value as number);
                if (!val || val == 0) {
                    delete user.isOwed[userId]
                }
            }
        }
    })
}

const updateUserIdToName = (project: { users: User[], expenses: Expense[] }) => {
    const users = [...project.users];
    project.users = project.users.map((user: User) => {
        let debtsMap: any = {};
        let isOwedMap: any = {};
        // debts mapped version of user
        if (user['debts']) {
            Object.entries(user['debts']).forEach(([id, amount]) => {
                let userObj = users.find(it => it.id == id)
                if (userObj) {
                    debtsMap[userObj.name] = amount;
                }
            });
        }

        if (user['isOwed']) {
            Object.entries(user['isOwed']).forEach(([id, amount]) => {
                let userObj = users.find(it => it.id == id)
                if (userObj) {
                    isOwedMap[userObj.name] = amount;
                }
            });
        }
        return { ...user, debtsMap, isOwedMap }
    })
}

const _intersect = (o1: any, o2: any) => {
    return Object.keys(o1).filter(k => Object.hasOwn(o2, k))
}