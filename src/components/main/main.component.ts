import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  constructor() {
    console.log("Const")
  }

  ngOnInit(): void {
    console.log("On init")
  }
}
