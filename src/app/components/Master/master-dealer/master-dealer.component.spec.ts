import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDealerComponent } from './master-dealer.component';

describe('MasterDealerComponent', () => {
  let component: MasterDealerComponent;
  let fixture: ComponentFixture<MasterDealerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterDealerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterDealerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
