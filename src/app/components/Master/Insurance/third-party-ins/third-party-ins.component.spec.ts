import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyInsComponent } from './third-party-ins.component';

describe('ThirdPartyInsComponent', () => {
  let component: ThirdPartyInsComponent;
  let fixture: ComponentFixture<ThirdPartyInsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThirdPartyInsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdPartyInsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
