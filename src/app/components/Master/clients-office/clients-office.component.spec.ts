import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsOfficeComponent } from './clients-office.component';

describe('ClientsOfficeComponent', () => {
  let component: ClientsOfficeComponent;
  let fixture: ComponentFixture<ClientsOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsOfficeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
