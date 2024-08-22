import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMenuPopUpComponent } from './add-menu-pop-up.component';

describe('AddMenuPopUpComponent', () => {
  let component: AddMenuPopUpComponent;
  let fixture: ComponentFixture<AddMenuPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMenuPopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMenuPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
