import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterShadesComponent } from './master-shades.component';

describe('MasterShadesComponent', () => {
  let component: MasterShadesComponent;
  let fixture: ComponentFixture<MasterShadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterShadesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterShadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
