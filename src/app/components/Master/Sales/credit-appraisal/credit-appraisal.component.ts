import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ClientService } from '../../../client.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Sort } from '@angular/material/sort';

interface RouteData {
  breadcrumb?: string;
}

export interface PeriodicElement {
  GOCName: string,
  clientName: string,
  fromDate: string,
  toDate: string,
  noOfVehicle: string,
  amount: string,
  reportTo: string,
  remarks: string,
  status: string,
  CreatedBy: number,
}

@Component({
  selector: 'app-credit-appraisal',
  templateUrl: './credit-appraisal.component.html',
  styleUrls: ['./credit-appraisal.component.scss']
})
export class CreditAppraisalComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  @ViewChild('appraisalTableList') appraisalTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  addCreditAppraisalForm!: FormGroup;
  displayedColumns: string[] = ['GOCName', 'ClientName', 'FromDate', 'ToDate', 'NoOfVehicle', 'Amount', 'Status', 'ApproverName', 'remarks', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  appraisalList: any[] = [];
  groupNameList: any;
  ClientList: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  submitted: boolean = false;
  groupId: number = 0;
  clientId: number = 0;
  appraisalId: number = 0;
  minDate: Date = new Date();
  fromDateChanged: boolean = false;
  toDateChanged: boolean = false;
  selectedApprsailData: any;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  editMode: boolean = false;
  isView: boolean = false;
  selectedFilter = { filterName: '' };
  reportToList: any;
  filterList = [
    { filterName: 'Group Name' },
    { filterName: 'Client Name' },
    { filterName: 'Status' },
    { filterName: 'Checker' },
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
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    protected commonService: CommonService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {
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

    if (history.state.level) {
      this.IsAuditTrail = history.state.IsAuditTrail;
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }


    this.addCreditAppraisalForm = new FormGroup({
      gocName: new FormControl(null, [Validators.required]),
      clientName: new FormControl(null, [Validators.required]),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      noOfVehicle: new FormControl('', [Validators.required, Validators.pattern(Constant.IntNo)]),
      amount: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
      reportTo: new FormControl(null, [Validators.required]),
      remarks: new FormControl('',),
    });

    this.GetAllGroupOfCompanies();
    this.GetAllCreditAppraisal();
    this.getCheckersList();
    this.addCreditAppraisalForm.markAllAsTouched();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Sales';
      this.breadcrumbService.setBreadcrumbs(['Master / Sales', breadcrumb]);
    });
  }

  get validators() {
    return this.addCreditAppraisalForm.controls;
  }

  GetAllGroupOfCompanies() {
    const data =
    {
      Page: {
        PageNumber: 0, PageSize: 0, Filter: { GOCName: "", CityName: "", CreatedBy: "", }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.GetAllGroupOfCompanies(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.groupNameList = res.Records;
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

  GetAllCreditAppraisal() {
    const data =
    {
      Page: {
        // PageNumber: this.PageNumber + 1,
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.IsSearch,
          SearchValue: this.searchText,
          // GroupOfCompany: this.selectedFilter.filterName == "Group Name" ? this.searchText : "",
          // ClientName: this.selectedFilter.filterName == "Client Name" ? this.searchText : "",
          // Status: this.selectedFilter.filterName == "Status" ? this.searchText : "",
          // Approver: this.selectedFilter.filterName == "Checker" ? this.searchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.GetAllCreditAppraisal(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.appraisalList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.appraisalList.map((item, index) => {
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

  getClientsByGocId() {
    const id = this.groupId;
    this.spinner.show();
    this.clientService.getClientsByGocId(id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.ClientList = res.Rows;
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


  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.GetAllCreditAppraisal();
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
      this.GetAllCreditAppraisal();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.appraisalList = this.commonService.customSort(this.appraisalList, sortState.active, sortState.direction);
      this.appraisalTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.GetAllCreditAppraisal();
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.GetAllCreditAppraisal();
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
    this.GetAllCreditAppraisal();
  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  cancelClick() {
    this.addCreditAppraisalForm.reset();
    this.submitted = false;
    this.editMode = false;
    this.addCreditAppraisalForm.markAllAsTouched();
    this.ClientList = [];
    this.selectedRowIndex = null;
  }

  onFromDtChange(event: any) {
    this.minDate = event.value;
  }

  getCheckersList() {
    this.reportToList = [];
    let role = "CRH-checker"
    this.spinner.show();
    this.clientService.getRolewiseUsers(role).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.reportToList = res.Rows;
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

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.addCreditAppraisalForm.reset();
    this.addCreditAppraisalForm.markAllAsTouched();
    this.submitted = false;
    this.selectedApprsailData = data;
    this.groupId = data.GOCId;
    this.clientId = data.ClientId;
    this.appraisalId = data.Id;

    this.addCreditAppraisalForm.get('gocName')?.setValue(data.GOCName);
    this.addCreditAppraisalForm.get('clientName')?.setValue(data.ClientName);
    this.addCreditAppraisalForm.get('fromDate')?.setValue(new Date(data.ValidFrom));
    this.addCreditAppraisalForm.get('toDate')?.setValue(new Date(data.ValidTo));
    this.addCreditAppraisalForm.get('noOfVehicle')?.setValue(data.AppliedNo);
    this.addCreditAppraisalForm.get('amount')?.setValue(data.AppliedAmount);
    this.addCreditAppraisalForm.get('reportTo')?.setValue(data.ApprovedBy);
    this.addCreditAppraisalForm.get('remarks')?.setValue(data.Remarks);

    this.minDate = new Date(data.ValidFrom);
  }

  selectedGoc(event: any) {
    if (event) {
      this.groupNameList.map((item: any) => {
        if (item.GOCName == event.GOCName) {
          this.groupId = item.Id;
        }
      })
      this.getClientsByGocId();
    }

  }

  selectedClient(event: any) {
    if (event) {
      this.ClientList.map((item: any) => {
        if (item.ClientName == event.ClientName) {
          this.clientId = item.ClientId;
        }
      });
    }

  }

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  AddCreditAppraisal() {
    this.submitted = true;
    console.log(this.addCreditAppraisalForm);
    if (this.addCreditAppraisalForm.status == 'VALID') {
      const data =
      {
        CreatedById: this.currentUser.UserId,

        GOCId: this.groupId,
        ClientId: this.clientId,
        ValidFrom: this.addCreditAppraisalForm.value.fromDate ? this.formatDateInISO(this.addCreditAppraisalForm.value.fromDate) : '',
        ValidTo: this.addCreditAppraisalForm.value.toDate ? this.formatDateInISO(this.addCreditAppraisalForm.value.toDate) : '',
        AppliedNo: Number(this.addCreditAppraisalForm.value.noOfVehicle),
        AppliedAmount: Number(this.addCreditAppraisalForm.value.amount),
        Remarks: this.addCreditAppraisalForm.value.remarks,
        ApprovedNos: null,
        ApprovedAmount: null,
        ApprovedDate: "",
        ApprovedBy: this.addCreditAppraisalForm.value.reportTo,
        Dormant: false,
        SFCamId: "",
        IsActive: true,
        Status: 'Pending',

      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addCreditAppraisal(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Credit appraisal added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.addCreditAppraisalForm.reset();
            this.GetAllCreditAppraisal();
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

  UpdateCreditAppraisal() {
    this.submitted = true;
    console.log(this.addCreditAppraisalForm);
    if (this.addCreditAppraisalForm.status == 'VALID') {
      // const data =
      // {
      //   ModifiedById: this.currentUser.UserId,

      //   GOCId: this.groupId,
      //   ClientId: this.clientId,
      //   ValidFrom: this.addCreditAppraisalForm.value.fromDate ? this.fromDateChanged ? this.formatDateInISO(this.addCreditAppraisalForm.value.fromDate) : this.formatDateInISO(this.addCreditAppraisalForm.value.fromDate) : '',
      //   ValidTo: this.addCreditAppraisalForm.value.toDate ? this.toDateChanged ? this.formatDateInISO(this.addCreditAppraisalForm.value.toDate) : this.formatDateInISO(this.addCreditAppraisalForm.value.toDate) : '',
      //   AppliedNo: Number(this.addCreditAppraisalForm.value.noOfVehicle),
      //   AppliedAmount: Number(this.addCreditAppraisalForm.value.amount),
      //   Remarks: this.addCreditAppraisalForm.value.remarks,
      //   ApprovedNos: null,
      //   ApprovedAmount: null,
      //   ApprovedDate: "",
      //   ApprovedBy: this.addCreditAppraisalForm.value.reportTo,
      //   Dormant: false,
      //   SFCamId: "",
      //   IsActive: true,
      //   Status: 'Pending',
      //   Id: this.appraisalId
      // }

      this.selectedApprsailData.ModifiedById = this.currentUser.UserId;
      this.selectedApprsailData.ValidFrom = this.addCreditAppraisalForm.value.fromDate ? this.fromDateChanged ? this.formatDateInISO(this.addCreditAppraisalForm.value.fromDate) : this.formatDateInISO(this.addCreditAppraisalForm.value.fromDate) : '';
      this.selectedApprsailData.ValidTo = this.addCreditAppraisalForm.value.toDate ? this.toDateChanged ? this.formatDateInISO(this.addCreditAppraisalForm.value.toDate) : this.formatDateInISO(this.addCreditAppraisalForm.value.toDate) : '';
      this.selectedApprsailData.AppliedNo = Number(this.addCreditAppraisalForm.value.noOfVehicle);
      this.selectedApprsailData.AppliedAmount = Number(this.addCreditAppraisalForm.value.amount);
      this.selectedApprsailData.Remarks = this.addCreditAppraisalForm.value.remarks;
      this.selectedApprsailData.ApprovedBy = this.addCreditAppraisalForm.value.reportTo;
      this.selectedApprsailData.Status = 'Pending';

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedApprsailData));

      this.spinner.show();
      this.clientService.updateCreditAppraisal(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Credit appraisal updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.addCreditAppraisalForm.reset();
            this.GetAllCreditAppraisal();

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

  onDateChange(event: any, field: any) {
    if (field == 'fromDate') {
      this.fromDateChanged = true;
    }
    else if (field == 'toDate') {
      this.toDateChanged = true;
    }
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.addCreditAppraisalForm.reset();
    this.addCreditAppraisalForm.markAllAsTouched();
    this.fromDateChanged = false;
    this.toDateChanged = false;
    this.selectedRowIndex = null;
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.appraisalId, Name: this.selectedApprsailData.GOCName, moduleName: 'credit-appraisal' }
    });
  }

}
