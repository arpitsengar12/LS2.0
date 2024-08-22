import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../../client.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Constant } from 'src/app/shared/model/constant';
import { MatDialog } from '@angular/material/dialog';
import { ApproveRejectComponent } from 'src/app/shared/components/approve-reject/approve-reject.component';
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
  selector: 'app-credit-appraisal-checker',
  templateUrl: './credit-appraisal-checker.component.html',
  styleUrls: ['./credit-appraisal-checker.component.scss']
})

export class CreditAppraisalCheckerComponent {
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

  approveCreditAppraisalForm!: FormGroup;
  displayedColumns: string[] = ['GOCName', 'ClientName', 'FromDate', 'ToDate', 'NoOfVehicle', 'ApprovedNo', 'Amount', 'ApprovedAmount', 'QuoteApproved', 'QuotePrice', 'ActiveNo', 'ActiveAmount', 'Status', 'CreatedBy', 'CreatedDate', 'ApproverName', 'ApprovedDate', 'remarks', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  appraisalList: any[] = [];
  groupNameList: any;
  ClientList: any
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  submitted: boolean = false;
  groupId: number = 0;
  clientId: number = 0;
  appraisalId: number = 0;
  minDate: Date = new Date();
  currentDate: Date = new Date();
  fromDateChanged: boolean = false;
  toDateChanged: boolean = false;
  selectedApprsailData: any;
  isView: boolean = false;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  editMode: boolean = false;
  viewMode: boolean = false;
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Group Name' },
    { filterName: 'Client Name' },
    { filterName: 'Status' },
    // { filterName: 'Created By' },
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
    public dialog: MatDialog,
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

    this.approveCreditAppraisalForm = new FormGroup({
      gocName: new FormControl(null,),
      clientName: new FormControl(null,),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      noOfVehicle: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      approvedNo: new FormControl('', [Validators.required, Validators.pattern(Constant.IntNo)]),
      amount: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      approvedAmount: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
      remarks: new FormControl('',),
    });

    this.GetAllCreditAppraisal();
    this.approveCreditAppraisalForm.markAllAsTouched();

    if (this.viewMode) {
      this.displayedColumns = ['GOCName', 'ClientName', 'FromDate', 'ToDate', 'NoOfVehicle', 'ApprovedNo', 'Amount', 'ApprovedAmount', 'QuoteApproved', 'QuotePrice', 'ActiveNo', 'ActiveAmount', 'Status', 'CreatedBy', 'CreatedDate', 'ApproverName', 'ApprovedDate', 'remarks',];
    }
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Sales';
      this.breadcrumbService.setBreadcrumbs(['Master / Sales', breadcrumb]);
    });
  }

  get validators() {
    return this.approveCreditAppraisalForm.controls;
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

  onFromDtChange(event: any) {
    this.minDate = event.value;
  }

  cancelClick() {
    this.approveCreditAppraisalForm.reset();
    this.submitted = false;
    this.editMode = false;
    this.approveCreditAppraisalForm.markAllAsTouched();
    this.fromDateChanged = false;
    this.toDateChanged = false;
    this.selectedRowIndex = null;
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.approveCreditAppraisalForm.reset();
    this.approveCreditAppraisalForm.markAllAsTouched();
    this.submitted = false;
    this.selectedApprsailData = data;
    this.groupId = data.GOCId;
    this.clientId = data.ClientId;
    this.appraisalId = data.Id;

    this.groupNameList = [{ GOCName: data.GOCName }];
    this.ClientList = [{ ClientName: data.ClientName }];

    this.approveCreditAppraisalForm.get('gocName')?.setValue(data.GOCName);
    this.approveCreditAppraisalForm.get('clientName')?.setValue(data.ClientName);
    this.approveCreditAppraisalForm.get('fromDate')?.setValue(new Date(data.ValidFrom));
    this.approveCreditAppraisalForm.get('toDate')?.setValue(new Date(data.ValidTo));
    this.approveCreditAppraisalForm.get('noOfVehicle')?.setValue(data.AppliedNo);
    this.approveCreditAppraisalForm.get('amount')?.setValue(data.AppliedAmount);
    this.approveCreditAppraisalForm.get('reportTo')?.setValue(data.ApprovedBy);
    this.approveCreditAppraisalForm.get('remarks')?.setValue(data.Remarks);
  }

  selectedGoc(event: any) {
    if (event) {
      this.groupNameList.map((item: any) => {
        if (item.GOCName == event.value) {
          this.groupId = item.Id;
        }
      })
    }
  }

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  approveCreditAppraisal() {
    this.submitted = true;
    console.log(this.approveCreditAppraisalForm);
    if (this.approveCreditAppraisalForm.status == 'VALID') {
      // const data =
      // {
      //   ModifiedById: this.currentUser.UserId,


      //   GOCId: this.groupId,
      //   ClientId: this.clientId,
      //   ValidFrom: this.approveCreditAppraisalForm.value.fromDate ? this.fromDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : '',
      //   ValidTo: this.approveCreditAppraisalForm.value.toDate ? this.toDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : '',
      //   AppliedNo: Number(this.approveCreditAppraisalForm.value.noOfVehicle),
      //   AppliedAmount: Number(this.approveCreditAppraisalForm.value.amount),
      //   Remarks: this.approveCreditAppraisalForm.value.remarks,
      //   ApprovedNos: this.approveCreditAppraisalForm.value.approvedNo,
      //   ApprovedAmount: this.approveCreditAppraisalForm.value.approvedAmount,
      //   ApprovedDate: this.formatDateInISO(this.currentDate.toDateString()),
      //   ApprovedBy: this.approveCreditAppraisalForm.value.reportTo,
      //   Dormant: false,
      //   SFCamId: "",
      //   IsActive: true,
      //   Status: 'Approved',
      //   Id: this.appraisalId
      // }

      this.selectedApprsailData.ModifiedById = this.currentUser.UserId,
        this.selectedApprsailData.ValidFrom = this.approveCreditAppraisalForm.value.fromDate ? this.fromDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : '',
        this.selectedApprsailData.ValidTo = this.approveCreditAppraisalForm.value.toDate ? this.toDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : '',
        this.selectedApprsailData.AppliedNo = Number(this.approveCreditAppraisalForm.value.noOfVehicle),
        this.selectedApprsailData.AppliedAmount = Number(this.approveCreditAppraisalForm.value.amount),
        this.selectedApprsailData.Remarks = this.approveCreditAppraisalForm.value.remarks,
        this.selectedApprsailData.ApprovedNos = this.approveCreditAppraisalForm.value.approvedNo,
        this.selectedApprsailData.ApprovedAmount = this.approveCreditAppraisalForm.value.approvedAmount,
        this.selectedApprsailData.ApprovedDate = this.formatDateInISO(this.currentDate.toDateString()),
        this.selectedApprsailData.ApprovedBy = this.approveCreditAppraisalForm.value.reportTo,
        this.selectedApprsailData.Status = 'Approved';

      this.approvetRejectDialog(this.selectedApprsailData.Status, this.selectedApprsailData)
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

  rejectCreditAppraisal() {

    // const data =
    // {
    //   ModifiedById: this.currentUser.UserId,

    //   GOCId: this.groupId,
    //   ClientId: this.clientId,
    //   ValidFrom: this.approveCreditAppraisalForm.value.fromDate ? this.fromDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : '',
    //   ValidTo: this.approveCreditAppraisalForm.value.toDate ? this.toDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : '',
    //   AppliedNo: Number(this.approveCreditAppraisalForm.value.noOfVehicle),
    //   AppliedAmount: Number(this.approveCreditAppraisalForm.value.amount),
    //   Remarks: this.approveCreditAppraisalForm.value.remarks,
    //   ApprovedNos: this.approveCreditAppraisalForm.value.approvedNo,
    //   ApprovedAmount: this.approveCreditAppraisalForm.value.approvedAmount,
    //   ApprovedDate: this.formatDateInISO(this.currentDate.toDateString()),
    //   ApprovedBy: this.approveCreditAppraisalForm.value.reportTo,
    //   Dormant: false,
    //   SFCamId: "",
    //   IsActive: true,
    //   Status: 'Rejected',
    //   Id: this.appraisalId
    // }

    this.selectedApprsailData.ModifiedById = this.currentUser.UserId,
      this.selectedApprsailData.ValidFrom = this.approveCreditAppraisalForm.value.fromDate ? this.fromDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.fromDate) : '',
      this.selectedApprsailData.ValidTo = this.approveCreditAppraisalForm.value.toDate ? this.toDateChanged ? this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : this.formatDateInISO(this.approveCreditAppraisalForm.value.toDate) : '',
      this.selectedApprsailData.AppliedNo = Number(this.approveCreditAppraisalForm.value.noOfVehicle),
      this.selectedApprsailData.AppliedAmount = Number(this.approveCreditAppraisalForm.value.amount),
      this.selectedApprsailData.Remarks = this.approveCreditAppraisalForm.value.remarks,
      this.selectedApprsailData.ApprovedNos = this.approveCreditAppraisalForm.value.approvedNo,
      this.selectedApprsailData.ApprovedAmount = this.approveCreditAppraisalForm.value.approvedAmount,
      this.selectedApprsailData.ApprovedDate = this.formatDateInISO(this.currentDate.toDateString()),
      this.selectedApprsailData.ApprovedBy = this.approveCreditAppraisalForm.value.reportTo,
      this.selectedApprsailData.Status = 'Rejected';

    this.approvetRejectDialog(this.selectedApprsailData.Status, this.selectedApprsailData)

  }

  approvetRejectDialog(status: any, data: any) {
    let dialogRef = this.dialog.open(ApproveRejectComponent, {
      width: '700px',
      height: '200px',
      data: { mode: status, data: data },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancelClick();
        this.spinner.hide();
        this.approveCreditAppraisalForm.reset();
        this.GetAllCreditAppraisal();
      }
    });
  }


  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.appraisalId, Name: this.selectedApprsailData.GOCName, moduleName: 'credit-appraisal' }
    });
  }

}