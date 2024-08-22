import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../client.service';

export interface PeriodicElement {
  CreatedDate: string;
  Name: string;
  ClientName: string;
  Quotation: number;
  Profit: number;
  NonProfit: number;
  Loss: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  displayedColumns: string[] = ['CreatedDate', 'Name', 'ClientName', 'Quotation', 'Profit', 'NonProfit', 'Loss',];
  dataSource = new MatTableDataSource<PeriodicElement>();
  salesDataList: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Client Name' },
    { filterName: 'Quotation' },

  ];
  filterBtnClicked: boolean = false;
  selectedRowIndex: any;
  IsSearch: boolean = false;

  constructor(
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    protected commonService: CommonService,
  ) {

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);

    if (this.localTheme == null || this.localTheme == '') {
      this.mainThemeClass = 'default-blue-colored-theme';
    }
    else {
      this.mainThemeClass = this.localTheme.themeClass;
    }

    this.commonService.updateTheme.subscribe(res => {
      if (res) {
        this.mainThemeClass = res;
      }

    });
    this.getDashboardSalesData();
  }


  getDashboardSalesData() {
    const data =
    {
      Page:
      {
        // PageNumber: this.PageNumber + 1,
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.IsSearch,
          SearchValue: this.searchText,
          // ClientName: this.selectedFilter.filterName == "Client Name" ? this.searchText : "",
          // CityName: this.selectedFilter.filterName == "Quotation" ? this.searchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.salesDataList = [
      { CreatedDate: '07/06/2023', Name: 'HERO MOTOCORP LIMITED(C)', ClientName: 'HERO MOTOCORP LIMITED(C)', Quotation: 57, Profit: 13, NonProfit: 78, Loss: 88, },
      { CreatedDate: '25/06/2023', Name: 'HERO MOTOCORP LIMITED(D)', ClientName: 'HERO MOTOCORP LIMITED(D)', Quotation: 55, Profit: 35, NonProfit: 47, Loss: 35, },
      { CreatedDate: '18/08/2023', Name: 'HERO MOTOCORP LIMITED(A)', ClientName: 'HERO MOTOCORP LIMITED(A)', Quotation: 78, Profit: 59, NonProfit: 88, Loss: 68, },
      { CreatedDate: '23/09/2023', Name: 'HERO MOTOCORP LIMITED(B)', ClientName: 'HERO MOTOCORP LIMITED(B)', Quotation: 90, Profit: 38, NonProfit: 98, Loss: 28, }
    ];
    this.totalRecords = 4;
    this.selectedRowIndex = null;
    this.salesDataList.map((item, index) => {
      item.position = index;
    });
    // this.spinner.show();
    // this.clientService.getDashboardSalesData(formData).subscribe((res: any) => {
    //   if (res) {
    //     if (!res.HasErrors) {
    //       this.salesDataList = res.Records;
    //       this.totalRecords = res.TotalCount;
    //       this.spinner.hide();
    //     }
    //     else {
    //       this.toaster.error(res?.Errors[0]?.Message, undefined, {
    //         positionClass: 'toast-top-center'
    //       });
    //       this.spinner.hide();
    //     }
    //   }
    //   (err: any) => {
    //     this.toaster.error(err, undefined, {
    //       positionClass: 'toast-top-center'
    //     });
    //     this.spinner.hide();
    //   }
    // });
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getDashboardSalesData();
      }
    }
    else {
      this.selectedFilter = { filterName: '' };
    }
  }

  // to search on the text input
  SearchFilterApplied() {
    this.IsSearch = this.searchText && this.searchText != '' ? true : false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.getDashboardSalesData();
    }, 500);
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getDashboardSalesData();
  }

  getPages(): (number | string)[] {
    const totalPages = this.totalPages();
    let startPage = Math.max(1, this.PageNumber - 1);
    let endPage = Math.min(totalPages, startPage + 1);

    // If near the end, adjust the startPage
    if (totalPages - this.PageNumber <= 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    // If near the start, adjust the endPage
    if (this.PageNumber <= 3) {
      startPage = 1;
      endPage = Math.min(5, totalPages);
    }

    const pages: (number | string)[] = [];

    // Add first page
    pages.push(1);

    // // Add ellipsis if startPage is greater than 2
    // if (startPage > 2) {
    //   pages.push('...');
    // }

    // Add pages between startPage and endPage
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis if endPage is less than totalPages - 1
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Add last page
    if (totalPages !== 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / 10);
  }

  pageClick(event: any) {
    this.PageNumber = event;
    this.getDashboardSalesData();
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getDashboardSalesData();
  }
}