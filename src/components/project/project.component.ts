import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal.component';
import { Project } from '../../model/project.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadState } from '../../app/store/expense/expense.action';
import { ProjectService } from './project.service';
import { AngularFireModule } from "@angular/fire/compat";
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, AngularFireModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  projects: Project[] = []

  constructor(private projectService: ProjectService, private dialog: MatDialog, private store: Store<any>, private router: Router) {
    this.projectService.getProjects().subscribe((result: any) => {
      if (result) {
        this.projects = result;
      }
    })
  }

  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateProjectModalComponent, {})
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let projectId = Date.now().toString(36);
        let project: Project;
        project = {
          projectId: projectId,
          projectName: result.projectName,
          dateCreated: new Date(),
          users: result.users.map((it: any, index: number) => ({ id: index + 1, name: it.name, amount: 0 })),
          expenses: []
        }
        this.projectService.saveProject(project).then((result: any) => {
          this.store.dispatch(loadState({ payload: project }))
          this.router.navigate(['project', projectId])
        }).catch((err: any) => {
          console.log("Error", err)
        })
      }
    })
  }

  redirectToProject(id: string) {
    this.router.navigate(["project", id])
  }

}
