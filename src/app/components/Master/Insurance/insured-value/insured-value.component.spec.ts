import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuredValueComponent } from './insured-value.component';

describe('InsuredValueComponent', () => {
  let component: InsuredValueComponent;
  let fixture: ComponentFixture<InsuredValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsuredValueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuredValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
