import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterStatesComponent } from './master-states.component';

describe('MasterStatesComponent', () => {
  let component: MasterStatesComponent;
  let fixture: ComponentFixture<MasterStatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterStatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterStatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
