import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/components/client.service';
import { CommonService } from '../../Services/common.service';

@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.component.html',
  styleUrls: ['./approve-reject.component.scss']
})

export class ApproveRejectComponent {
  isAccept: boolean = false;
  isReject: boolean = false;
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<ApproveRejectComponent>,
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
      this.isReject = false
    }
    else if (sharedData !== null && sharedData !== undefined && sharedData.mode === "Rejected") {
      this.isAccept = false;
      this.isReject = true
    }
  }

  close() {
    this.dialogRef.close();
  }

  requestApprove(event: any) {
    let data = this.sharedData.data;
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.updateCreditAppraisal(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          if (event === "approve") {
            this.toaster.success("Credit appraisal approved successfully", undefined, {
              positionClass: 'toast-top-center'
            });
          }
          else if (event === "reject") {
            this.toaster.success("Credit appraisal rejected successfully", undefined, {
              positionClass: 'toast-top-center'
            });
          }
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
}