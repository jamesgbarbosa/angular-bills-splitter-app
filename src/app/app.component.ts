import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ProjectDetailComponent } from '../components/project-detail/project-detail.component';
import { Project } from '../model/project.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProjectDetailComponent, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Split Bill App';
  project: Project = {
    projectName: 'New Project',
    users: [
      { id: "user1", name: 'James' },
      { id: "user2", name: 'Jen' },
      { id: "user3", name: 'Jackson' },
      // { id: "user4", name: 'Jane' },
      // { id: "user5", name: 'Bob' },
    ],
    dateCreated: new Date(),
    expenses: []
  }

}
