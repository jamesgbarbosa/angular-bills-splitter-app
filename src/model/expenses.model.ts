import { User } from "./user.model";

export interface Expense {
    id: string,
    dataCreated: Date,
    name: string,
    paidBy: User,
    credit: any,
    amountPaid: number,
    transactionType: string
}

interface AmountBalance {
    id: string,
    amount: number
}