import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicetypebookingComponent } from './servicetypebooking.component';

describe('ServicetypebookingComponent', () => {
  let component: ServicetypebookingComponent;
  let fixture: ComponentFixture<ServicetypebookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicetypebookingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicetypebookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
