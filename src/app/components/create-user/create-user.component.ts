import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../client.service';
import { MatDialog } from '@angular/material/dialog';
import { DeletemakerComponent } from '../client-maker/deletemaker/deletemaker.component';
import { Location } from '@angular/common';
import { ResetUserPasswordComponent } from './reset-user-password/reset-user-password.component';
import { Sort } from '@angular/material/sort';

export interface PeriodicElement {
  TableName: string;
  ColumnName: string;
  CompilanceType: any;
  ColumnType: string;
  FieldLabel: string;
  LastModified: string;
  Action: any;
  CompilanceArray: any;

}

export interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  @ViewChild('NgfilterDropdown ') public NgfilterDropdown: NgSelectComponent;
  @ViewChild('userTableList') userTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  displayedColumns: string[] = ['userName', 'city', 'int', 'rv', 'rmte', 'mfee', 'bookingAppForm', 'BookingA', 'deviationRight', 'WFStatus', 'Action'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  cityList: any;
  regionList: any;
  userList: any[] = [];
  userId: number = 0;
  passwordInputType: string = 'password';
  confirmPasswordInputType: string = 'password';
  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    // { filterName: 'User Name' },
    // { filterName: 'City' },
    { filterName: 'Active' },
    { filterName: 'In Active' },
    { filterName: 'Locked User' },
  ];
  selectedRowIndex: any;
  IsSearch: boolean = false;
  filterBtnClicked: boolean = false;
  filterAllBtnClicked: boolean = false;
  OtherFilterList = [
    { filterName: 'Active' },
    { filterName: 'In Active' },
    { filterName: 'Locked User' },
  ];
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    protected commonService: CommonService,
    private router: Router,
    public dialog: MatDialog,
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

    this.getusersList();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin / User and Roles';
      this.breadcrumbService.setBreadcrumbs(['Admin / User and Roles', breadcrumb]);
    });
  }

  addClick() {
    this.router.navigate(["/add-user"], {
      state: { level: this.AccessLevel, }
    })
  }

  // get users
  getusersList() {
    const data =
    {
      Page:
      {
        // PageNumber: this.PageNumber + 1,
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          // // CreatedById: this.currentUser.UserId
          IsSearch: this.IsSearch,
          SearchValue: this.searchText,
          // UserName: this.selectedFilter.filterName == "User Name" ? this.searchText.trim() : "",
          // CityName: this.selectedFilter.filterName == "City" ? this.searchText.trim() : "",
          // DeviationRights: "",
          DeActivated: this.selectedFilter.filterName == "Active" ? false : this.selectedFilter.filterName == "In Active" ? true : null,
          LockedUser: this.selectedFilter.filterName == "Locked User" ? true : null,
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getUser(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.userList = res.Records;
          this.selectedRowIndex = null;
          this.userList.map((item, index) => {
            item.position = index;
          });
          this.totalRecords = res.TotalCount;
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

  // to search on the filter selection
  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active' || this.selectedFilter.filterName == 'Locked User') {
        this.getusersList();
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
      this.getusersList();
    }, 500);
  }

  //custom sorting
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.userList = this.commonService.customSort(this.userList, sortState.active, sortState.direction);
      this.userTableList.renderRows();
    }
  }


  //pagination
  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getusersList();
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getusersList();
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
    this.getusersList();
  }

  openViewDialog(event: any) {
    this.router.navigate(["/add-user"], {
      state: {
        level: this.AccessLevel, id: event.UserGuidId, mode: "view", IsAuditTrail: this.IsAuditTrail
      }
    });

  }

  openEditModal(event: any) {
    this.router.navigate(["/add-user"], {
      state: {
        level: this.AccessLevel, id: event.UserGuidId, mode: "edit", IsAuditTrail: this.IsAuditTrail
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

  onToggleChange(event: any, element: any): void {
    event.source.checked = element.DeviationRight;
  }

  deleteMaker(id: any) {
    // this.spinner.show();
    // this.clientService.deleteClient(id).subscribe((res: any) => {
    //   if (res) {
    //     if (!res.HasErrors) {
    //       this.toaster.success("Deleted Successfully!", undefined, {
    //         positionClass: 'toast-top-center'
    //       });
    //       this.spinner.hide();
    //       this.getClientData();
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

  resetPassword(element: any) {
    let dialogRef = this.dialog.open(ResetUserPasswordComponent, {
      width: '500px',
      height: '380px',
      disableClose: true,
      data: { userData: element }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

}
