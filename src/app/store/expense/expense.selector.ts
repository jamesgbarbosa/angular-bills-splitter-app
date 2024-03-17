import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Project } from "../../../model/project.model";

const getProjectState = createFeatureSelector<Project>('expense');

export const selectExpense = createSelector(
    getProjectState,
    (state: Project) => state.expenses
  );

export const selectUsers = createSelector(
    getProjectState,
    (state: Project) => state.users
  );    
  
// export const selectExpense = (state : {project: Project}) => state.project;