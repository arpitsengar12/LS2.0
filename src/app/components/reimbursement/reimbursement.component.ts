import { Component } from '@angular/core';

@Component({
  selector: 'app-reimbursement',
  templateUrl: './reimbursement.component.html',
  styleUrls: ['./reimbursement.component.scss']
})
export class ReimbursementComponent {
  formVisible = true;
  fileProgressVisible = false;
  sessionUserFullName = "User Name"; // Fetch dynamically
  dataSource: any[] = []; // Replace with your data source type
  departments: string[] = ['HR', 'Finance', 'IT', 'Marketing'];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  displayedColumns: string[] = [

    'InvoiceNo',
    'Department',
    'Type',
    'InvoiceAmt',
    'FileName',
    'InvoiceDate',
    'FromDate',
    'ToDate',
    'Remark',
    'EmailID',
    'PayTo'
  ];
  

  // Called on page load or when form needs to be added, updated, or canceled
  addNew(action: number) {
    switch(action) {
      case 1: 
        this.formVisible = true;
        this.resetForm();
        break;
      case 2:
        this.validateInvoiceUpdateData(action);
        break;
      case 3:
        this.formVisible = false;
        break;
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.validateInvoiceData(1);
  }

  validateInvoiceData(action: number) {
    // Logic for validating and saving invoice data
    console.log("Validating and saving invoice data", action);
  }

  validateInvoiceUpdateData(action: number) {
    // Logic for validating and updating invoice data
    console.log("Validating and updating invoice data", action);
  }

  IsValidInvoiceNo(event: KeyboardEvent) {
    // Logic for validating invoice number during input
    console.log("Validating invoice number", event);
  }

  IsValidInvoiceNoPaste(value: string) {
    // Logic for validating pasted invoice number
    console.log("Validating pasted invoice number", value);
  }

  applyFilter(event: Event) {
    // Logic for filtering the data
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource = this.dataSource.filter(item => 
      item.InvoiceNo.toLowerCase().includes(filterValue.toLowerCase())
    );
  }


  

  resetForm() {
    // Logic to reset form fields
    console.log("Resetting form");
  }

  goBack() {
    // Logic to navigate back to previous page or view
    console.log("Going back");
  }
}
