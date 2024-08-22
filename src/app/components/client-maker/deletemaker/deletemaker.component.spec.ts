import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletemakerComponent } from './deletemaker.component';

describe('DeletemakerComponent', () => {
  let component: DeletemakerComponent;
  let fixture: ComponentFixture<DeletemakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletemakerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletemakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
