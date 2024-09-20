import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlsalesandleasebackComponent } from './flsalesandleaseback.component';

describe('FlsalesandleasebackComponent', () => {
  let component: FlsalesandleasebackComponent;
  let fixture: ComponentFixture<FlsalesandleasebackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlsalesandleasebackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlsalesandleasebackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
