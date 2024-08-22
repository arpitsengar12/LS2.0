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
  selector: 'app-invoice-type',
  templateUrl: './invoice-type.component.html',
  styleUrls: ['./invoice-type.component.scss']
})

export class InvoiceTypeComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('invoiceTableList') invoiceTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns = ['Invoice Type', 'Invoice Code', 'Last Invoice No', 'Dormant', 'Is VAT', 'Is STAX', 'Income GLCode', 'Expense GLCode', 'ChargeBackGLCode', 'AdvanceGLCode', 'ChargeBackGLCodeFL', 'IsOverHead', 'TDS Section', 'TDS Code', 'TDS Per', 'Reimburse', 'WFStatus', 'Action'];
  InvoiceTypeList: any[] = [];

  invoiceTypeForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  selectedInvTypeData: any;
  InvoiceTypeId: number = 0;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Invoice Type' },
    { filterName: 'Invoice Code' },
    // { filterName: 'Last Invoice No.' },
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

    this.invoiceTypeForm = new FormGroup({
      invoiceType: new FormControl('', Validators.required),
      invoiceCode: new FormControl(''),
      lastInvNumber: new FormControl('', Validators.pattern(Constant.IntNo)),
      isDormant: new FormControl(false),
      isVAT: new FormControl(false),
      isSTAX: new FormControl(false),
      incomeGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      expenseGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      chargebackGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      advanceGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      chargebackGLCodeFL: new FormControl('', Validators.pattern(Constant.IntNo)),
      isOverhead: new FormControl(false),
      tdsSection: new FormControl(''),
      tdsCode: new FormControl(''),
      tdsPer: new FormControl(''),
      isReimburse: new FormControl(false),
    });

    this.invoiceTypeForm.markAllAsTouched();
    this.getAllInvoiceType();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master ';
      this.breadcrumbService.setBreadcrumbs(['Master ', breadcrumb]);
    });
  }

  getAllInvoiceType() {

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
          // InvoiceType: this.selectedFilter.filterName == "Invoice Type" ? this.searchText : "",
          // InvoiceCode: this.selectedFilter.filterName == "Invoice Code" ? this.searchText : "",
          // LastInvoiceNo: this.selectedFilter.filterName == "Last Invoice No." ? this.searchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllInvoiceType(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.InvoiceTypeList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.InvoiceTypeList.map((item, index) => {
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
        this.getAllInvoiceType();
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
      this.getAllInvoiceType();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.InvoiceTypeList = this.commonService.customSort(this.InvoiceTypeList, sortState.active, sortState.direction);
      this.invoiceTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllInvoiceType();
  }

  get validators() {
    return this.invoiceTypeForm.controls;
  }

  // addInvoiceType() {
  //   this.submitted = true;
  //   if (this.invoiceTypeForm.status == "VALID") {
  //     let data = {
  //       CreatedById: this.currentUser.UserId,

  //     }

  //     let formData: FormData = new FormData();
  //     formData.append("RequestData", JSON.stringify(data));

  //     this.spinner.show();
  //     this.clientService.addInvoiceType(formData).subscribe((res: any) => {
  //       if (res) {
  //         if (!res.HasErrors) {
  //           this.toaster.success('Invoice type added successfully', undefined, {
  //             positionClass: 'toast-top-center'
  //           });
  //           this.resetForm();
  //           this.getAllInvoiceType();

  //           this.spinner.hide();
  //         }
  //         else {
  //           this.toaster.error(res?.Errors[0]?.Message, undefined, {
  //             positionClass: 'toast-top-center'
  //           });
  //           this.spinner.hide();
  //         }
  //       }
  //       (err: any) => {
  //         this.toaster.error(err, undefined, {
  //           positionClass: 'toast-top-center'
  //         });
  //         this.spinner.hide();
  //       }
  //     });

  //   }
  // }

  // updateInvoiceType() {
  //   this.submitted = true;
  //   if (this.invoiceTypeForm.status == "VALID") {
  //     let data = {
  //       Id: this.InvoiceTypeId,
  //       ModifiedById: this.currentUser.UserId,

  //     }

  //     let formData: FormData = new FormData();
  //     formData.append("RequestData", JSON.stringify(data));

  //     this.spinner.show();
  //     this.clientService.updateInvoiceType(formData).subscribe((res: any) => {
  //       if (res) {
  //         if (!res.HasErrors) {
  //           this.toaster.success('Invoice type updated successfully', undefined, {
  //             positionClass: 'toast-top-center'
  //           });
  //           this.resetForm();
  //           this.getAllInvoiceType();

  //           this.spinner.hide();
  //         }
  //         else {
  //           this.toaster.error(res?.Errors[0]?.Message, undefined, {
  //             positionClass: 'toast-top-center'
  //           });
  //           this.spinner.hide();
  //         }
  //       }
  //       (err: any) => {
  //         this.toaster.error(err, undefined, {
  //           positionClass: 'toast-top-center'
  //         });
  //         this.spinner.hide();
  //       }
  //     });

  //   }
  // }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllInvoiceType();
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
    this.getAllInvoiceType();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.selectedRowIndex = null;
    this.invoiceTypeForm.reset(defaultValues);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.invoiceTypeForm.reset(defaultValues);
    this.submitted = false;
    this.InvoiceTypeId = data.Id;
    this.selectedInvTypeData = data;

    this.invoiceTypeForm.get('invoiceType')?.setValue(data.AgeFrom);
    this.invoiceTypeForm.get('invoiceCode')?.setValue(data.AgeTo);
    this.invoiceTypeForm.get('lastInvNumber')?.setValue(data.Percentage);
    this.invoiceTypeForm.get('isDormant')?.setValue(data.Bonus);
    this.invoiceTypeForm.get('isVAT')?.setValue(data.AgeFrom);
    this.invoiceTypeForm.get('isSTAX')?.setValue(data.AgeTo);
    this.invoiceTypeForm.get('incomeGLCode')?.setValue(data.Percentage);
    this.invoiceTypeForm.get('expenseGLCode')?.setValue(data.Bonus);
    this.invoiceTypeForm.get('chargebackGLCode')?.setValue(data.AgeFrom);
    this.invoiceTypeForm.get('advanceGLCode')?.setValue(data.AgeTo);
    this.invoiceTypeForm.get('chargebackGLCodeFL')?.setValue(data.Percentage);
    this.invoiceTypeForm.get('isOverhead')?.setValue(data.Bonus);
    this.invoiceTypeForm.get('tdsSection')?.setValue(data.AgeFrom);
    this.invoiceTypeForm.get('tdsCode')?.setValue(data.AgeTo);
    this.invoiceTypeForm.get('tdsPer')?.setValue(data.Percentage);
    this.invoiceTypeForm.get('isReimburse')?.setValue(data.Bonus);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }



  addClick() {
    this.router.navigate(["/add-invoice-type"], {
      state: { level: this.AccessLevel, }
    })
  }

  openViewDialog(event: any) {
    this.router.navigate(["/add-invoice-type"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "view", IsAuditTrail: this.IsAuditTrail
      }
    });

  }

  openEditModal(event: any) {
    this.router.navigate(["/add-invoice-type"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "edit", IsAuditTrail: this.IsAuditTrail
      }
    });

  }

}


let defaultValues = {
  invoiceType: '',
  invoiceCode: '',
  lastInvNumber: '',
  isDormant: false,
  isVAT: false,
  isSTAX: false,
  incomeGLCode: '',
  expenseGLCode: '',
  chargebackGLCode: '',
  advanceGLCode: '',
  chargebackGLCodeFL: '',
  isOverhead: false,
  tdsSection: '',
  tdsCode: '',
  tdsPer: '',
  isReimburse: false,
}