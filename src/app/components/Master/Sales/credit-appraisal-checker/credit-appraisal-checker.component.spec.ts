import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditAppraisalCheckerComponent } from './credit-appraisal-checker.component';

describe('CreditAppraisalCheckerComponent', () => {
  let component: CreditAppraisalCheckerComponent;
  let fixture: ComponentFixture<CreditAppraisalCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditAppraisalCheckerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditAppraisalCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
