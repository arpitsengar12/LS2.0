import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GstoverheadinvoiceComponent } from './gstoverheadinvoice.component';

describe('GstoverheadinvoiceComponent', () => {
  let component: GstoverheadinvoiceComponent;
  let fixture: ComponentFixture<GstoverheadinvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GstoverheadinvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GstoverheadinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
