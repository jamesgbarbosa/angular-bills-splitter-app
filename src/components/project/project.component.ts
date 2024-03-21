import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal.component';
import { Project } from '../../model/project.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadState, pushChanges } from '../../app/store/expense/expense.action';
import { ProjectFirebaseService } from './project.firebase.service';
import { AngularFireModule } from "@angular/fire/compat";
import { User } from '../../model/user.model';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, AngularFireModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  projects: Project[] = []
  isLoading = false;

  constructor(private projectFirebaseService: ProjectFirebaseService, private dialog: MatDialog, private store: Store<any>, private router: Router) {
    this.isLoading = true;
    this.projectFirebaseService.getProjects().subscribe((result: any) => {
      if (result) {
        this.projects = result.map((project: Project) => ({...project, users: project.users.map((it: User) => it.name).join(", ")}))
      }
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      console.error("Error")
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
        this.projectFirebaseService.saveProject(project).then((result: any) => {
          // this.store.dispatch(loadState({ payload: project }))
          // this.store.dispatch(pushChanges())
          this.router.navigate(['project', result?.id])
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
