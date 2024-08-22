import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompilanceComponent } from './add-compilance.component';

describe('AddCompilanceComponent', () => {
  let component: AddCompilanceComponent;
  let fixture: ComponentFixture<AddCompilanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCompilanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCompilanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
