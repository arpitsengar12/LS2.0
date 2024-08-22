import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterBudgetComponent } from './master-budget.component';

describe('MasterBudgetComponent', () => {
  let component: MasterBudgetComponent;
  let fixture: ComponentFixture<MasterBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterBudgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
