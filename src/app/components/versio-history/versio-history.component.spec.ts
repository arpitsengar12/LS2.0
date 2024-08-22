import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersioHistoryComponent } from './versio-history.component';

describe('VersioHistoryComponent', () => {
  let component: VersioHistoryComponent;
  let fixture: ComponentFixture<VersioHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VersioHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VersioHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
