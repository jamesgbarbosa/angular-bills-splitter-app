import { Routes } from '@angular/router';
import { ProjectComponent } from '../components/project/project.component';
import { ProjectDetailComponent } from '../components/project-detail/project-detail.component';

export const routes: Routes = [
    {
        path: "",
        component: ProjectComponent
    },
    {
        path: "project/:id",
        component: ProjectDetailComponent
    }
];
