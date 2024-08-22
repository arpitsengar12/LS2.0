import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Constant } from 'src/app/shared/model/constant';

@Component({
  selector: 'app-reset-user-password',
  templateUrl: './reset-user-password.component.html',
  styleUrls: ['./reset-user-password.component.scss']
})
export class ResetUserPasswordComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;

  resetUserForm!: FormGroup;
  submitted: boolean = false;
  userId: number = 0;
  passwordInputType: string = 'password';
  confirmPasswordInputType: string = 'password';
  confirmPassError: boolean = false;

  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ResetUserPasswordComponent>,
    protected commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
  ) {

    if (history.state.level) {
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);
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

    this.resetUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl('', [Validators.required, Validators.pattern(Constant.passwordRegExp)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.pattern(Constant.passwordRegExp)]),
    });
    this.resetUserForm.markAllAsTouched();


    if (data) {
      if (data.userData) {
        this.userId = data.userData.UserGuidId;
        this.resetUserForm.get('userName')?.setValue(data.userData.UserName);
      }

    }

  }

  get validators() {
    return this.resetUserForm.controls;
  }


  close() {
    this.dialogRef.close();
  }

  resetUserPassword() {
    this.submitted = true;
    console.log(this.resetUserForm);

    if (this.resetUserForm.status == 'VALID') {
      let data = {
        Password: this.resetUserForm.value.password,
        UserId: this.userId,
        LoginId: 19 //this.currentUser.UserId
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.resetUserPassword(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('User password changed successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.dialogRef.close(true)
            this.spinner.hide();
          }
          else {
            this.close();
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


  //password matcher
  getConfirmPassword(cPass: string, newPassword: string) {
    if (newPassword === cPass) {
      this.confirmPassError = false;
    } else {
      this.confirmPassError = true;
    }

    if (cPass.length == 0 || newPassword.length == 0) {
      this.confirmPassError = false;
    }
  }

  //function for change type of input field (text to password and password to text)
  changeEyeIcon(label: string) {

    if (label === 'newPassword') {
      if (this.passwordInputType === 'password') {
        this.passwordInputType = 'text';
      } else {
        this.passwordInputType = 'password';
      }
    }

    if (label === 'confirmPassword') {
      if (this.confirmPasswordInputType === 'password') {
        this.confirmPasswordInputType = 'text';
      } else {
        this.confirmPasswordInputType = 'password';
      }
    }
  }

  resetForm() {
    this.submitted = false;
    this.resetUserForm.get('password')?.setValue('');
    this.resetUserForm.get('confirmPassword')?.setValue('');
  }

}