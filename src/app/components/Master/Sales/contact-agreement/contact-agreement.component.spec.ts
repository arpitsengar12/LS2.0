import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAgreementComponent } from './contact-agreement.component';

describe('ContactAgreementComponent', () => {
  let component: ContactAgreementComponent;
  let fixture: ComponentFixture<ContactAgreementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactAgreementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
