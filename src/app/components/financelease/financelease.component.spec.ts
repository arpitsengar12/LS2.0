import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceleaseComponent } from './financelease.component';

describe('FinanceleaseComponent', () => {
  let component: FinanceleaseComponent;
  let fixture: ComponentFixture<FinanceleaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceleaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
