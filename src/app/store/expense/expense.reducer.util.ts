import { Expense } from "../../../model/expenses.model";
import { Project } from "../../../model/project.model";
import { User } from "../../../model/user.model";

export const initializeIsOwedAndDebtsMap = (project: Project) => {
    initializeDebtsObject(project)
    initializeIsOwedObject(project)
}
const initializeIsOwedObject = (project: Project) => {
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

const initializeDebtsObject = (project: Project) => {
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

export const initializeAmountBalancePerUser = (project: Project) => {
    const calculateTotalAmount = (id: string) => {
        return project.expenses.reduce((total, expense) => {
            return +(total + (expense.credit[id] ?? 0)).toFixed(2)
        }, 0)
    }

    project.users = project.users.map((it: any) => {
        return { ...it, amount: calculateTotalAmount(it.id) }
    })
}

export const simplifyDebtBalance = (project: Project) => {
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

export const updateUserIdToName = (project: Project) => {
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
        return {...user, debtsMap, isOwedMap }
    })
}

const _intersect = (o1: any, o2: any) => {
    return Object.keys(o1).filter(k => Object.hasOwn(o2, k))
}