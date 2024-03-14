import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainComponent } from './main.component';
import { Expense } from '../../model/expenses.model';

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

  describe('computeSplitEquallyCreditObject', () => {
    it('should user1 paid 222 split equally', () => {
      const comp = component;
      const expense: Expense = {
        "userId": "",
        "id": "913",
        "paidBy": {
          "id": "user1",
          "name": "James"
        },
        "dateCreated": "2024-03-14T08:49:43.913Z",
        "amountPaid": 222,
        "name": "Foods and drinks",
      }
      const credit = comp.computeSplitEquallyCreditObject(expense, 3)
      const user1Credit = credit.user1;
      const user2Credit = credit.user2;
      const user3Credit = credit.user3;
      expect(user1Credit).toBe(148)
      expect(user2Credit).toBe(-74)
      expect(user3Credit).toBe(-74)
    })
  })

  describe('computeOwedFullAmountCreditObject', () => {
    it('should user1 paid 222 owed full amount', () => {
      const comp = component;
      const expense: Expense = {
        "userId": "",
        "id": "913",
        "paidBy": {
          "id": "user1",
          "name": "James"
        },
        "dateCreated": "2024-03-14T08:49:43.913Z",
        "amountPaid": 222,
        "name": "Foods and drinks",
      }
      const credit = comp.computeOwedFullAmountCreditObject(expense, 3)
      const user1Credit = credit.user1;
      const user2Credit = credit.user2;
      const user3Credit = credit.user3;
      expect(user1Credit).toBe(222)
      expect(user2Credit).toBe(-111)
      expect(user3Credit).toBe(-111)
    })
  })

  describe('computeSettleCreditObject', () => {
    it('should user1 settle 200 to user2', () => {
      const comp = component;
      const credit = comp.computeSettleCreditObject('user1', 'user2', 200)
      const user1Credit = credit.user1;
      const user2Credit = credit.user2;
      expect(user1Credit).toBe(200)
      expect(user2Credit).toBe(-200)
    })
  })

  describe('simplifyDebtBalance', () => {
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
      const amount_user1_owed_user2 = comp.userData[0].isOwed['user2']
      const amount_user1_owed_user3 = comp.userData[0].isOwed['user3']
      // Cause 8 - 5 = 3
      expect(amount_user1_owed_user2).toBe(3)
      expect(amount_user1_owed_user3).toBe(-8)
      expect(Object.keys(comp.userData[0].hasOwnProperty('debts')).length).toBe(0)
    })
  })
});
