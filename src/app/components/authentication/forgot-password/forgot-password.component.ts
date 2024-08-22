import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
// import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  forgetPasswordForm!: FormGroup;
  submitted: boolean = false;
  otpForm!: FormGroup;

  constructor(
    // public themeService: CustomizerSettingsService,
    private toaster: ToastrService,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private router: Router,
  ) {

    this.otpForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
    });
  }

  get validators() {
    return this.otpForm.controls;
  }

  forgetPassword() {
    this.submitted = true;
    if (this.forgetPasswordForm.status == 'VALID') {
      const data = {
        Email: this.forgetPasswordForm.value.email,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.forgetPassword(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("mail has been sent on your registered Email", undefined, {
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
      });
    }
  }

  generateOTP() {
    this.submitted = true;
    if (this.otpForm.valid) {
      let data = {
        UserName: this.otpForm.value.userName,
      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.sendOTPForLogin(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('OTP has been sent to your Mobile!');
            this.spinner.hide();
            this.router.navigate(['authentication/reset-password'], { state: { userName: data.UserName } });
          } else {
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

  // toggleTheme() {
  //     this.themeService.toggleTheme();
  // }

  // toggleCardBorderTheme() {
  //     this.themeService.toggleCardBorderTheme();
  // }

  // toggleCardBorderRadiusTheme() {
  //     this.themeService.toggleCardBorderRadiusTheme();
  // }

  // toggleRTLEnabledTheme() {
  //     this.themeService.toggleRTLEnabledTheme();
  // }

}