import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { PeriodicElement } from '../group-of-companies/group-of-companies.component';
import { Location } from '@angular/common';
import { Sort } from '@angular/material/sort';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-master-region',
  templateUrl: './master-region.component.html',
  styleUrls: ['./master-region.component.scss']
})

export class MasterRegionComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  @ViewChild('regionTableList') regionTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns: string[] = ['Region Name', 'Created By', 'Created Date', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  RegionList: any[] = [];
  addRegionForm!: FormGroup;
  totalRecords: any;
  submitted: boolean = false;
  editMode: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  RegionId: number = 0;
  RegionName: any;
  selectedRegion: any;

  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Region Name' },
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
    private toaster: ToastrService,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
    private router: Router,
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

    this.addRegionForm = new FormGroup({
      regionName: new FormControl('', [Validators.required])
    });
    this.addRegionForm.markAllAsTouched();

    this.getAllRegion();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }

  getAllRegion() {
    const data =
    {
      Page:
      {
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.IsSearch,
          SearchValue: this.searchText,
          // RegionName: this.selectedFilter.filterName == "Region Name" ? this.searchText : "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllRegion(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.RegionList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.RegionList.map((item, index) => {
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

  get validators() {
    return this.addRegionForm.controls;
  }


  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllRegion();
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
      this.getAllRegion();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.RegionList = this.commonService.customSort(this.RegionList, sortState.active, sortState.direction);
      this.regionTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllRegion();
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllRegion();
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
    this.getAllRegion();
  }

  cancelClick() {
    this.editMode = false;
    this.addRegionForm.reset();
    this.submitted = false;
    this.addRegionForm.markAllAsTouched();
    this.selectedRowIndex = null;
  }

  addRegion() {
    this.submitted = true;
    console.log(this.addRegionForm);
    if (this.addRegionForm.status == 'VALID') {
      const data =
      {
        CreatedById: this.currentUser.UserId,
        RegionName: this.addRegionForm.value.regionName,
        Dormant: false,
      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addRegion(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Region added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.getAllRegion();

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

  updateRegion() {
    this.submitted = true;
    console.log(this.addRegionForm);
    if (this.addRegionForm.status == 'VALID') {
      // const data =
      // {
      //   ModifiedById: this.currentUser.UserId,
      //   Id: this.RegionId,
      //   RegionName: this.addRegionForm.value.regionName,
      // }

      this.selectedRegion.ModifiedById = this.currentUser.UserId;
      this.selectedRegion.RegionName = this.addRegionForm.value.regionName;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedRegion));

      this.spinner.show();
      this.clientService.updateRegion(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Region updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.getAllRegion();
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

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.addRegionForm.reset();
    this.submitted = false;
    this.RegionId = data.Id;
    this.selectedRegion = data;
    this.RegionName = data.RegionName;

    this.addRegionForm.markAllAsTouched();
    this.addRegionForm.get('regionName')?.setValue(data.RegionName);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.RegionId, Name: this.RegionName, moduleName: 'master-region' }
    });
  }
}
