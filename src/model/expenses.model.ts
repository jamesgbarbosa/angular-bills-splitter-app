import { User } from "./user.model";

export interface Expense {
    userId?: string,
    id: string,
    dateCreated: Date,
    name?: string,
    paidBy: User | undefined,
    credit?: any, // {<userId>, <credit/debit balance>, ... }
    amountPaid: number,
    transactionType?: string
}