import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from 'src/app/components/client.service';
import { DeletemakerComponent } from './deletemaker/deletemaker.component';
import { VersioHistoryComponent } from '../versio-history/versio-history.component';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { MatSort, Sort } from '@angular/material/sort';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-client-maker',
  templateUrl: './client-maker.component.html',
  styleUrls: ['./client-maker.component.scss']
})
export class ClientMakerComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;

  displayedColumns: string[] = ['Prospect Name', 'Agreement No', 'Agreement Date', 'Lease Type', 'Vehicle Type', 'Approved', 'WFStatus', 'Action'];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('clientTable') clientTable!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  clientList: any[] = [];
  totalRecords: any;
  PageNumber: number = 1;
  PageSize: number = 10;
  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Client Name' },
    { filterName: 'City' },
    { filterName: 'PAN' },
    { filterName: 'Created By' },
  ];
  filterBtnClicked: boolean = false;
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
    this.getClientData();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }


  //custom sorting
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.clientList = this.commonService.customSort(this.clientList, sortState.active, sortState.direction);
      this.clientTable.renderRows();
    }
  }
  /*** Function to get all client list ****/
  getClientData() {
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
          // CityName: this.selectedFilter.filterName == "City" ? this.searchText : "",
          // PANNo: this.selectedFilter.filterName == "PAN" ? this.searchText : "",
          // UserName: this.selectedFilter.filterName == "Created By" ? this.searchText : "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllClient(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.clientList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.clientList.map((item, index) => {
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
    })
  }

  //pagination
  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getClientData();
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getClientData();
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
      this.getClientData();
    }, 500);
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getClientData();
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
    this.getClientData();
  }

  pending = true;
  outOfStock = true;
  delivered = true;

  // openCreateUserDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
  //   this.dialog.open(VersionHistoryModal, {
  //     width: '600px',
  //     enterAnimationDuration,
  //     exitAnimationDuration
  //   });
  // }
  // openDialog() {
  //     this.dialog.open(VersionHistoryModal);
  // }

  // openDialog(event: any) {
  //   let dialogRef = this.dialog.open(VersioHistoryComponent, {

  //     data: { data: event }
  //   });
  // }
  /* add button clicked */
  addClick() {
    this.router.navigate(["/add-client-detail"], {
      state: { level: this.AccessLevel, }
    })
  }

  openViewDialog(event: any) {
    this.router.navigate(["/add-client-detail"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "view", IsAuditTrail: this.IsAuditTrail
      }
    });

  }

  openEditModal(event: any) {
    this.router.navigate(["/add-client-detail"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "edit", IsAuditTrail: this.IsAuditTrail
      }
    });

  }

  openAccountDetails(event: any) {
    this.router.navigate(["/account-details"], {
      state: {
        level: this.AccessLevel, id: event.Id, IsAccountDetails: true, IsAuditTrail: this.IsAuditTrail
      }
    });
  }

  openDeletemaker(element: any): void {
    let dialogRef = this.dialog.open(DeletemakerComponent, {
      width: '700px',
      height: '200px',
      data: { mode: 'delete', Id: element.Id }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteMaker(element.Id);
      }
    });
  }

  deleteMaker(id: any) {
    this.spinner.show();
    this.clientService.deleteClient(id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.toaster.success("Deleted Successfully!", undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
          this.getClientData();
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

  // searchFilter() {
  //   const data =
  //   {
  //     Page: {
  //       PageNumber: this.PageNumber + 1, PageSize: this.PageSize,
  //       Filter: { Search: this.searchText }
  //     }
  //   }
  //   let formData: FormData = new FormData();
  //   formData.append("RequestData", JSON.stringify(data));

  //   this.spinner.show();
  //   this.clientService.getAllClient(formData).subscribe((res: any) => {
  //     if (res) {
  //       if (!res.HasErrors) {
  //         const ELEMENT_DATA: PeriodicElement[] = res.Records;
  //         this.dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  //         this.totalRecords = res.TotalCount;
  //         this.spinner.hide();
  //       }
  //       else {
  //         this.toaster.error(res?.Errors[0]?.Message, undefined, {
  //           positionClass: 'toast-top-center'
  //         });
  //         this.spinner.hide();
  //       }
  //     }
  //     (err: any) => {
  //       this.toaster.error(err, undefined, {
  //         positionClass: 'toast-top-center'
  //       });
  //       this.spinner.hide();
  //     }

  //   })
  // }
}

export interface PeriodicElement {
  AgreementDate: string;
  ProspectName: string;
  AgreementNo: any;
  LeaseType: string;
  VehicleType: string;
  Approved: string;
  IsOnline: any;
  IsAdmin: any;
  edit: any;
}

