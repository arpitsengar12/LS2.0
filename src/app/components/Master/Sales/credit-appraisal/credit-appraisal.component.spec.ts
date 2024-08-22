import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditAppraisalComponent } from './credit-appraisal.component';

describe('CreditAppraisalComponent', () => {
  let component: CreditAppraisalComponent;
  let fixture: ComponentFixture<CreditAppraisalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditAppraisalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditAppraisalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
