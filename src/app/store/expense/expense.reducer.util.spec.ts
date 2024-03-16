import { Expense } from "../../../model/expenses.model";
import { User } from "../../../model/user.model";
import { initializeAmountBalancePerUser, initializeIsOwedAndDebtsMap, simplifyDebtBalance, updateUserIdToName } from "./expense.reducer.util";

describe('expense reducer', () => {
    let expense: { users: User[], expenses: Expense[] };
    beforeEach(() => {
        expense = {
            "users": [
                {
                    "id": "user1",
                    "name": "James",
                    "amount": 0,
                },
                {
                    "id": "user2",
                    "name": "Jen",
                    "amount": 0
                },
                {
                    "id": "user3",
                    "name": "Jackson",
                    "amount": 0
                }
            ],
            "expenses": [
                {
                    "id": "566",
                    "paidBy": {
                        "id": "user1",
                        "name": "James"
                    },
                    "dateCreated": "2024-03-16T08:21:52.566Z",
                    "amountPaid": 6,
                    "name": "Foods and drinks",
                    "transactionType": "SPLIT_EQUALLY",
                    "credit": {
                        "user1": 4,
                        "user2": -2,
                        "user3": -2
                    }
                }
            ]
        }
    })

    describe('initializeAmountBalancePerUser', () => {
        it('should be compute initialize the amount per user for 1 expense', () => {
            initializeAmountBalancePerUser(expense);
            let user1Amount = 4;
            let user2Amount = -2;
            let user3Amount = -2;
            expect(expense.users[0].amount).toBe(user1Amount)
            expect(expense.users[1].amount).toBe(user2Amount)
            expect(expense.users[2].amount).toBe(user3Amount)
        })

        it('should be compute initialize the amount per user for 2 expense', () => {
            let expense2 = {
                "id": "111",
                "paidBy": {
                    "id": "user1",
                    "name": "James"
                },
                "dateCreated": "2024-03-16T08:21:52.566Z",
                "amountPaid": 6,
                "name": "Foods and drinks",
                "transactionType": "SPLIT_EQUALLY",
                "credit": {
                    "user1": 4,
                    "user2": -2,
                    "user3": -2
                }
            }
            expense.expenses.push(expense2)
            initializeAmountBalancePerUser(expense);
            expect(expense.users[0].amount).toBe(8)
            expect(expense.users[1].amount).toBe(-4)
            expect(expense.users[2].amount).toBe(-4)
        })
    })

    describe('initializeIsOwedAndDebtsMap', () => {
        it('should initialize the isOwed and Debts map', () => {
            initializeIsOwedAndDebtsMap(expense);
            expect(expense.users[0].isOwed['user2']).toBe(-2)
            expect(expense.users[0].isOwed['user3']).toBe(-2)
            expect(expense.users[1].debts['user1']).toBe(-2)
            expect(expense.users[2].debts['user1']).toBe(-2)
        })
    })

    describe('simplifyDebtBalance', () => {
        it('should simply overlapping debts and isOwed balances', () => {
            const expense2 = {
                "id": "288",
                "paidBy": {
                    "id": "user2",
                    "name": "Jen"
                },
                "dateCreated": "2024-03-16T08:50:32.288Z",
                "amountPaid": 6,
                "name": "Foods and drinks",
                "transactionType": "SPLIT_EQUALLY",
                "credit": {
                    "user1": -8.33,
                    "user2": 16.67,
                    "user3": -8.33
                }
            }
            expense.expenses.push(expense2);
            initializeIsOwedAndDebtsMap(expense);
            simplifyDebtBalance(expense);
            expect(expense.users[0].debts['user2']).toBe(6.33)
            expect(expense.users[0].isOwed['user3']).toBe(-2)

            expect(expense.users[1].isOwed['user1']).toBe(6.33)
            expect(expense.users[1].isOwed['user3']).toBe(-8.33)

            expect(expense.users[2].debts['user1']).toBe(-2)
            expect(expense.users[2].debts['user2']).toBe(-8.33)
        })
    })

    describe('updateUserIdToName', () => {
        it('should update the debts and isOwed key mappings from user id to user name', () => {
            initializeIsOwedAndDebtsMap(expense);
            updateUserIdToName(expense);
            
            expect(expense.users[0].isOwed).not.toBe(null)
            expect(expense.users[0].isOwedMap).not.toBe(null)

            let [userId2, userId3] = Object.keys(expense.users[0].isOwed);
            const userName2 = expense.users.find(it => it.id == userId2)?.name
            const userName3 = expense.users.find(it => it.id == userId3)?.name

            let [isOwedMapKey1, isOwedMapKey2] = Object.keys(expense.users[0].isOwedMap);

            expect(userName2).toBe(isOwedMapKey1)
            expect(userName3).toBe(isOwedMapKey2)

        })
    })
})