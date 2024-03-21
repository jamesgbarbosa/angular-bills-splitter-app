import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ProjectDetailComponent } from './project-detail.component';
import { of } from 'rxjs';
import { ProjectFirebaseService } from '../project/project.firebase.service';
import { describe, expect, jest } from '@jest/globals'
import { ActivatedRoute } from '@angular/router';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let firebaseServiceMock = {
    getProjectById: jest.fn(() => of({data: () => {
      return {
        expenses: [],
        users: [
          {
            name: "James"
          },
          {
            name: "Jen"
          }
        ]
      }
    }}))
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
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
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: any) => 'value' })
        }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    // **Importance of detectChanges()
    //  Delayed change detection is intentional 
    //  and useful. It gives the tester an opportunity
    //  to inspect and change the state of the component 
    //  before Angular initiates data binding and calls lifecycle hooks
    
  });

  it('should create', () => {
    fixture.detectChanges();
    let expenses = component.currentProjectState.expenses
    let users = component.currentProjectState.users
    expect(expenses.length).toBe(0)
    expect(users.length).toBe(0)
  });

});


