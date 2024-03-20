import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbsPipe } from '../../pipes/abs.pipe';
import { Project } from '../../model/project.model';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [AbsPipe, CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent implements OnInit {
  @Input() project: Project | undefined;
  users : any = [];
  ngOnInit(): void {
    this.users = this.project?.users.map((user: User) => ({...user, isExpanded: false}))
  }
  
  toggleExpand(user: any) {
    user.isExpanded = !user.isExpanded;
  }
}
