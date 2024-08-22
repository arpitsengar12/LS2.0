import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { PeriodicElement } from '../../compilance/compilance.component';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Location } from '@angular/common';
import { Sort } from '@angular/material/sort';

export interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-master-dealer',
  templateUrl: './master-dealer.component.html',
  styleUrls: ['./master-dealer.component.scss']
})
export class MasterDealerComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  @ViewChild('dealerTableList') dealerTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns: string[] = ['CreditorId', 'VendorId', 'SiteId', 'SiteName', 'CreditorName', 'IsDealer', 'GstNo', 'IsVerified', 'City', 'AccType', 'Status', 'OracleClientId', 'OracleSiteId', 'ClientUploadStatus', 'WFStatus', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  dealerList: any[] = [];
  totalRecords: any;
  dealerId: number = 0;
  PageNumber: number = 1;
  PageSize: number = 10;
  selectedtab: number = 0;
  selectedValue?: string;
  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Creditor ID' },
    { filterName: 'R12 Vendor ID' },
    { filterName: 'R12 Site Name' },
    { filterName: 'Creditor Name' },
    { filterName: 'GST No.' },
    { filterName: 'City' },
    { filterName: 'Email' },
    { filterName: 'Account Type' },
    { filterName: 'Oracle Client Site ID' },
  ];
  filterBtnClicked: boolean = false;
  filterAllBtnClicked: boolean = false;
  OtherFilterList = [
    { filterName: 'All Active' },
    { filterName: 'Dealer' },
    { filterName: 'Creditor' },
    { filterName: 'Oracle Code Not Update' },
    { filterName: 'Stagged' },
    { filterName: 'Not Stagged' },
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  selectedRowIndex: any;
  IsSearch: boolean = false;

  constructor(
    public dialog: MatDialog,
    private clientService: ClientService,
    private router: Router,
    private toaster: ToastrService,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
  ) {

    if (history.state.level) {
      this.IsAuditTrail = history.state.IsAuditTrail;
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

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
    this.getAllDealers();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }

  getAllDealers() {
    const data =
    {
      Page:
      {
        // PageNumber: this.PageNumber + 1,
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          CreatedById: this.currentUser.UserId,
          IsSearch: this.IsSearch,
          // SearchValue: this.searchText,
          CreditorName: this.selectedFilter.filterName == "Creditor Name" ? this.searchText : "",
          CityName: this.selectedFilter.filterName == "City" ? this.searchText : "",
          Email1: this.selectedFilter.filterName == "Email" ? this.searchText : "",
          GstNo: this.selectedFilter.filterName == "GST No." ? this.searchText : "",
          OracleR12ClientSiteId: this.selectedFilter.filterName == "Oracle Client Site ID" ? this.searchText : "",
          OracleR12VendorId: this.selectedFilter.filterName == "R12 Vendor ID" ? this.searchText : "",
          R12VendorSiteName: this.selectedFilter.filterName == "R12 Site Name" ? this.searchText : "",
          Id: this.selectedFilter.filterName == "Creditor ID" ? this.searchText : "",
          AccType: this.selectedFilter.filterName == "Account Type" ? this.searchText : "",
          Value: 1,
          allActive: this.selectedFilter.filterName == "All Active" ? "All Active" : "",
          IsDealer: this.selectedFilter.filterName == "Dealer" ? "Dealer" : "",
          IsCreditor: this.selectedFilter.filterName == "Creditor" ? "Creditor" : "",
          OracleCodeNotUpdate: this.selectedFilter.filterName == "Oracle Code Not Update" ? "Oracle Code Not Update" : "",
          Stagged: this.selectedFilter.filterName == "Stagged" ? "Stagged" : "",
          NotStagged: this.selectedFilter.filterName == "Not Stagged" ? "Not Stagged" : "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllDealers(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.dealerList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.dealerList.map((item, index) => {
            item.position = index;
          });
          this.spinner.hide();
        }
        else {
          this.toaster.error(res?.Errors[0]?.Message, undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
        }
      }
      (err: any) => {
        this.toaster.error(err, undefined, {
          positionClass: 'toast-top-center'
        });
        this.spinner.hide();
      }
    });
  }

  onBtnClick(event: any) {
    console.log(this.selectedValue);
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllDealers();
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
      this.getAllDealers();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.dealerList = this.commonService.customSort(this.dealerList, sortState.active, sortState.direction);
      this.dealerTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllDealers();
  }



  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllDealers();
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
    this.getAllDealers();
  }


  addClick() {
    this.router.navigate(["/add-masterDealer"], {
      state: { level: this.AccessLevel, }
    })
  }

  tabClick(event: any) {
    this.selectedtab = event.index
  }

  openViewDialog(event: any) {
    this.router.navigate(["/add-masterDealer"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "view", IsAuditTrail: this.IsAuditTrail
      }
    });
  }

  openEditModal(event: any) {
    this.router.navigate(["/add-masterDealer"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "edit", IsAuditTrail: this.IsAuditTrail
      }
    });

  }

  selectedClient(event: any) {
    if (event) {
      this.dealerId = event.dealerId;
    }
  }
}