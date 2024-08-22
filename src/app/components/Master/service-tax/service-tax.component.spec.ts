import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTaxComponent } from './service-tax.component';

describe('ServiceTaxComponent', () => {
  let component: ServiceTaxComponent;
  let fixture: ComponentFixture<ServiceTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceTaxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
