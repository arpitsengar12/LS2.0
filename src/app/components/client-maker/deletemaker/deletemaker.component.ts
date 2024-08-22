import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-deletemaker',
  templateUrl: './deletemaker.component.html',
  styleUrls: ['./deletemaker.component.scss']
})
export class DeletemakerComponent {
  mainThemeClass = '';
  localTheme: any;

  constructor(
    public dialogRef: MatDialogRef<DeletemakerComponent>,
    protected commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private toaster:ToastrService,
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


    dialogRef.disableClose = true;

  }

  close() {
    this.dialogRef.close();
  }

  deleteUser() {
    this.close();
    this.spinner.show();
    this.clientService.deleteClient(this.data.Id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
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
}
