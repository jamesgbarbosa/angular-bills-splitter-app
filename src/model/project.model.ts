import { Expense } from "./expenses.model";
import { User } from "./user.model";

export interface Project {
    projectId?: string,
    projectName?: string,
    dateCreated?: Date | string,
    users: User[],
    expenses: Expense[]
}