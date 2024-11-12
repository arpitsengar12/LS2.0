import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

export interface InvoiceElement {
  SNo: number;
  VNo: string;
  EntryDate: Date;
  InvoiceType: string;
  InvoiceNo: string;
  InvoiceDate: Date;
  Dealer: string;
  Amount: number;
  NetAmount: number;
  Deduction: number;
  NetPayable: number;
  BatchNo: string;
  BatchDate: Date;
  ChequeNo: string;
  ChequeDate: Date;
  ChequeAmount: number;
  ChequeRemarks: string;
  TDSAmount: number;
  TDSPer: number;
  CreatedBy: string;

}

@Component({
  selector: 'app-gstoverheadinvoice',
  templateUrl: './gstoverheadinvoice.component.html',
  styleUrls: ['./gstoverheadinvoice.component.scss']
})
export class GstoverheadinvoiceComponent implements OnInit {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  };
  isAddAccess: boolean = false;

  displayedColumns: string[] = [
   'Actions', 'SNo', 'VNo', 'EntryDate', 'InvoiceType', 'InvoiceNo', 
    'InvoiceDate', 'Dealer', 'Amount', 'NetAmount', 
    'Deduction', 'NetPayable', 'BatchNo', 'BatchDate', 
    'ChequeNo', 'ChequeDate', 'ChequeAmount', 
    'ChequeRemarks', 'TDSAmount', 'TDSPer', 'CreatedBy',
  ];
  selectedComponent: string = '';
  dataSource: MatTableDataSource<InvoiceElement>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Sample data for the table
  invoices: InvoiceElement[] = [
    {
      SNo: 1,
      VNo: 'V001',
      EntryDate: new Date('2023-10-01'),
      InvoiceType: 'Type A',
      InvoiceNo: 'INV001',
      InvoiceDate: new Date('2023-10-05'),
      Dealer: 'Dealer A',
      Amount: 1000,
      NetAmount: 950,
      Deduction: 50,
      NetPayable: 950,
      BatchNo: 'B001',
      BatchDate: new Date('2023-10-10'),
      ChequeNo: 'CH001',
      ChequeDate: new Date('2023-10-15'),
      ChequeAmount: 950,
      ChequeRemarks: 'Payment for Invoice 001',
      TDSAmount: 100,
      TDSPer: 10,
      CreatedBy: 'User A',
    },
    {
      SNo: 2,
      VNo: 'V002',
      EntryDate: new Date('2023-10-02'),
      InvoiceType: 'Type B',
      InvoiceNo: 'INV002',
      InvoiceDate: new Date('2023-10-06'),
      Dealer: 'Dealer B',
      Amount: 2000,
      NetAmount: 1900,
      Deduction: 100,
      NetPayable: 1900,
      BatchNo: 'B002',
      BatchDate: new Date('2023-10-12'),
      ChequeNo: 'CH002',
      ChequeDate: new Date('2023-10-18'),
      ChequeAmount: 1900,
      ChequeRemarks: 'Payment for Invoice 002',
      TDSAmount: 200,
      TDSPer: 10,
      CreatedBy: 'User B',
    }
    // Add more sample data as needed
  ];

  constructor() {
    this.dataSource = new MatTableDataSource(this.invoices);
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // Additional methods for sorting, filtering, and theme management can be added here
}
