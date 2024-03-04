import { User } from "./user.model";

export interface Expense {
    id: string,
    dataCreated: Date,
    name: string,
    paidBy: User,
    debts: AmountBalance[],
    amountPaid: number
}

interface AmountBalance {
    id: string,
    amount: number
}