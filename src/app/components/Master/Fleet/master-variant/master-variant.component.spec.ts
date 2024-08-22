import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterVariantComponent } from './master-variant.component';

describe('MasterVariantComponent', () => {
  let component: MasterVariantComponent;
  let fixture: ComponentFixture<MasterVariantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterVariantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterVariantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
