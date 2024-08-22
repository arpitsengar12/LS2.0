import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerManufacturerRelnComponent } from './dealer-manufacturer-reln.component';

describe('DealerManufacturerRelnComponent', () => {
  let component: DealerManufacturerRelnComponent;
  let fixture: ComponentFixture<DealerManufacturerRelnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealerManufacturerRelnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealerManufacturerRelnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
