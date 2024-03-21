import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectComponent } from './project.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectFirebaseService } from './project.firebase.service';
import { describe, expect, jest } from '@jest/globals'
import { of } from 'rxjs';

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let firebaseServiceMock = {
    getProjects: jest.fn(() => of([{
      projects: [],
      users: [
        {
          name: "James"
        },
        {
          name: "Jen"
        }
      ]
    }]))
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: 'expense',
              value: {
                users: [],
                expenses: []
              },
            },
          ],
        }),
        {
          provide: ProjectFirebaseService,
          useValue: firebaseServiceMock
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialize project from firebase service call', () => {
    expect(component.projects[0].users).toBe("James, Jen")
  })
});
