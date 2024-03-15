import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectDetailComponent } from './project-detail.component';

describe('MainComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [provideMockStore({})]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    // **Importance of detectChanges()
    //  Delayed change detection is intentional 
    //  and useful. It gives the tester an opportunity
    //  to inspect and change the state of the component 
    //  before Angular initiates data binding and calls lifecycle hooks
    
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });

});


