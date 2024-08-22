import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUsersAndDriversComponent } from './create-users-and-drivers.component';

describe('CreateUsersAndDriversComponent', () => {
  let component: CreateUsersAndDriversComponent;
  let fixture: ComponentFixture<CreateUsersAndDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUsersAndDriversComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUsersAndDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
