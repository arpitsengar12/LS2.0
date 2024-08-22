import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverExlUpldPopUpComponent } from './driver-exl-upld-pop-up.component';

describe('DriverExlUpldPopUpComponent', () => {
  let component: DriverExlUpldPopUpComponent;
  let fixture: ComponentFixture<DriverExlUpldPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverExlUpldPopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverExlUpldPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
