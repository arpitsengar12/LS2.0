import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproverScreenComponent } from './approver-screen.component';

describe('ApproverScreenComponent', () => {
  let component: ApproverScreenComponent;
  let fixture: ComponentFixture<ApproverScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproverScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproverScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
