import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';  // Import Router

export interface ExpenseClaim {
  RowID: number;
  Act: string;
  SubmtdOn: string;
  InvoiceNo: string;
  Type: string;
  InvAmt: number;
  InvDate: string;
  Department: string;
  FromDate: string;
  ToDate: string;
  PayTo: string;
  Remark: string;
  Status: string;
  ChqNo: string;
  ChqDate: string;
  ChqAmt: number;
}

const EXPENSE_CLAIMS_DATA: ExpenseClaim[] = [
  { RowID: 1, Act: '1673', SubmtdOn: '2024-08-01', InvoiceNo: 'INV001', Type: 'Invoice', InvAmt: 231, InvDate: '2024-03-16', Department: 'Admin', FromDate: '2024-03-10', ToDate: '2024-03-15', PayTo: 'Ashok.kumar', Remark: 'Normal', Status: 'Pending', ChqNo: '', ChqDate: '', ChqAmt: 0 },
  { RowID: 2, Act: '1674', SubmtdOn: '2024-08-02', InvoiceNo: 'INV002', Type: 'Expense', InvAmt: 500, InvDate: '2024-03-17', Department: 'Finance', FromDate: '2024-03-12', ToDate: '2024-03-18', PayTo: 'Rahul Sharma', Remark: 'Urgent', Status: 'Approved', ChqNo: 'CHQ001', ChqDate: '2024-03-20', ChqAmt: 500 },
  // Add more data as needed
];

@Component({
  selector: 'app-expense-claim',
  templateUrl: './expense-claim.component.html',
  styleUrls: ['./expense-claim.component.scss']
})
export class ExpenseClaimComponent implements OnInit {
  
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  };

  displayedColumns: string[] = ['RowID', 'Act', 'SubmtdOn', 'InvoiceNo', 'Type', 'InvAmt', 'InvDate', 'Department', 'FromDate', 'ToDate', 'PayTo', 'Remark', 'Status', 'ChqNo', 'ChqDate', 'ChqAmt'];
  dataSource: MatTableDataSource<ExpenseClaim>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router) {  // Inject Router
    this.dataSource = new MatTableDataSource(EXPENSE_CLAIMS_DATA);
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
