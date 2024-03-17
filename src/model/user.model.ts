export interface User {
    id: number | string,
    name: string,
    amount: number,
    debts?: any,
    debtsMap?: any,
    isOwed?: any,
    isOwedMap?: any,
}