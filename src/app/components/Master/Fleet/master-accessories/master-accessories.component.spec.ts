import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterAccessoriesComponent } from './master-accessories.component';

describe('MasterAccessoriesComponent', () => {
  let component: MasterAccessoriesComponent;
  let fixture: ComponentFixture<MasterAccessoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterAccessoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterAccessoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
