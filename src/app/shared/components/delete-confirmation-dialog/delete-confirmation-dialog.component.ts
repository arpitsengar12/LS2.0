import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from '../../Services/common.service';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrls: ['./delete-confirmation-dialog.component.scss']
})
export class DeleteConfirmationDialogComponent {

  mainThemeClass = '';
  localTheme: any;
  IsCompliance: boolean = false;
  IsMenu: boolean = false;
  mode: string = '';

  isDeleteAccess: boolean = false;


  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    protected commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any
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

    if (data.AccessLevel) {
      this.isDeleteAccess = true;
    }

    if (data.moduleName == 'Compliance') {
      this.IsCompliance = true;
      this.IsMenu = false;
    }
    else if (data.moduleName == 'Menu') {
      this.IsCompliance = false;
      this.IsMenu = true;
    }

    if (data.mode == 'Enable') {
      this.mode = data.mode;
    } else {
      this.mode = data.mode;
    }
  }

  close() {
    this.dialogRef.close();
  }

}
