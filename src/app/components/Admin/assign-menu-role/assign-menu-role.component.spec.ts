import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignMenuRoleComponent } from './assign-menu-role.component';

describe('AssignMenuRoleComponent', () => {
  let component: AssignMenuRoleComponent;
  let fixture: ComponentFixture<AssignMenuRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignMenuRoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignMenuRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
