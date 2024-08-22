import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompilanceComponent } from './compilance.component';

describe('CompilanceComponent', () => {
  let component: CompilanceComponent;
  let fixture: ComponentFixture<CompilanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompilanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompilanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
