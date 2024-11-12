import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Location } from '@angular/common';
// import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';

@Component({
  selector: 'app-servicetypebooking',
  templateUrl: './servicetypebooking.component.html',
  styleUrls: ['./servicetypebooking.component.scss']
})
export class ServicetypebookingComponent implements OnInit {

  // Define form group for form validation
  bookingForm: FormGroup;



  // Table data and display settings
  displayedColumns: string[] = ['voiceOfCustomers', 'jobDescription', 'status', 'estimate'];
  tableData = new MatTableDataSource([
    { voiceOfCustomers: 'Data 1', jobDescription: 'Data 2', status: 'Option 1', estimate: 'Data 4' },
    { voiceOfCustomers: 'Data 2', jobDescription: 'Data 2', status: 'Option 2', estimate: 'Data 2' },
    { voiceOfCustomers: 'Data 2', jobDescription: 'Data 2', status: 'Option 2', estimate: 'Data 2' },
    { voiceOfCustomers: 'Data 2', jobDescription: 'Data 2', status: 'Option 2', estimate: 'Data 2' },
    // Add your data here
  ]);
  dropdownOptions = ['Option 1', 'Option 2', 'Option 3'];
  bookingPersons: string[] = ['John Doe', 'Jane Smith', 'Michael Johnson'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder) {
    // Create the form with validation for required fields
    this.bookingForm = this.fb.group({
      
      droppingTime: ['', Validators.required], // Timepicker form control
      bookingPerson: ['', Validators.required], // Dropdown selection
      jobDescription: ['', Validators.required] // Job description field
     
    });
  }


  ngOnInit(): void {
    // Initialize paginator and sorting
    this.tableData.paginator = this.paginator;
    this.tableData.sort = this.sort;
  }

  // Filter for table data
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableData.filter = filterValue.trim().toLowerCase();

    if (this.tableData.paginator) {
      this.tableData.paginator.firstPage();
    }
  }

  // Handle form submission
  onSubmit() {
    if (this.bookingForm.valid) {
      console.log('Form data:', this.bookingForm.value);
      // Handle form submission logic here
    } else {
      console.log('Form is invalid');
    }
  }
}
