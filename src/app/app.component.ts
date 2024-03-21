import { Component, Inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ProjectDetailComponent } from '../components/project-detail/project-detail.component';
import { Project } from '../model/project.model';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from "@angular/fire/compat";
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProjectDetailComponent, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Split Bill App';
}
