import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { DatePipe } from '@angular/common';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';
import { Location } from '@angular/common';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-master-budget',
  templateUrl: './master-budget.component.html',
  styleUrls: ['./master-budget.component.scss']
})
export class MasterBudgetComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('budgetTableList') budgetTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns = ['For Month', 'City Name', 'Repair Budget Amt', 'Created By', 'Created On', 'WFStatus', 'Action'];
  BudgetList: any[] = [];

  budgetForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  selectedBudgetData: any;
  budgetId: number = 0;
  cityList: any;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'City Name' },
    { filterName: 'Repair Budget Amt' },
    { filterName: 'Created By' },
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
    public dialog: MatDialog,
    public location: Location,
  ) {

    if (history.state.level) {
      this.IsAuditTrail = history.state.IsAuditTrail;
      this.TransactionId = history.state.TransactionId;
      this.budgetId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        // this.getAllBudget();
      }
      else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        // this.getAllBudget();
      }
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

    this.budgetForm = new FormGroup({
      forMonth: new FormControl('', [Validators.required]),
      cityName: new FormControl(null, [Validators.required]),
      repairBudgetAmt: new FormControl('', [Validators.required, Validators.pattern(Constant.IntNo)]),
    });
    this.budgetForm.markAllAsTouched();

    this.budgetForm.markAllAsTouched();

    this.getAllBudget();
    this.getCity();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }

  getAllBudget() {

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
          // cityName: this.selectedFilter.filterName == "City Name" ? this.searchText : "",
          // RepairBudgetAmt: this.selectedFilter.filterName == "Repair Budget Amt" ? this.searchText : "",
          // CreatedBy: this.selectedFilter.filterName == "Created By" ? this.searchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllBudget(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.BudgetList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.BudgetList.map((item, index) => {
            item.position = index;
          });
          if (this.BudgetList && this.BudgetList.length > 0) {
            this.BudgetList.map((item) => {
              if (item.BudgetID == this.budgetId) {
                if (this.IsApproverView) {
                  this.setDataApprover(item);
                }
                if (this.isView) {
                  this.setDataView(item);
                }
              }
            });
          }
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


  getCity() {
    let obj = { Page: { PageNumber: 0, PageSize: 0 } }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(obj));
    this.spinner.show();
    this.clientService.getAllCity(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.cityList = res.Records;
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


  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllBudget();
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
      this.getAllBudget();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.BudgetList = this.commonService.customSort(this.BudgetList, sortState.active, sortState.direction);
      this.budgetTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllBudget();
  }

  get validators() {
    return this.budgetForm.controls;
  }

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  addBudget() {
    this.submitted = true;
    console.log(this.budgetForm);

    if (this.budgetForm.status == "VALID") {
      let data = {
        CreatedById: this.currentUser.UserId,
        FMonth: this.budgetForm.value.forMonth ? this.formatDateInISO(this.budgetForm.value.forMonth) : '',
        CityID: this.budgetForm.value.cityName,
        RepairBudgetAmt: this.budgetForm.value.repairBudgetAmt,
        IsActive: true,

        // RepairUsedAmt: 1310131.0,
        // FirstAlertLimit: 781978.0,
        // FirstAlertOn: "2011-12-14T18:12:24.94",
        // SecondAlertLimit: 882996.0,
        // SecondAlertOn: "2011-12-23T15:32:39.973",
        // ThirdAlertLimit: 1031272.0,
        // ThirdAlertOn: "2011-12-26T11:29:29.773",
        // FourthAlertLimit: 1089286.0,
        // FourthAlertOn: "2011-12-27T11:12:05.107",
        // CreatedByUser: null,
        // ModifiedByUser: null,
        // ModifiedById: null,
        // CityName: null,
        // City: null,
        // CreatedBy: null,
        // ModifiedBy: null,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addBudget(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            // this.toaster.success('Budget added successfully', undefined, {
            //   positionClass: 'toast-top-center'
            // });
            this.toaster.success(res.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllBudget();

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

  updateBudget() {
    this.submitted = true;
    if (this.budgetForm.status == "VALID") {
      // let data = {
      //   BudgetID: this.budgetId,
      //   ModifiedById: this.currentUser.UserId,
      //   FMonth: this.budgetForm.value.forMonth ? this.formatDateInISO(this.budgetForm.value.forMonth) : '',
      //   CityID: this.budgetForm.value.cityName,
      //   RepairBudgetAmt: this.budgetForm.value.repairBudgetAmt,

      //   RepairUsedAmt: this.selectedBudgetData.RepairUsedAmt,
      //   CreatedDate: this.selectedBudgetData.CreatedDate,
      //   ModifiedDate: this.selectedBudgetData.ModifiedDate,
      //   FirstAlertLimit: this.selectedBudgetData.FirstAlertLimit,
      //   FirstAlertOn: this.selectedBudgetData.FirstAlertOn,
      //   SecondAlertLimit: this.selectedBudgetData.SecondAlertLimit,
      //   SecondAlertOn: this.selectedBudgetData.SecondAlertOn,
      //   ThirdAlertLimit: this.selectedBudgetData.ThirdAlertLimit,
      //   ThirdAlertOn: this.selectedBudgetData.ThirdAlertOn,
      //   FourthAlertLimit: this.selectedBudgetData.FourthAlertLimit,
      //   FourthAlertOn: this.selectedBudgetData.FourthAlertOn,
      //   IsActive: this.selectedBudgetData.IsActive,
      //   CreatedByUser: this.selectedBudgetData.CreatedByUser,
      //   ModifiedByUser: this.selectedBudgetData.ModifiedByUser,
      //   CreatedById: this.selectedBudgetData.CreatedById,
      //   CityName: this.selectedBudgetData.CityName,
      //   City: this.selectedBudgetData.City,
      //   CreatedBy: this.selectedBudgetData.CreatedBy,
      //   ModifiedBy: this.selectedBudgetData.ModifiedBy,
      // }

      this.selectedBudgetData.ModifiedById = this.currentUser.UserId;
      this.selectedBudgetData.FMonth = this.budgetForm.value.forMonth ? this.formatDateInISO(this.budgetForm.value.forMonth) : '';
      this.selectedBudgetData.CityID = this.budgetForm.value.cityName;
      this.selectedBudgetData.RepairBudgetAmt = this.budgetForm.value.repairBudgetAmt;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedBudgetData));

      this.spinner.show();
      this.clientService.updateBudget(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            // this.toaster.success('Budget updated successfully', undefined, {
            //   positionClass: 'toast-top-center'
            // });
            this.toaster.success(res.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllBudget();

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
    this.getAllBudget();
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
    this.getAllBudget();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.IsApproverView = false;
    this.selectedRowIndex = null;
    this.isView = false;
    this.budgetForm.reset(defaultValues);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.budgetForm.reset(defaultValues);
    this.submitted = false;
    this.budgetId = data.BudgetID;
    this.selectedBudgetData = data;
    this.editMode = true;
    this.isView = false;
    this.IsApproverView = false;

    this.budgetForm.get('forMonth')?.setValue(data.FMonth);
    this.budgetForm.get('cityName')?.setValue(data.CityID);
    this.budgetForm.get('repairBudgetAmt')?.setValue(data.RepairBudgetAmt);

  }

  setDataView(data: any) {
    this.scrollToTop();
    this.budgetForm.reset(defaultValues);
    this.submitted = false;
    this.budgetId = data.BudgetID;
    this.selectedBudgetData = data;
    this.isView = true;
    this.editMode = false;
    this.IsApproverView = false;

    this.budgetForm.get('forMonth')?.setValue(data.FMonth);
    this.budgetForm.get('cityName')?.setValue(data.CityID);
    this.budgetForm.get('repairBudgetAmt')?.setValue(data.RepairBudgetAmt);
    this.budgetForm.disable();
  }

  setDataApprover(data: any) {
    this.scrollToTop();
    this.budgetForm.reset(defaultValues);
    this.submitted = false;
    this.budgetId = data.BudgetID;
    this.selectedBudgetData = data;
    this.editMode = false;
    this.isView = false;
    this.IsApproverView = true;

    this.budgetForm.get('forMonth')?.setValue(data.FMonth);
    this.budgetForm.get('cityName')?.setValue(data.CityID);
    this.budgetForm.get('repairBudgetAmt')?.setValue(data.RepairBudgetAmt);
    this.budgetForm.disable();

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {

    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.budgetId, moduleName: 'master-budget' }
    });
  }

  approveRequest() {
    this.approveRejectDialog('Approved')
  }

  rejectRequest() {
    this.approveRejectDialog('Rejected')
  }

  approveRejectDialog(status: any) {
    let dialogRef = this.dialog.open(RequestApprovalComponent, {
      width: '700px',
      height: '200px',
      data: { mode: status, data: { Id: null, workflowId: this.TransactionId } },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.spinner.hide();
        this.router.navigate([`/pending-requests`], {
          state: { level: this.AccessLevel }
        });
      }
    });
  }

}


let defaultValues = {
  forMonth: '',
  cityName: null,
  repairBudgetAmt: '',
}