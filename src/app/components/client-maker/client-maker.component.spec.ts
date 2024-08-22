import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMakerComponent } from './client-maker.component';

describe('ClientMakerComponent', () => {
  let component: ClientMakerComponent;
  let fixture: ComponentFixture<ClientMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientMakerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
