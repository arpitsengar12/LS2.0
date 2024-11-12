import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';


@Component({
  selector: 'app-addnewrecordsgst',
  templateUrl: './addnewrecordsgst.component.html',
  styleUrls: ['./addnewrecordsgst.component.scss']
})
export class AddnewrecordsgstComponent implements OnInit {

  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  };
  invoiceTypes: string[] = ['Regular', 'Credit', 'Debit', 'Proforma'];
  invoiceData = this.getInitialData();
  invoiceForm: FormGroup;
  displayedColumns: string[] = ['check','sno', 'invoiceType', 'vNo', 'description', 'from', 'to', 'days', 'amount', 'cgst', 'sgst', 'igst', 'utgst', 'cess', 'netAmount', 'remarks','delete'];
  dataSource = new MatTableDataSource<any>([]); // Define the data source

  constructor(private fb: FormBuilder,
    public location: Location,

  ) {
    
  }

  ngOnInit(): void {
    // Initialize the form with controls and validators
    this.invoiceForm = this.fb.group({
      
      vNo: ['', Validators.required],
      entryDate: ['', Validators.required],
      type: ['', Validators.required],
      dealer: ['', Validators.required],
      smasState: ['', Validators.required],
      invoiceNo: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      transactionType: ['invoice', Validators.required],
      paymentType: ['', Validators.required],
      hsnCode: [''],
      invoiceAmount: [0, Validators.required],
      cgst: [0],
      sgst: [0],
      igst: [0],
      department: ['', Validators.required],
      incharge: ['', Validators.required],
      receivedDate: ['', Validators.required],
      paymentRequiredDate: ['', Validators.required],
    });

    // Example: Populate the table with initial data
    this.dataSource.data = this.getInitialData();
  }

  // Handle form submission
  onSubmit() {
    if (this.invoiceForm.valid) {
      console.log(this.invoiceForm.value);
      // You can add the form data to the table, for example:
      this.addRecordToTable(this.invoiceForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  // Example method to add a record to the table
  addRecordToTable(record: any) {
    const currentData = this.dataSource.data;
    currentData.push({ ...record, id: currentData.length + 1 });
    this.dataSource.data = currentData; // Update the table data source
  }
  deleteRecord(element: any) {
    const index = this.invoiceData.indexOf(element);
    if (index > -1) {
      this.invoiceData.splice(index, 1); // Remove the element from the data array
    }
  }

  // Example initial data
  getInitialData() {
    return [
      {
        checked:false,
        sno: 1, 
        invoiceType: 'Regular', 
        vNo: 'V123', 
        description: 'Goods Purchase', 
        from: '2024-10-01', 
        to: '2024-10-05', 
        days: 5, 
        amount: 10000, 
        cgst: 500, 
        sgst: 500, 
        igst: 0, 
        utgst: 0, 
        cess: 0, 
        netAmount: 11000, 
        remarks: 'First record'
      },
      {
        sno: 2, 
        invoiceType: 'Service', 
        vNo: 'V124', 
        description: 'Consulting Service', 
        from: '2024-10-06', 
        to: '2024-10-07', 
        days: 2, 
        amount: 15000, 
        cgst: 750, 
        sgst: 750, 
        igst: 0, 
        utgst: 0, 
        cess: 0, 
        netAmount: 16500, 
        remarks: 'Second record'
      }
    ];

    
  }
  
}
