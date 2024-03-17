import { User } from "./user.model";

export interface Expense {
    userId?: string,
    id?: string,
    dateCreated?: Date | string,
    dateUpdated?: Date | string,
    name?: string,
    paidBy: User | undefined,
    settlementTo?: string,
    credit?: any, // {<userId>, <credit/debit balance>, ... }
    amountPaid: number,
    transactionType?: string
}