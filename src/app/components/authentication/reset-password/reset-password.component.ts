import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { NgOtpInputComponent } from 'ng-otp-input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  @ViewChild('ngOtpInput') ngOtpInput: NgOtpInputComponent;

  resetUserForm!: FormGroup;
  submitted: boolean = false;
  hide = true;
  userId: number = 0;
  passwordInputType: string = 'password';
  confirmPasswordInputType: string = 'password';
  confirmPassError: boolean = false;
  otpInvalid: boolean = false;
  otpRequired: boolean = false;
  otp: string = '';
  otpValue: string = '';
  timeLeft: string;
  timerOn = true;
  timeoutObj: any;
  otpRequested: boolean = false;
  otpSubmitted: boolean = false;
  otpNotRequested: boolean = false;
  userName: string = '';
  constructor(
    protected commonService: CommonService,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private router: Router,
  ) {

    if (history.state.userName) {
      this.userName = history.state.userName;
    }

    this.timer(300);
    this.otpRequested = true;
    this.otpRequired = true;
    this.resetUserForm = new FormGroup({
      // userName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.pattern(Constant.passwordRegExp)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.pattern(Constant.passwordRegExp)]),
    });
    this.resetUserForm.markAllAsTouched();
  }

  get validators() {
    return this.resetUserForm.controls;
  }

  resetUserPassword() {
    this.submitted = true;
    console.log(this.resetUserForm);

    if (this.resetUserForm.status == 'VALID' && !this.otpInvalid && !this.otpRequired) {
      let data = {
        OTP: this.otpValue,
        UserName: this.userName,
        Password: this.resetUserForm.value.password,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.forgetPassword(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Password reset successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(['authentication/login']);
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

  clearOtpInput() {
    if (this.ngOtpInput) {
      this.ngOtpInput.setValue('');
    }
  }

  //validate otp
  onOtpChange(event: any) {
    this.otp = event;
    if (event.length == 1 || event.length > 1) {
      this.otpRequired = false;
    } else {
      this.otpRequired = true;
    }

    if (event.length == 6) {
      this.otpInvalid = false;
      this.otpValue = event;
    } else {
      this.otpInvalid = true;
    }

    if (event.length == 0) {
      this.otpInvalid = false;
    }
  }

  //otp timer
  timer(remaining: any) {
    clearTimeout(this.timeoutObj);// to clear previous time before resend otp
    this.timeLeft = '';
    var m: any = Math.floor(remaining / 60);
    var s: any = remaining % 60;

    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;

    this.timeLeft = m + ':' + s;

    remaining -= 1;

    if (remaining >= 0 && this.timerOn) {
      this.timeoutObj = setTimeout(() => {
        this.timer(remaining);
      }, 1000);
      return;
    }

    if (!this.timerOn) {
      // Do validate stuff here
      return;
    }
    // Do timeout stuff here
    // this.toaster.error('Timeout for OTP');
  }

}