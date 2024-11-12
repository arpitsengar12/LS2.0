import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuotationAddnewComponent } from './quotation-addnew.component';

describe('QuotationAddnewComponent', () => {
  let component: QuotationAddnewComponent;
  let fixture: ComponentFixture<QuotationAddnewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationAddnewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationAddnewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
