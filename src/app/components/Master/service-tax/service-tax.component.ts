import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { DatePipe } from '@angular/common';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-service-tax',
  templateUrl: './service-tax.component.html',
  styleUrls: ['./service-tax.component.scss']
})

export class ServiceTaxComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('serviceTaxTable') serviceTaxTable!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns = ['Tax ID', 'Tax Type', 'Tax Description', 'Tax Percentage', 'Applied From', 'Applied To', 'Action'];
  ServiceTaxList: any[] = [];

  serviceTaxForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  selectedServiceTaxData: any;
  serviceTaxId: number = 0;
  serviceTaxType: string = '';
  minDate: Date = new Date();
  fromDateChanged: boolean = false;
  toDateChanged: boolean = false;
  selectedApprsailData: any;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Tax Type' },
    { filterName: 'Tax Description' },
    { filterName: 'Tax Percentage' },
  ];
  filterBtnClicked: boolean = false;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

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

    this.serviceTaxForm = new FormGroup({
      taxType: new FormControl('', [Validators.required]),
      taxDesc: new FormControl('', [Validators.required]),
      taxPerc: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
    });
    this.serviceTaxForm.markAllAsTouched();

    this.serviceTaxForm.markAllAsTouched();

    this.getAllServiceTax();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }

  getAllServiceTax() {

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
          // TaxType: this.selectedFilter.filterName == "Tax Type" ? this.searchText : "",
          // TaxDescription: this.selectedFilter.filterName == "Tax Description" ? this.searchText : "",
          // TaxPercentage: this.selectedFilter.filterName == "Tax Percentage" ? parseFloat(this.searchText) : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllServiceTax(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.ServiceTaxList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.ServiceTaxList.map((item, index) => {
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
    return this.serviceTaxForm.controls;
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllServiceTax();
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
      this.getAllServiceTax();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.ServiceTaxList = this.commonService.customSort(this.ServiceTaxList, sortState.active, sortState.direction);
      this.serviceTaxTable.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllServiceTax();
  }


  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  addServiceTax() {
    this.submitted = true;
    if (this.serviceTaxForm.status == "VALID") {
      let data = {
        CreatedById: this.currentUser.UserId,

        TaxType: this.serviceTaxForm.value.taxType,
        TaxDescription: this.serviceTaxForm.value.taxDesc,
        TaxPercentage: this.serviceTaxForm.value.taxPerc,
        FromDate: this.serviceTaxForm.value.fromDate ? this.formatDateInISO(this.serviceTaxForm.value.fromDate) : '',
        ToDate: this.serviceTaxForm.value.toDate ? this.formatDateInISO(this.serviceTaxForm.value.toDate) : '',

      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addServiceTax(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Service tax type added successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllServiceTax();

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
  }

  updateServiceTax() {
    this.submitted = true;
    if (this.serviceTaxForm.status == "VALID") {

      this.selectedServiceTaxData.ModifiedById = this.currentUser.UserId;
      this.selectedServiceTaxData.TaxType = this.serviceTaxForm.value.taxType;
      this.selectedServiceTaxData.TaxDescription = this.serviceTaxForm.value.taxDesc;
      this.selectedServiceTaxData.TaxPercentage = this.serviceTaxForm.value.taxPerc;
      this.selectedServiceTaxData.FromDate = this.serviceTaxForm.value.fromDate ? this.formatDateInISO(this.serviceTaxForm.value.fromDate) : '';
      this.selectedServiceTaxData.ToDate = this.serviceTaxForm.value.toDate ? this.formatDateInISO(this.serviceTaxForm.value.toDate) : '';

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedServiceTaxData));

      this.spinner.show();
      this.clientService.updateServiceTax(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Service tax type updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllServiceTax();

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
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllServiceTax();
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
    this.getAllServiceTax();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.selectedRowIndex = null;
    this.serviceTaxForm.reset(defaultValues);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.serviceTaxForm.reset(defaultValues);
    this.submitted = false;
    this.serviceTaxId = data.Id;
    this.serviceTaxType = data.serviceTaxType;
    this.selectedServiceTaxData = data;

    this.serviceTaxForm.get('taxType')?.setValue(data.TaxType);
    this.serviceTaxForm.get('taxDesc')?.setValue(data.TaxDescription);
    this.serviceTaxForm.get('taxPerc')?.setValue(data.TaxPercentage);
    this.serviceTaxForm.get('fromDate')?.setValue(data.FromDate);
    this.serviceTaxForm.get('toDate')?.setValue(data.ToDate);

    this.minDate = new Date(data.FromDate);
  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.serviceTaxId, Name: this.serviceTaxType, moduleName: 'master-serviceTax' }
    });
  }

  onDateChange(event: any, field: any) {
    if (field == 'fromDate') {
      this.fromDateChanged = true;
    }
    else if (field == 'toDate') {
      this.toDateChanged = true;
    }
  }

  onFromDtChange(event: any) {
    this.minDate = event.value;
  }

}


let defaultValues = {
  taxType: '',
  taxDesc: '',
  taxPerc: '',
  fromDate: '',
  toDate: '',
}