import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Project } from "../../../model/project.model";
import { ProjectState } from "./expense.model";

const getProjectState = createFeatureSelector<ProjectState>('expense');

export const selectProject = createSelector(
  getProjectState,
  (state: ProjectState) => state.project
);

export const previousProjectState = createSelector(
  getProjectState,
  (state: ProjectState) => state.previousProjectState
);

export const selectExpense = createSelector(
  getProjectState,
  (state: ProjectState) => state.project.expenses
);

export const selectUsers = createSelector(
  getProjectState,
  (state: ProjectState) => state.project.users
);

// export const selectExpense = (state : {project: Project}) => state.project;