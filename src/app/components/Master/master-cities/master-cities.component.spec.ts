import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterCitiesComponent } from './master-cities.component';

describe('MasterCitiesComponent', () => {
  let component: MasterCitiesComponent;
  let fixture: ComponentFixture<MasterCitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterCitiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterCitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
