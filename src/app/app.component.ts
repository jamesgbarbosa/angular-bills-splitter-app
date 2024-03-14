import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from '../components/main/main.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Split Bill App';
  users = [
    { id: "user1", name: 'James' },
    { id: "user2", name: 'Jen' },
    { id: "user3", name: 'Jackson' },
    // { id: "user4", name: 'Jane' },
    // { id: "user5", name: 'Bob' },
  ]
}
