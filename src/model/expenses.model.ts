import { User } from "./user.model";

export interface Expense {
    id: string,
    dataCreated: Date,
    name: string,
    paidBy: User,
    credit: any, // {<userId>, <credit/debit balance>, ... }
    amountPaid: number,
    transactionType: string
}