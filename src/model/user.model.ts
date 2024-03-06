export interface User {
    id: string,
    name: string,
    amount?: number | string,
    debts?: any,
    debtsMap?: any,
    isOwed?: any,
    isOwedMap?: any,
}