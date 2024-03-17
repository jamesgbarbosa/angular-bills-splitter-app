import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbsPipe } from '../../pipes/abs.pipe';
import { Project } from '../../model/project.model';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [AbsPipe, CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent {
  @Input() project: Project | undefined;
}
