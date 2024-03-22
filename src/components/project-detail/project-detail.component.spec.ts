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
  let firebaseServiceMock: any;
  let activatedRouteMock: any;

  let projectData = {
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

  beforeEach(async () => {
    firebaseServiceMock = {
      getProjectById: jest.fn()
    }

    activatedRouteMock = {
      paramMap: jest.fn()
    }

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
            paramMap: of({params: {id: "1"}})
        }
        }
      ]
    }).compileComponents();

    // **Importance of detectChanges()
    //  Delayed change detection is intentional 
    //  and useful. It gives the tester an opportunity
    //  to inspect and change the state of the component 
    //  before Angular initiates data binding and calls lifecycle hooks
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
  })

  it('should call getProjectById onInit', () => {
    const res = {
      data: () => {
        return projectData
      }
    }

    jest.spyOn(firebaseServiceMock, 'getProjectById').mockReturnValue(Promise.resolve(res))

    fixture.detectChanges();

    let expenses = component.currentProjectState.expenses;
    let users = component.currentProjectState.users;

    expect(firebaseServiceMock.getProjectById).toBeCalled()
    expect(firebaseServiceMock.getProjectById).toBeCalledWith("1")
    expect(expenses.length).toBe(0)
    expect(users.length).toBe(0)
  });

});


