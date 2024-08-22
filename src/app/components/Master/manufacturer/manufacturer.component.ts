import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { DeletemakerComponent } from '../../client-maker/deletemaker/deletemaker.component';
import { ClientService } from '../../client.service';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Sort } from '@angular/material/sort';

export interface PeriodicElement {
  ClientName: string,
  PreFix: string,
  FirstName: string,
  LastName: string,
  City: string,
  MobileNo: string,
}

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: ['./manufacturer.component.scss']
})
export class ManufacturerComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }
  @ViewChild('manufacturerTableList') manufacturerTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns: string[] = ['Manufacturer Name', 'City', 'WFStatus', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  manufacturersList: any[] = [];
  totalRecords: any;
  manufacturerId: number = 0;
  PageNumber: number = 1;
  PageSize: number = 10;
  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Manufacturer Name' },
    // { filterName: 'Manufacturer Logo' },
    { filterName: 'City' },
    // { filterName: 'Created By' },
  ];
  filterBtnClicked: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  AccessLevel: any;
  IsAuditTrail: boolean = false;
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

    this.getAllManufacturers();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }

  getAllManufacturers() {
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
          // ManufacturerName: this.selectedFilter.filterName == "Manufacturer Name" ? this.searchText : "",
          // // Prefix: this.selectedFilter.filterName == "Manufacturer Logo" ? this.searchText : "",
          // CityName: this.selectedFilter.filterName == "City" ? this.searchText : "",
          // // Id: "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllmanufacturers(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.manufacturersList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.manufacturersList.map((item, index) => {
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

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllManufacturers();
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
      this.getAllManufacturers();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.manufacturersList = this.commonService.customSort(this.manufacturersList, sortState.active, sortState.direction);
      this.manufacturerTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllManufacturers();
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllManufacturers();
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
    this.getAllManufacturers();
  }

  addClick() {
    this.router.navigate(["/add-manufacturers"], {
      state: { level: this.AccessLevel, }
    })
  }

  openViewDialog(event: any) {
    this.router.navigate(["/add-manufacturers"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "view", IsAuditTrail: this.IsAuditTrail
      }
    });

  }

  openEditModal(event: any) {
    this.router.navigate(["/add-manufacturers"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "edit", IsAuditTrail: this.IsAuditTrail
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
          this.getAllManufacturers();
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

}