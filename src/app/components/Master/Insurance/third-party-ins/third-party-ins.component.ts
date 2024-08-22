import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/components/client.service';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Location } from '@angular/common';
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
  selector: 'app-third-party-ins',
  templateUrl: './third-party-ins.component.html',
  styleUrls: ['./third-party-ins.component.scss']
})

export class ThirdPartyInsComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  @ViewChild('TPPTableList') TPPTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns: string[] = ['Year', 'CC From', 'CC To', 'Basic', 'ULPPPD', 'Driver', 'Personal / Lacs', 'Occup Legal', 'Bonus', 'Misc Legal', 'Action'];
  dataSource = new MatTableDataSource<any>();
  DescriptionList: any[] = [];
  TppList: any[] = [];
  addDescriptionForm!: FormGroup;
  totalRecords: any;
  submitted: boolean = false;
  editMode: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  descriptionId: number = 0;
  description: any;
  timer: any;
  searchText = '';
  TppId: number = 0;
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'CC From' },
  ];
  selectedDescription: string = 'Creditor';
  filterBtnClicked: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
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

    this.addDescriptionForm = new FormGroup({
      description: new FormControl('', [Validators.required])
    });
    this.addDescriptionForm.markAllAsTouched();

    this.getAllDescription();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Insurance';
      this.breadcrumbService.setBreadcrumbs(['Master / Insurance', breadcrumb]);
    });
  }

  // description
  getAllDescription() {
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
          // Description: this.selectedFilter.filterName == "Description Name" ? this.searchText : "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllDescription(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.DescriptionList = res.Records;
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

  addDescription() {
    this.submitted = true;
    console.log(this.addDescriptionForm);
    if (this.addDescriptionForm.status == 'VALID') {
      const data =
      {
        description: this.addDescriptionForm.value.description,
        Dormant: false,
        CreatedById: this.currentUser.UserId
      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addDescription(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Description added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.getAllDescription();

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

  updateDescription() {
    this.submitted = true;
    console.log(this.addDescriptionForm);
    if (this.addDescriptionForm.status == 'VALID') {
      const data =
      {
        ModifiedById: this.currentUser.UserId,
        Id: this.descriptionId,
        description: this.addDescriptionForm.value.description,
        Dormant: false,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateDescription(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Description updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.getAllDescription();
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

  editDesc(description: any) {

  }

  getAllTppByDesc(description: any) {
    this.descriptionId = description.Id;
    this.description = description.ThirdPartyDescription;

    this.getAllTpp();
  }

  // TPP
  getAllTpp() {

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
          // CCfrom: this.selectedFilter.filterName == "CC From" ? this.searchText : "",
          // Description: this.description,
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllTpp(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.TppList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.TppList.map((item, index) => {
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
    return this.addDescriptionForm.controls;
  }


  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllTpp();
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
      this.getAllTpp();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.TppList = this.commonService.customSort(this.TppList, sortState.active, sortState.direction);
      this.TPPTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllTpp();
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllTpp();
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
    this.getAllTpp();
  }

  cancelClick() {
    this.editMode = false;
    this.addDescriptionForm.reset();
    this.submitted = false;
    this.addDescriptionForm.markAllAsTouched();
    this.selectedRowIndex = null;
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.addDescriptionForm.reset();
    this.submitted = false;
    this.descriptionId = data.Id;
    this.description = data.description;

    this.addDescriptionForm.markAllAsTouched();
    this.addDescriptionForm.get('description')?.setValue(data.description);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  addClick() {
    this.router.navigate(["/add-state"], {
      state: { level: this.AccessLevel, }
    })
  }

  openEditModal(event: any) {
    this.router.navigate(["/add-state"], {
      state: {
        level: this.AccessLevel, id: event.TppId, mode: "edit"
      }
    });
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.TppId, Name: this.TppId, moduleName: 'third-party-insurance' }
    });
  }
}