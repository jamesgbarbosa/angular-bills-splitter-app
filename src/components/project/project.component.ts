import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal.component';
import { Project } from '../../model/project.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadState } from '../../app/store/expense/expense.action';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent {
  projects = [{
    name: "Project 1"
  }]

  router = inject(Router)
  dialog = inject(MatDialog)
  store = inject(Store<any>)

  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateProjectModalComponent, {})
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let projectId = Date.now().toString(36);
        let project: Project;
        project = {
          projectId: projectId,
          projectName: result.projectName,
          dateCreated: new Date(),
          users: result.users.map((it: any, index: number) => ({id: index+1, name: it.name, amount: 0})),
          expenses: []
        }
        this.store.dispatch(loadState({payload: project}))
        this.router.navigate(['project', projectId])
      }
    })
  }

  redirectToProject() {
    this.router.navigate(["project","1"])
  }
}
