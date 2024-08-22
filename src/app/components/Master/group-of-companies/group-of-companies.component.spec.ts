import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupOfCompaniesComponent } from './group-of-companies.component';

describe('GroupOfCompaniesComponent', () => {
  let component: GroupOfCompaniesComponent;
  let fixture: ComponentFixture<GroupOfCompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupOfCompaniesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupOfCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
