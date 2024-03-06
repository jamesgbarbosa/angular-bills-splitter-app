import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlePaymentModalComponent } from './settle-payment-modal.component';

describe('SettlePaymentModalComponent', () => {
  let component: SettlePaymentModalComponent;
  let fixture: ComponentFixture<SettlePaymentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlePaymentModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettlePaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
