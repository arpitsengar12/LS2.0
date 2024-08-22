import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/components/client.service';
import { CommonService } from '../../Services/common.service';
import { ApproveRejectComponent } from '../approve-reject/approve-reject.component';

@Component({
  selector: 'app-request-approval',
  templateUrl: './request-approval.component.html',
  styleUrls: ['./request-approval.component.scss']
})


export class RequestApprovalComponent {
  isAccept: boolean = false;
  isReject: boolean = false;
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<RequestApprovalComponent>,
    protected commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public sharedData: any,
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    dialogRef.disableClose = true;
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

    if (sharedData !== null && sharedData !== undefined && sharedData.mode === "Approved") {
      this.isAccept = true;
      this.isReject = false;
    }
    else if (sharedData !== null && sharedData !== undefined && sharedData.mode === "Rejected") {
      this.isAccept = false;
      this.isReject = true;
    }
    console.log(this.sharedData.data);

  }

  close() {
    this.dialogRef.close();
  }

  requestApprove() {

    if (this.sharedData.data.Id != null && this.sharedData.data.TransactionId != null) {
      let data = {
        id: this.sharedData.data.TransactionId,
        statusId: 2,
        remarks: ''
      };

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateStatusByTrasnactionId(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Request approved successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close(true);
          }
          else {
            this.toaster.error(res?.Errors[0]?.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close();
          }
        }
        (err: any) => {
          this.toaster.error(err, undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
          this.dialogRef.close();
        }
      });
    }
    else {
      let data = {
        id: this.sharedData.data.workflowId ? this.sharedData.data.workflowId : this.sharedData.data.Id,
        statusId: 2,
        remarks: ''
      };

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateRequestStatus(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Request approved successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close(true);
          }
          else {
            this.toaster.error(res?.Errors[0]?.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close();
          }
        }
        (err: any) => {
          this.toaster.error(err, undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
          this.dialogRef.close();
        }
      });
    }


    this.commonService.requestStatusChanged.next(true);
  }

  requestReject() {
    if (this.sharedData.data.Id != null && this.sharedData.data.TransactionId != null) {
      let data = {
        id: this.sharedData.data.TransactionId,
        statusId: 3,
        remarks: ''
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateStatusByTrasnactionId(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Request rejected successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close(true);
          }
          else {
            this.toaster.error(res?.Errors[0]?.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close();
          }
        }
        (err: any) => {
          this.toaster.error(err, undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
          this.dialogRef.close();
        }
      });
    }
    else {

      let data = {
        id: this.sharedData.data.workflowId ? this.sharedData.data.workflowId : this.sharedData.data.Id,
        statusId: 3,
        remarks: ''
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateRequestStatus(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Request rejected successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close(true);
          }
          else {
            this.toaster.error(res?.Errors[0]?.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.dialogRef.close();
          }
        }
        (err: any) => {
          this.toaster.error(err, undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
          this.dialogRef.close();
        }
      });
    }


    this.commonService.requestStatusChanged.next(true);

  }
}

// Id	StatusDescription
// 1	Pending
// 2	Approved
// 3	Rejected