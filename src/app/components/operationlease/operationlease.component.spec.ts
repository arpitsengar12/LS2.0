import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationleaseComponent } from './operationlease.component';

describe('OperationleaseComponent', () => {
  let component: OperationleaseComponent;
  let fixture: ComponentFixture<OperationleaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationleaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
