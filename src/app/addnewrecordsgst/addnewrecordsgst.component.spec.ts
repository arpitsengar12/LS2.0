import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddnewrecordsgstComponent } from './addnewrecordsgst.component';

describe('AddnewrecordsgstComponent', () => {
  let component: AddnewrecordsgstComponent;
  let fixture: ComponentFixture<AddnewrecordsgstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddnewrecordsgstComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddnewrecordsgstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
