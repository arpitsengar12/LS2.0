import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterObjectsComponent } from './master-objects.component';

describe('MasterObjectsComponent', () => {
  let component: MasterObjectsComponent;
  let fixture: ComponentFixture<MasterObjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterObjectsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
