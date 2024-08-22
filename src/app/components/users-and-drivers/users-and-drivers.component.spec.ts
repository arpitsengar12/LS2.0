import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAndDriversComponent } from './users-and-drivers.component';

describe('UsersAndDriversComponent', () => {
  let component: UsersAndDriversComponent;
  let fixture: ComponentFixture<UsersAndDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersAndDriversComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersAndDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
