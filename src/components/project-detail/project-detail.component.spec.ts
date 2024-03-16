import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ProjectDetailComponent } from './project-detail.component';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

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
    let expenses = component.expenseReducerOutput.expenses
    let users = component.expenseReducerOutput.users
    expect(expenses.length).toBe(0)
    expect(users.length).toBe(0)
  });

});


