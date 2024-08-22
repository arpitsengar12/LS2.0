import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRolePopUpComponent } from './create-role-pop-up.component';

describe('CreateRolePopUpComponent', () => {
  let component: CreateRolePopUpComponent;
  let fixture: ComponentFixture<CreateRolePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateRolePopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRolePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
