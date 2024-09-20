import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagmentonlyComponent } from './managmentonly.component';

describe('ManagmentonlyComponent', () => {
  let component: ManagmentonlyComponent;
  let fixture: ComponentFixture<ManagmentonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagmentonlyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagmentonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
