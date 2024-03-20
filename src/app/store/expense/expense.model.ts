import { Project } from "../../../model/project.model";

export interface ProjectState {
    project: Project,
    previousProjectState: Project
}