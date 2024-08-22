import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManufacturersComponent } from './add-manufacturers.component';

describe('AddManufacturersComponent', () => {
  let component: AddManufacturersComponent;
  let fixture: ComponentFixture<AddManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddManufacturersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
