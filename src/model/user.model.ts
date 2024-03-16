export interface User {
    id: string,
    name: string,
    amount: number,
    debts?: any,
    debtsMap?: any,
    isOwed?: any,
    isOwedMap?: any,
}