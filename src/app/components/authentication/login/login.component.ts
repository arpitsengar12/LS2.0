import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../client.service';
import { Constant } from 'src/app/shared/model/constant';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AngularFireAuth } from '@angular/fire/compat/auth';
// import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { NgOtpInputComponent } from 'ng-otp-input/lib/components/ng-otp-input/ng-otp-input.component';
import { CommonService } from 'src/app/shared/Services/common.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('ngOtpInput') ngOtpInput: NgOtpInputComponent;


  showOTPScreen: boolean = false;
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  submitted: boolean = false;
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
  hide = true;
  rememberMeSelected: boolean = false;
  theme: any;
  resentOtpEnable: boolean = false;

  constructor(
    // public themeService: CustomizerSettingsService,
    private clientService: ClientService,
    private toaster: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private afAuth: AngularFireAuth,
    private commonService: CommonService,
  ) {

    this.loginForm = new FormGroup({
      userName: new FormControl('', [Validators.required,]),
      password: new FormControl('', [Validators.required,]),
    });

    this.otpForm = new FormGroup({
      // otp: new FormControl('', [Validators.required]),
      UserName: new FormControl('', [Validators.required,]),
    });

    sessionStorage.clear();
    localStorage.clear();
  }

  clearOtpInput() {
    if (this.ngOtpInput) {
      this.ngOtpInput.setValue('');
    }
  }


  get validators() {
    return this.loginForm.controls;
  }

  get OTPformvalidators() {
    return this.otpForm.controls;
  }

  OTPScreen(value: any) {
    if (value == 'show') {
      this.showOTPScreen = true;

      this.otpRequested = false;
      this.submitted = false;
      if (this.loginForm.value.userName != null && this.loginForm.value.userName != '') {
        this.otpForm.get('UserName')?.setValue(this.loginForm.value.userName);
      }
      this.loginForm.reset();
    }
    else {
      this.showOTPScreen = false;
      if (this.otpForm.value.userName != null && this.otpForm.value.userName != '') {
        this.loginForm.get('UserName')?.setValue(this.otpForm.value.userName);
      }
      this.otpForm.reset();
      this.otpNotRequested = false;
      this.rememberMeSelected = false;
    }
  }
  //send OTP
  sendOTP() {
    this.clearOtpInput();
    this.otpRequired = true;
    this.submitted = true;
    this.otpNotRequested = false;
    if (this.otpForm.valid) {
      let data = {
        UserName: this.otpForm.value.UserName,
      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.sendOTPForLogin(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("OTP has been sent successfully!", undefined, {
              positionClass: 'toast-top-center'
            });
            this.timer(120);
            this.otpRequested = true;
            this.spinner.hide();
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
      this.loginwithOTP();
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

    if (remaining == -1) {
      this.resentOtpEnable = true;
    }

    if (!this.timerOn) {
      // Do validate stuff here
      return;
    }
    // Do timeout stuff here
    // this.toaster.error('Timeout for OTP');
  }

  remeberMeClicked(event: Event) {
    let box: any = event.target;
    if (box.checked) {
      this.rememberMeSelected = true;
    }
    else if (!box.checked) {
      this.rememberMeSelected = false;
    }
  }

  loginWithPass() {
    this.submitted = true;

    if (this.loginForm.status == 'VALID') {
      const data = {
        UserName: this.loginForm.value.userName,
        Password: this.loginForm.value.password
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.loginWithCredentials(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Login Successfull!", undefined, {
              positionClass: 'toast-top-center'
            });


            sessionStorage.setItem('user', JSON.stringify(res));

            sessionStorage.setItem(Constant.accessToken, res.Token);
            sessionStorage.setItem(Constant.id, res.Id);
            sessionStorage.setItem(Constant.userName, res.UserName);
            sessionStorage.setItem(Constant.email, res.Email);
            sessionStorage.setItem(Constant.roleName, res.UserRole);
            sessionStorage.setItem(Constant.roleId, res.RoleId);
            sessionStorage.setItem(Constant.companyId, res.CompanyId);
            sessionStorage.setItem(Constant.expires, res.Expires);
            sessionStorage.setItem(Constant.departmentId, res.DepartmentId);
            sessionStorage.setItem(Constant.userId, res.UserId);
            sessionStorage.setItem(Constant.applicationId, res.ApplicationId);

            if (res.userTheme && res.userTheme != '') {
              this.theme = JSON.parse(res.userTheme);
              sessionStorage.setItem(Constant.theme, JSON.stringify(this.theme));
            } else {
              let defaultTheme = "{\r\n \"themeClass\":\"default-blue-colored-theme\",\r\n \"themeMode\":\"\",\r\n \"themeName\":\"Default\",\r\n \"themeColorCode\": \"#00B0F0\"}";
              this.theme = JSON.parse(defaultTheme);
              sessionStorage.setItem(Constant.theme, JSON.stringify(this.theme));
            }

            if (this.rememberMeSelected) {
              localStorage.setItem('user', JSON.stringify(res));
            }

            this.commonService.pageNavigation({ URL: 'MainWithoutSidebar.aspx' });
            this.spinner.hide();
          }
          else {
            if (res?.Errors[0] && res?.Errors[0]?.ErrorNumber && res?.Errors[0]?.Message && res?.Errors[0]?.ErrorNumber == 1671) {
              this.toaster.error(res?.Errors[0]?.Message, undefined, {
                positionClass: 'toast-top-center',
                closeButton: true,
              });
              this.router.navigate(['authentication/forgot-password']);
              this.spinner.hide();
            }
            else {
              this.toaster.error(res?.Errors[0]?.Message, undefined, {
                positionClass: 'toast-top-center',
                closeButton: true,
              });
              this.loginForm.reset();
              this.submitted = false;
              this.spinner.hide();
            }

          }
          this.spinner.hide();
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

  loginwithOTP() {
    if (!this.otpRequested) {
      this.otpNotRequested = true; // to give error message if otp is requested.
    }
    this.submitted = true;
    if (this.otpForm.status == 'VALID' && this.otpRequested && !this.otpInvalid && !this.otpRequired) {
      const data = {
        UserName: this.otpForm.value.UserName,
        otp: this.otpValue
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.loginWithOTP(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Login Successfull!", undefined, {
              positionClass: 'toast-top-center'
            });

            this.commonService.pageNavigation({ URL: 'MainWithoutSidebar.aspx' });

            sessionStorage.setItem('user', JSON.stringify(res));

            sessionStorage.setItem(Constant.accessToken, res.Token);
            sessionStorage.setItem(Constant.id, res.Id);
            sessionStorage.setItem(Constant.userName, res.UserName);
            sessionStorage.setItem(Constant.email, res.Email);
            sessionStorage.setItem(Constant.roleName, res.UserRole);
            sessionStorage.setItem(Constant.roleId, res.RoleId);
            sessionStorage.setItem(Constant.companyId, res.CompanyId);
            sessionStorage.setItem(Constant.expires, res.Expires);
            sessionStorage.setItem(Constant.departmentId, res.DepartmentId);
            sessionStorage.setItem(Constant.applicationId, res.ApplicationId);

            if (res.userTheme && res.userTheme != '') {
              this.theme = JSON.parse(res.userTheme);
              sessionStorage.setItem(Constant.theme, JSON.stringify(this.theme));
            } else {
              let defaultTheme = "{\r\n \"themeClass\":\"default-blue-colored-theme\",\r\n \"themeMode\":\"\",\r\n \"themeName\":\"Default\",\r\n \"themeColorCode\": \"#00B0F0\"}";
              this.theme = JSON.parse(defaultTheme);
              sessionStorage.setItem(Constant.theme, JSON.stringify(this.theme));
            }

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


  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    this.afAuth.signInWithPopup(provider)
      .then((result: any) => {
        // console.log(result);

        // Handle the successful authentication here idToken
        //sessionStorage.setItem(Constant.accessToken, result.credential.accessToken);
        // sessionStorage.setItem(Constant.userName, result.user.displayName);
        // sessionStorage.setItem(Constant.email, result.user.email);
        // sessionStorage.setItem(Constant.accessToken, result.credential.idToken);
        // this.commonService.pageNavigation({URL:'MainWithoutSidebar.aspx'});
        let user = result.user.multiFactor.user;
        sessionStorage.setItem(Constant.accessToken, user.accessToken);
        let data = {
          Email: user.email,
        };

        let formData: FormData = new FormData();
        formData.append("RequestData", JSON.stringify(data));

        this.spinner.show();
        this.clientService.loginWithFirebase(formData).subscribe((res: any) => {
          if (res) {
            if (!res.HasErrors) {
              this.toaster.success("Login Successfull!", undefined, {
                positionClass: 'toast-top-center'
              });

              sessionStorage.setItem('user', JSON.stringify(res));

              sessionStorage.setItem(Constant.accessToken, res.Token);
              sessionStorage.setItem(Constant.id, res.Id);
              sessionStorage.setItem(Constant.userName, res.UserName);
              sessionStorage.setItem(Constant.email, res.Email);
              sessionStorage.setItem(Constant.roleName, res.UserRole);
              sessionStorage.setItem(Constant.roleId, res.RoleId);
              sessionStorage.setItem(Constant.companyId, res.CompanyId);
              sessionStorage.setItem(Constant.expires, res.Expires);
              sessionStorage.setItem(Constant.departmentId, res.DepartmentId);
              sessionStorage.setItem(Constant.applicationId, res.ApplicationId);

              if (res.userTheme && res.userTheme != '') {
                this.theme = JSON.parse(res.userTheme);
                sessionStorage.setItem(Constant.theme, JSON.stringify(this.theme));
              }
              else {
                let defaultTheme = "{\r\n \"themeClass\":\"default-blue-colored-theme\",\r\n \"themeMode\":\"\",\r\n \"themeName\":\"Default\",\r\n \"themeColorCode\": \"#00B0F0\"}";
                this.theme = JSON.parse(defaultTheme);
                sessionStorage.setItem(Constant.theme, JSON.stringify(this.theme));
              }

              this.commonService.pageNavigation({ URL: 'MainWithoutSidebar.aspx' });
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
      })
      .catch((error) => {
        // Handle any errors here
      });
    const auth = getAuth();
  }
}


