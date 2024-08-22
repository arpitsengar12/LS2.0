import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { MatTable } from '@angular/material/table';
import { Sort } from '@angular/material/sort';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-dealer-manufacturer-reln',
  templateUrl: './dealer-manufacturer-reln.component.html',
  styleUrls: ['./dealer-manufacturer-reln.component.scss']
})

export class DealerManufacturerRelnComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('DMRelationTableList') DMRelationTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns = ['Creditor Name', 'City', 'Manufacturer Name', 'Action'];
  DMRelationList: any[] = [];

  DMRelationForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  selectedDMRelationData: any;
  DMRelationId: number = 0;
  creditorList: any;
  cityList: any;
  manufacturerList: any;
  numberOfItemsFromEndBeforeFetchingMore = 50;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Creditor Name' },
    { filterName: 'City' },
    { filterName: 'Manufacturer Name' },
  ];
  filterBtnClicked: boolean = false;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  loading = false;
  bufferSize = 100;
  CreditorBuffer = [];
  constructor(
    private clientService: ClientService,
    protected commonService: CommonService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private datePipe: DatePipe,
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

    this.commonService.updateTheme.subscribe(res => {

      if (res) {
        this.mainThemeClass = res;
      }

    });

    this.commonService.updateThemeMode.subscribe(res => {
      if (res) {
        if (res == 'dark-theme') {
          this.darkThemeMode = true;
        }
        else {
          this.darkThemeMode = false;
        }
      }
      else {
        this.darkThemeMode = false;
      }
    });

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);
    this.localTheme ? this.localTheme.themeMode ? (this.localTheme.themeMode == 'dark-theme' ? this.darkThemeMode = true : this.darkThemeMode = false) : '' : '';

    if (this.localTheme == null || this.localTheme == '') {
      this.mainThemeClass = 'default-blue-colored-theme';
    }
    else {
      this.mainThemeClass = this.localTheme.themeClass;
    }

    this.DMRelationForm = new FormGroup({
      creditor: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      manufacturer: new FormControl(null, [Validators.required]),
    });
    this.DMRelationForm.markAllAsTouched();

    this.DMRelationForm.markAllAsTouched();

    this.getAllDMRelation();
    this.getDMRelationDropDowns();
    // this.getCity();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }

  onScrollToEnd() {
    this.fetchMore();
  }

  onScroll({ end }: any) {
    if (this.loading || this.creditorList.length <= this.CreditorBuffer.length) {
      return;
    }

    if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.CreditorBuffer.length) {
      this.fetchMore();
    }
  }

  fetchMore() {
    const len = this.CreditorBuffer.length;
    const more = this.creditorList.slice(len, this.bufferSize + len);
    this.loading = true;
    // using timeout here to simulate backend API delay
    setTimeout(() => {
      this.loading = false;
      this.CreditorBuffer = this.CreditorBuffer.concat(more);
    }, 200)
  }

  getAllDMRelation() {

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
          // CreditorName: this.selectedFilter.filterName == "Creditor Name" ? this.searchText : "",
          // cityName: this.selectedFilter.filterName == "City" ? this.searchText : "",
          // ManufacturerName: this.selectedFilter.filterName == "Manufacturer Name" ? this.searchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllDMRelation(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.DMRelationList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.DMRelationList.map((item, index) => {
            item.position = index;
          });
          this.spinner.hide();
        }
        else {
          this.toaster.error(res?.Errors[0].Message, undefined, {
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

  getDMRelationDropDowns() {

    this.spinner.show();
    this.clientService.getDMRelationDropDowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          console.log(res);

          this.creditorList = res.CreditorList;
          this.CreditorBuffer = this.creditorList.slice(0, this.bufferSize);
          this.cityList = res.CityList;
          this.manufacturerList = res.ManufacturerList;
          this.spinner.hide();
        }
        else {
          this.toaster.error(res?.Errors[0].Message, undefined, {
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

  // getCity() {
  //   let obj = { Page: { PageNumber: 0, PageSize: 0 } }
  //   let formData: FormData = new FormData();
  //   formData.append("RequestData", JSON.stringify(obj));
  //   this.spinner.show();
  //   this.clientService.getAllCity(formData).subscribe((res: any) => {
  //     if (res) {
  //       if (!res.HasErrors) {
  //         this.cityList = res.Records;
  //         this.spinner.hide();
  //       }
  //       else {
  //         this.toaster.error(res?.Errors[0].Message, undefined, {
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
  //   });
  // }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllDMRelation();
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
      this.getAllDMRelation();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.DMRelationList = this.commonService.customSort(this.DMRelationList, sortState.active, sortState.direction);
      this.DMRelationTableList.renderRows();
    }
  }

  get validators() {
    return this.DMRelationForm.controls;
  }

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  addDMRelation() {
    this.submitted = true;
    console.log(this.DMRelationForm);

    if (this.DMRelationForm.status == "VALID") {
      let data = {
        CreatedById: this.currentUser.UserId,
        CityID: this.DMRelationForm.value.city,
        CreditorID: this.DMRelationForm.value.creditor,
        ManufacturerID: this.DMRelationForm.value.manufacturer,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addDMRelation(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Dealer manufacturer relation added successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllDMRelation();

            this.spinner.hide();
          }
          else {
            this.toaster.error(res?.Errors[0].Message, undefined, {
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

  updateDMRelation() {
    this.submitted = true;
    if (this.DMRelationForm.status == "VALID") {
      // let data = {
      //   ModifiedById: this.currentUser.UserId,

      // }

      this.selectedDMRelationData.ModifiedById = this.currentUser.UserId;
      this.selectedDMRelationData.CityID = this.DMRelationForm.value.city;
      this.selectedDMRelationData.CreditorID = this.DMRelationForm.value.creditor;
      this.selectedDMRelationData.ManufacturerID = this.DMRelationForm.value.manufacturer;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedDMRelationData));

      this.spinner.show();
      this.clientService.updateDMRelation(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Dealer manufacturer relation updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllDMRelation();

            this.spinner.hide();
          }
          else {
            this.toaster.error(res?.Errors[0].Message, undefined, {
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

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllDMRelation();
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
    this.getAllDMRelation();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.selectedRowIndex = null;
    this.DMRelationForm.reset(defaultValues);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.DMRelationForm.reset(defaultValues);
    this.submitted = false;
    this.DMRelationId = data.Id;
    this.selectedDMRelationData = data;
    console.log(data.CreditorID);

    const index = this.creditorList.findIndex((creditor: { Id: any; }) => creditor.Id === data.CreditorID);
    if (index !== -1) {
      // Slice the creditorList to start from the selected creditor ID
      const startingIndex = Math.max(0, index - 1); // Adjust the starting index as needed
      const selectedAndNext100 = this.creditorList.slice(startingIndex, startingIndex + 101); // Next 100 records including the selected one
      this.CreditorBuffer = selectedAndNext100;
    }
    console.log(this.CreditorBuffer);

    this.DMRelationForm.get('creditor')?.setValue(data.CreditorID);
    this.DMRelationForm.get('city')?.setValue(data.CityID);
    this.DMRelationForm.get('manufacturer')?.setValue(data.ManufacturerID);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {

    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.DMRelationId, moduleName: 'dealer-manufacturer-relation' }
    });
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllDMRelation();
  }

}


let defaultValues = {
  creditor: null,
  city: null,
  manufacturer: null,
}