import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    // **Importance of detectChanges()
    //  Delayed change detection is intentional 
    //  and useful. It gives the tester an opportunity
    //  to inspect and change the state of the component 
    //  before Angular initiates data binding and calls lifecycle hooks
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#initializeUsers() should create 3 users', () => {
    const comp = component;
    comp.initializeUsers();
    expect(comp.userData.length).toBe(3)
  })

  it('#simplifyDebtBalance() should simplify debt and owed object', () => {
    const comp = component;
    comp.userData = [{
      "id": "user1",
      "name": "James",
      "amount": 16.67,
      "isOwed": {
        "user2": -8,
        "user3": -8
      },
      "debts": {
        "user2": -5
      }
    }]
    comp.simplifyDebtBalance()
    const user2 = comp.userData[0].isOwed['user2']
    const user3 = comp.userData[0].isOwed['user3']
    // Cause 8 - 5 = 3
    expect(user2).toBe(3)
    expect(user3).toBe(-8)
    expect(Object.keys(comp.userData[0].hasOwnProperty('debts')).length).toBe(0)
  })
});
