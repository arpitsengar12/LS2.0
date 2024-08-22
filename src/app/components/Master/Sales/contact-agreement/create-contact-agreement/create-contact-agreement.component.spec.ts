import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateContactAgreementComponent } from './create-contact-agreement.component';

describe('CreateContactAgreementComponent', () => {
  let component: CreateContactAgreementComponent;
  let fixture: ComponentFixture<CreateContactAgreementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateContactAgreementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateContactAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
