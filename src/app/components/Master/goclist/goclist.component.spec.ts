import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GOCListComponent } from './goclist.component';

describe('GOCListComponent', () => {
  let component: GOCListComponent;
  let fixture: ComponentFixture<GOCListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GOCListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GOCListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
