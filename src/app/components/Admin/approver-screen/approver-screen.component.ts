import { Component, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approver-screen',
  templateUrl: './approver-screen.component.html',
  styleUrls: ['./approver-screen.component.scss']
})

export class ApproverScreenComponent {
  dataList: any[] = [];
  clientId: 0;
  selecetdClientData: any;
  recordName: any;
  moduleName: any;

  mainThemeClass = '';
  localTheme: any;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  displayedColumns: string[] = ['Column Name', 'Old Value', 'New Value'];
  @ViewChild('approverTable') approverTable!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  selectedRowIndex: any;
  TransactionId: number = 0;
  IsApproverView: boolean = false;

  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    protected commonService: CommonService,
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    public location: Location,
    public dialog: MatDialog,
    private router: Router,
  ) {
    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);

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

    if (history.state.level) {
      this.clientId = history.state.id;
      this.recordName = history.state.Name;
      this.moduleName = history.state.moduleName;
      this.IsApproverView = history.state.IsApproverView;


      this.TransactionId = history.state.TransactionId;
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;

      this.getDataByTransactionId();
    }
  }

  getDataByTransactionId() {
    this.spinner.show();
    this.clientService.getDataByTransactionId(this.TransactionId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.dataList = res.Rows;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.dataList.map((item, index) => {
            item.position = index;
          });
          this.spinner.hide();
        }
        else if (res.Exception) {
          this.toaster.error('Unable to fetch changed data', undefined, {
            positionClass: 'toast-top-center'
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
    })


  }
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.dataList = this.commonService.customSort(this.dataList, sortState.active, sortState.direction);
      this.approverTable.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getDataByTransactionId();
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
      data: { mode: status, data: { Id: this.clientId, TransactionId: this.TransactionId } },
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