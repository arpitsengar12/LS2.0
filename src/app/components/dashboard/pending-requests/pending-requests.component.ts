import { Component, ViewChild } from '@angular/core';
import { PeriodicElement } from '../dashboard.component';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

export interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-pending-requests',
  templateUrl: './pending-requests.component.html',
  styleUrls: ['./pending-requests.component.scss']
})
export class PendingRequestsComponent {
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

  panelOpenState = false;
  selectedtab: number = 0;
  sortState: string = '';
  selectedRowIndex: any;
  @ViewChild('AllRequestTable') AllRequestTable!: MatTable<any>;
  @ViewChild('PendingRequestTable') PendingRequestTable!: MatTable<any>;
  @ViewChild('ApprovedRequestTable') ApprovedRequestTable!: MatTable<any>;
  @ViewChild('RejectedRequestTable') RejectedRequestTable!: MatTable<any>;
  displayedColumns: string[] = ['Module', 'Requested By', 'Last Approved By', 'Details', 'Pending Since', 'Status', 'Action'];
  AllRequestList: any[] = [];
  PendingRequestList: any[] = [];
  ApprovedRequestList: any[] = [];
  RejectedRequestList: any[] = [];
  sortDirection: string = '';
  isView: boolean = false;
  editMode: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;

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
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
    public dialog: MatDialog,
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

    // this.getAllRequests();
    this.selectedtab = 1;
    this.getPendingRequests();
    // this.getApprovedRequests();
    // this.getRejectedRequests();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || '';
      this.breadcrumbService.setBreadcrumbs([breadcrumb]);
    });
  }

  getAllRequests() {
    const data =
    {
      // Page: {
      //   // PageNumber: this.PageNumber + 1,
      //   PageNumber: this.PageNumber,
      //   PageSize: this.PageSize,
      //   Filter: {
      //     CreatedById: this.currentUser.UserId,
      //     IsSearch: this.IsSearch,
      //     SearchValue: this.searchText,
      //   }
      // }

    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllRequests(this.currentUser.UserId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.AllRequestList = res.Rows;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.AllRequestList.map((item, index) => {
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

  getPendingRequests() {
    const data =
    {
      // Page: {
      //   // PageNumber: this.PageNumber + 1,
      //   PageNumber: this.PageNumber,
      //   PageSize: this.PageSize,
      //   Filter: {
      //     CreatedById: this.currentUser.UserId,
      //     IsSearch: this.IsSearch,
      //     SearchValue: this.searchText,
      //   }
      // }

    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getPendingRequests(this.currentUser.UserId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.PendingRequestList = res.Rows;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.PendingRequestList.map((item, index) => {
            item.position = index;
          });
          this.commonService.requestStatusChanged.next(true);
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

  getApprovedRequests() {
    const data =
    {
      // Page: {
      //   // PageNumber: this.PageNumber + 1,
      //   PageNumber: this.PageNumber,
      //   PageSize: this.PageSize,
      //   Filter: {
      //     CreatedById: this.currentUser.UserId,
      //     IsSearch: this.IsSearch,
      //     SearchValue: this.searchText,
      //   }
      // }

    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getApprovedRequests(this.currentUser.UserId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.ApprovedRequestList = res.Rows;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.ApprovedRequestList.map((item, index) => {
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

  getRejectedRequests() {
    const data =
    {
      // Page: {
      //   // PageNumber: this.PageNumber + 1,
      //   PageNumber: this.PageNumber,
      //   PageSize: this.PageSize,
      //   Filter: {
      //     CreatedById: this.currentUser.UserId,
      //     IsSearch: this.IsSearch,
      //     SearchValue: this.searchText,
      //   }
      // }

    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getRejectedRequests(this.currentUser.UserId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.RejectedRequestList = res.Rows;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.RejectedRequestList.map((item, index) => {
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

  tabClick(event: any) {
    this.selectedtab = event.index;
    this.PageNumber = 1;
    this.PageSize = 10;

    if (this.selectedtab == 0) {
      this.getAllRequests();
    }
    else if (this.selectedtab == 1) {
      this.getPendingRequests();
    }
    else if (this.selectedtab == 2) {
      this.getApprovedRequests();
    }
    else if (this.selectedtab == 3) {
      this.getRejectedRequests();
    }

    let tab: any = event.tab;

    if (tab) {
      let _closestTabGroup: any = tab._closestTabGroup;
      let _elementRef: any = _closestTabGroup._elementRef;
      let nativeElement: any = _elementRef.nativeElement;
      let children: any = nativeElement.children;
      let children1: any = children[1];
      let Childs: any = children1.children;
      let Child1 = Childs[0];
      let Child2 = Childs[1];
      let Child3 = Childs[2];

      // let childArray: any[] = [Child1, Child2, Child3];
      // childArray.map((item, i) => {
      //   let tabContentWrapper: any = item.children;
      //   let tabContent: any = tabContentWrapper[0];
      //   if (this.selectedtab === i) {
      //     tabContent.classList.add('blue-bg');
      //   } else {
      //     tabContent.classList.remove('blue-bg');
      //   }
      // });
    }
  }


  announceSortChange(sortState: Sort, tableName: any) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;

      if (tableName == 'AllRequestTable') {
        this.AllRequestList = this.commonService.customSort(this.AllRequestList, sortState.active, sortState.direction);
        this.AllRequestTable.renderRows();
      }
      else if (tableName == 'PendingRequestTable') {
        this.PendingRequestList = this.commonService.customSort(this.PendingRequestList, sortState.active, sortState.direction);
        this.PendingRequestTable.renderRows();
      }
      else if (tableName == 'ApprovedRequestTable') {
        this.ApprovedRequestList = this.commonService.customSort(this.ApprovedRequestList, sortState.active, sortState.direction);
        this.ApprovedRequestTable.renderRows();
      }
      else if (tableName == 'RejectedRequestTable') {
        this.RejectedRequestList = this.commonService.customSort(this.RejectedRequestList, sortState.active, sortState.direction);
        this.RejectedRequestTable.renderRows();
      }

    }
  }

  approveRequest(element: any) {
    this.approveRejectDialog('Approved', element)
  }

  rejectRequest(element: any) {
    this.approveRejectDialog('Rejected', element)
  }

  approveRejectDialog(status: any, data: any) {
    let dialogRef = this.dialog.open(RequestApprovalComponent, {
      width: '700px',
      height: '200px',
      data: { mode: status, data: data },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.spinner.hide();
        this.getPendingRequests();
      }
    });
  }

  ViewPageRedirection(element: any) {

    if (element.TransactionId && element.TransactionId != null && element.TransactionId != '') {
      this.router.navigate([`/approver-screen`], {
        state: { level: this.AccessLevel, id: element.Id, moduleName: element.Module, TransactionId: element.TransactionId, IsApproverView: element.StatusId == 1 ? true : false }
      });
    }
    else if (element.StatusId == 1) {
      this.router.navigate([`/${element.Screen}`], {
        state: { level: this.AccessLevel, id: element.PmKey, mode: 'approver', moduleName: element.Module, TransactionId: element.Id, IsApproverView: true }
      });
    }
    else {
      this.router.navigate([`/${element.Screen}`], {
        state: { level: this.AccessLevel, id: element.PmKey, mode: 'view', moduleName: element.Module, TransactionId: element.Id, IsApproverView: true }
      });
    }


  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllRequests();
  }
}