import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../client.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/shared/Services/common.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Location } from '@angular/common';
import { number } from 'echarts';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';
import { MatDialog } from '@angular/material/dialog';

export interface PeriodicElement {
  TableName: string;
  ColumnName: string;
  CompilanceType: any;
  ColumnType: string;
  FieldLabel: string;
  LastModified: string;
  Action: any;
  CompilanceArray: any;

}

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {
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



  @ViewChild('NgfilterDropdown ') public NgfilterDropdown: NgSelectComponent;
  addUserForm!: FormGroup;
  userIdList: any;
  displayedColumns: string[] = ['userName', 'city', 'deviationRight', 'int', 'rv', 'rmte', 'mfee', 'bookingAppForm', 'BookingA', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  ConfigurationList: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  submitted: boolean = false;
  confirmPassError: boolean = false;
  deviationRight: boolean = false;
  cityList: any;
  regionList: any;
  userList: any;
  selecetdUserData: any;
  isView: boolean = false;
  editMode: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;

  userId: number = 0;
  userGuidId: string = '';
  passwordInputType: string = 'password';
  confirmPasswordInputType: string = 'password';

  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    protected commonService: CommonService,
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
      this.TransactionId = history.state.TransactionId;
      this.userGuidId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getUserById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getUserById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getUserById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }



    this.addUserForm = new FormGroup({
      userName: new FormControl('', [Validators.required, Validators.pattern(Constant.userNameInput)]),
      mobileNo: new FormControl('', [Validators.required, Validators.pattern(Constant.phoneRegExp)]),
      password: new FormControl('', [Validators.required, Validators.pattern(Constant.passwordRegExp)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.pattern(Constant.passwordRegExp)]),
      email: new FormControl('', [Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]),
      securityAnswer: new FormControl('', [Validators.required]),
      securityQuestion: new FormControl('', [Validators.required]),
      region: new FormControl(null, []),
      city: new FormControl(null, []),
      // reportTo: new FormControl('', []),
      // department: new FormControl('', []),
      foreCloseBilling: new FormControl(false, []),
      deactivateUser: new FormControl(false, []),
      lockedUser: new FormControl(false, []),
      deviationRight: new FormControl(false, []),
      mgmtConsole: new FormControl(false, []),
      exRights: new FormControl(false, []),
      interestMarket: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      interestFixed: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      rmtb: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      mfee: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      approvalForm: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      approvalTo: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      accAppFrom: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      accAppTo: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      firstYear: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      restYear: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      rv: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      mfaStatus: new FormControl(false, [])
    });
    this.addUserForm.markAllAsTouched();
    this.getCity();
    this.getAllRegion();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin / User and Roles / All Users';
      this.breadcrumbService.setBreadcrumbs(['Admin / User and Roles / All Users', breadcrumb]);
    });
  }

  get validators() {
    return this.addUserForm.controls;
  }

  getUserById() {
    this.spinner.show();
    this.clientService.getUserById(this.userGuidId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selecetdUserData = res;
          this.userId = res.AspNetUser.Id;
          this.addUserForm.reset(defaultValues);
          this.removeValidators();
          if (this.isView) {
            this.addUserForm.disable();
          }
          if (this.editMode) {
            this.addUserForm.get('userName')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
            this.addUserForm.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addUserForm.get('email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);

          } else {
            this.addUserForm.get('userName')?.setValidators([Validators.required, Validators.pattern(Constant.userNameInput)]);
            this.addUserForm.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
            this.addUserForm.get('email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]);
          }
          // To apply the new validators, you need to update the form control's value
          this.addUserForm.updateValueAndValidity();

          if (this.selecetdUserData.AspNetUser != null) {
            this.addUserForm.patchValue({
              userName: this.selecetdUserData.AspNetUser.UserName,
              mobileNo: this.selecetdUserData.AspNetUser.PhoneNo,
              email: this.selecetdUserData.AspNetUser.Email,
              securityAnswer: this.selecetdUserData.AspNetUser.SecurityAnswer,
              securityQuestion: this.selecetdUserData.AspNetUser.SecurityQuestion,
              approvalForm: this.selecetdUserData.AspNetUser.Approval_From,
              approvalTo: this.selecetdUserData.AspNetUser.Approval_To,
              deactivateUser: this.selecetdUserData.AspNetUser.DeActivate_User,
              lockedUser: this.selecetdUserData.AspNetUser.Locked_User,
            });

            (this.selecetdUserData.AspNetUser.Region != null && this.selecetdUserData.AspNetUser.Region != '') ? this.addUserForm.get('region')?.setValue(Number(this.selecetdUserData.AspNetUser.Region)) : this.addUserForm.get('region')?.setValue(null);
          }

          if (this.selecetdUserData.AspNetUserBranch != null) {
            this.addUserForm.patchValue({
              foreCloseBilling: this.selecetdUserData.AspNetUserBranch.ForeCloseBill,
              deviationRight: this.selecetdUserData.AspNetUserBranch.DeviationRight,
              mgmtConsole: this.selecetdUserData.AspNetUserBranch.MgmtConsole,
              exRights: this.selecetdUserData.AspNetUserBranch.ExceptionalRights,
              interestMarket: this.selecetdUserData.AspNetUserBranch.Int,
              interestFixed: this.selecetdUserData.AspNetUserBranch.FixedInt,
              rmtb: this.selecetdUserData.AspNetUserBranch.RMTB,
              mfee: this.selecetdUserData.AspNetUserBranch.MFee,
              accAppFrom: this.selecetdUserData.AspNetUserBranch.AccAppFrom,
              accAppTo: this.selecetdUserData.AspNetUserBranch.AccAppTo,
              firstYear: this.selecetdUserData.AspNetUserBranch.InsFirstYear,
              restYear: this.selecetdUserData.AspNetUserBranch.InsRestYear,
              rv: this.selecetdUserData.AspNetUserBranch.RV,

            });

            (this.selecetdUserData.AspNetUserBranch.CityId != null && this.selecetdUserData.AspNetUserBranch.CityId != '') ? this.addUserForm.get('city')?.setValue(this.selecetdUserData.AspNetUserBranch.CityId.split(",").map(this.toNumber)) : this.addUserForm.get('city')?.setValue(null);
            this.selecetdUserData.AspNetUserBranch.DeviationRight ? this.deviationRight = true : this.deviationRight = false; // to set deviation value top side
          }

          if (this.selecetdUserData.AspNetUserBranch != null) {
            this.addUserForm.patchValue({
              mfaStatus: this.selecetdUserData.AspNetUserMembership.MFAStatus,
            });
          }

          this.spinner.hide();
        }
        else {
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

  createUser() {
    this.submitted = true;
    console.log(this.addUserForm);
    if (this.addUserForm.valid && !this.confirmPassError) {
      let obj = {
        CreatedByUser: this.currentUser.UserName,

        FirstName: "",
        LastName: "",
        UserName: this.addUserForm.value.userName,
        // "AspUserId: null,
        Password: this.addUserForm.value.confirmPassword,
        //  ApplicationId: "944A8322-670F-47DB-8EA6-7AE4776FD145",
        PhoneNo: this.addUserForm.value.mobileNo,
        Email: this.addUserForm.value.email,
        SecurityQuestion: this.addUserForm.value.securityQuestion,
        SecurityAnswer: this.addUserForm.value.securityAnswer,
        CityArray: this.addUserForm.value.city ? this.addUserForm.value.city : [],
        DeviationRight: this.addUserForm.value.deviationRight,
        // ReportTo: this.addUserForm.value.reportTo,
        Region: this.addUserForm.value.region,
        DeActivate_User: this.addUserForm.value.deactivateUser,
        Locked_User: this.addUserForm.value.lockedUser,
        LastWorkingDay: null,
        Int: this.addUserForm.value.interestMarket != null && this.addUserForm.value.interestMarket != '' ? this.addUserForm.value.interestMarket : "0",
        FixedInt: this.addUserForm.value.interestFixed != null && this.addUserForm.value.interestFixed != '' ? this.addUserForm.value.interestFixed : "0",
        Approval_From: this.addUserForm.value.approvalForm != null && this.addUserForm.value.approvalForm != '' ? Number(this.addUserForm.value.approvalForm) : 0,
        Approval_To: this.addUserForm.value.approvalTo != null && this.addUserForm.value.approvalTo != '' ? Number(this.addUserForm.value.approvalTo) : 0,
        RV: this.addUserForm.value.rv != null && this.addUserForm.value.rv != '' ? this.addUserForm.value.rv : "0",
        RMTB: this.addUserForm.value.rmtb != null && this.addUserForm.value.rmtb != '' ? this.addUserForm.value.rmtb : "0",
        MFee: this.addUserForm.value.mfee != null && this.addUserForm.value.mfee != '' ? this.addUserForm.value.mfee : "0",
        AccAppFrom: this.addUserForm.value.accAppFrom != null && this.addUserForm.value.accAppFrom != '' ? Number(this.addUserForm.value.accAppFrom) : 0,
        AccAppTo: this.addUserForm.value.accAppTo != null && this.addUserForm.value.accAppTo != '' ? Number(this.addUserForm.value.accAppTo) : 0,
        ExceptionalRights: this.addUserForm.value.exRights != null && this.addUserForm.value.exRights != false ? 1 : 0,
        MgmtConsole: this.addUserForm.value.mgmtConsole != null && this.addUserForm.value.mgmtConsole != false ? 1 : 0,
        DeActivate: this.addUserForm.value.deactivateUser != null && this.addUserForm.value.deactivateUser != false ? 1 : 0,
        ForeCloseBill: this.addUserForm.value.foreCloseBilling != null && this.addUserForm.value.foreCloseBilling != false ? 1 : 0,
        InsFirstYear: this.addUserForm.value.firstYear != null && this.addUserForm.value.firstYear != '' ? this.addUserForm.value.firstYear : "0",
        InsRestYear: this.addUserForm.value.restYear != null && this.addUserForm.value.restYear != '' ? this.addUserForm.value.restYear : "0",
        MFAStatus: this.addUserForm.value.mfaStatus,
        theme: this.theme,
      }
      let formData: FormData = new FormData();
      //formData.append("RequestData", JSON.stringify(obj));
      this.spinner.show();
      this.clientService.createUser(obj).subscribe((res: any) => {
        if (!res.HasErrors) {
          this.spinner.hide();
          this.toaster.success('User Created Successfully', undefined, {
            positionClass: 'toast-top-center'
          });
          this.submitted = false;
          this.addUserForm.reset(defaultValues);
          this.router.navigate(["/users-list"], {
            state: {
              level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
            }
          });
        }
        else {
          this.toaster.error(res?.Errors[0]?.Message, undefined, {
            positionClass: 'toast-top-center'
          });
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

  onToggle(event: boolean) {
    this.deviationRight = event;
  }

  // get city
  getCity() {
    let obj = { Page: { PageNumber: 0, PageSize: 0 } }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(obj));
    this.spinner.show();
    this.clientService.getAllCity(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.cityList = res.Records;
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

  // get region
  getAllRegion() {
    const data =
      { Page: { PageNumber: 0, PageSize: 0 } }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllRegion(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.regionList = res.Records;
          this.spinner.hide();
        }
        else {
          this.toaster.error(res?.Errors[0]?.Message, undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
        }
      } (err: any) => {
        this.toaster.error(err, undefined, {
          positionClass: 'toast-top-center'
        });
        this.spinner.hide();
      }
    })
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.addUserForm.reset(defaultValues);
    this.removeValidators();
    this.submitted = false;
    this.userId = data.Id;
    this.confirmPassError = false;

    if (this.editMode) {
      this.addUserForm.get('userName')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
      this.addUserForm.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
      this.addUserForm.get('email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);

    } else {
      this.addUserForm.get('userName')?.setValidators([Validators.required, Validators.pattern(Constant.userNameInput)]);
      this.addUserForm.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
      this.addUserForm.get('email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]);
    }
    // To apply the new validators, you need to update the form control's value
    this.addUserForm.updateValueAndValidity();

    this.addUserForm.get('userName')?.setValue(data.UserName);
    // this.addUserForm.get('password')?.setValue(data.password);
    // this.addUserForm.get('confirmPassword')?.setValue(data.confirmPassword);
    this.addUserForm.get('userId')?.setValue(data.LastName);
    this.addUserForm.get('mobileNo')?.setValue(data.PhoneNumber);
    this.addUserForm.get('email')?.setValue(data.Email);
    this.addUserForm.get('securityAnswer')?.setValue(data.SecurityAnswer);
    this.addUserForm.get('securityQuestion')?.setValue(data.SecurityQuestion);

    (data.Region != null && data.Region != '') ? this.addUserForm.get('region')?.setValue(Number(data.Region)) : this.addUserForm.get('region')?.setValue(null);
    (data.CityId != null && data.CityId != '') ? this.addUserForm.get('city')?.setValue(data.CityId.split(",").map(this.toNumber)) : this.addUserForm.get('city')?.setValue(null);

    // this.addUserForm.get('reportTo')?.setValue(Number(data.Report_To));
    // this.addUserForm.get('department')?.setValue(data.City);
    this.addUserForm.get('foreCloseBilling')?.setValue(data.ForeClose_Billing);
    this.addUserForm.get('deactivateUser')?.setValue(data.DeActivate_User);
    this.addUserForm.get('lockedUser')?.setValue(data.Locked_User);
    this.addUserForm.get('deviationRight')?.setValue(data.DeviationRight);

    data.DeviationRight ? this.deviationRight = true : this.deviationRight = false; // to set deviation value top side

    this.addUserForm.get('mgmtConsole')?.setValue(data.Mgmt_Console);
    this.addUserForm.get('exRights')?.setValue(data.Ex_Rights);
    this.addUserForm.get('interestMarket')?.setValue(data.Int);
    this.addUserForm.get('interestFixed')?.setValue(data.FixedInt);
    this.addUserForm.get('rmtb')?.setValue(data.RMTB);
    this.addUserForm.get('mfee')?.setValue(data.MFee);
    this.addUserForm.get('approvalForm')?.setValue(data.Approval_From);
    this.addUserForm.get('approvalTo')?.setValue(data.Approval_To);
    this.addUserForm.get('accAppFrom')?.setValue(data.Acc_App_From);
    this.addUserForm.get('accAppTo')?.setValue(data.Acc_App_To);
    this.addUserForm.get('firstYear')?.setValue(data.First_Year);
    this.addUserForm.get('restYear')?.setValue(data.Rest_Year);
    this.addUserForm.get('rv')?.setValue(data.Rv);
    this.addUserForm.get('mfaStatus')?.setValue(data.MFAStatus);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  //update user
  updateUser() {
    this.submitted = true;
    console.log(this.addUserForm)
    if (this.addUserForm.valid && !this.confirmPassError) {
      // let obj = {
      //   ModifiedByUser: this.currentUser.UserName,
      //   UserId: this.userGuidId,
      //   // FirstName: "",
      //   // LastName: "",
      //   UserName: this.addUserForm.value.userName,
      //   // "AspUserId: null,
      //   //  Password: this.addUserForm.value.confirmPassword,
      //   //  ApplicationId: "944A8322-670F-47DB-8EA6-7AE4776FD145",
      //   PhoneNo: this.addUserForm.value.mobileNo,
      //   Email: this.addUserForm.value.email,
      //   // SecurityQuestion: this.addUserForm.value.securityQuestion,
      //   //  SecurityAnswer: this.addUserForm.value.securityAnswer,
      //   CityArray: this.addUserForm.value.city ? this.addUserForm.value.city : [],
      //   DeviationRight: this.addUserForm.value.deviationRight,
      //   // ReportTo: this.addUserForm.value.reportTo,
      //   Region: this.addUserForm.value.region,
      //   DeActivate_User: this.addUserForm.value.deactivateUser,
      //   Locked_User: this.addUserForm.value.lockedUser,
      //   LastWorkingDay: null,
      //   Int: this.addUserForm.value.interestMarket != null && this.addUserForm.value.interestMarket != '' ? this.addUserForm.value.interestMarket : "0",
      //   FixedInt: this.addUserForm.value.interestFixed != null && this.addUserForm.value.interestFixed != '' ? this.addUserForm.value.interestFixed : "0",
      //   Approval_From: this.addUserForm.value.approvalForm != null && this.addUserForm.value.approvalForm != '' ? Number(this.addUserForm.value.approvalForm) : 0,
      //   Approval_To: this.addUserForm.value.approvalTo != null && this.addUserForm.value.approvalTo != '' ? Number(this.addUserForm.value.approvalTo) : 0,
      //   RV: this.addUserForm.value.rv != null && this.addUserForm.value.rv != '' ? this.addUserForm.value.rv : "0",
      //   RMTB: this.addUserForm.value.rmtb != null && this.addUserForm.value.rmtb != '' ? this.addUserForm.value.rmtb : "0",
      //   MFee: this.addUserForm.value.mfee != null && this.addUserForm.value.mfee != '' ? this.addUserForm.value.mfee : "0",
      //   AccAppFrom: this.addUserForm.value.accAppFrom != null && this.addUserForm.value.accAppFrom != '' ? Number(this.addUserForm.value.accAppFrom) : 0,
      //   AccAppTo: this.addUserForm.value.accAppTo != null && this.addUserForm.value.accAppTo != '' ? Number(this.addUserForm.value.accAppTo) : 0,
      //   ExceptionalRights: this.addUserForm.value.exRights != null && this.addUserForm.value.exRights != false ? 1 : 0,
      //   MgmtConsole: this.addUserForm.value.mgmtConsole != null && this.addUserForm.value.mgmtConsole != false ? 1 : 0,
      //   DeActivate: this.addUserForm.value.deactivateUser != null && this.addUserForm.value.deactivateUser != false ? 1 : 0,
      //   ForeCloseBill: this.addUserForm.value.foreCloseBilling != null && this.addUserForm.value.foreCloseBilling != false ? 1 : 0,
      //   InsFirstYear: this.addUserForm.value.firstYear != null && this.addUserForm.value.firstYear != '' ? this.addUserForm.value.firstYear : "0",
      //   InsRestYear: this.addUserForm.value.restYear != null && this.addUserForm.value.restYear != '' ? this.addUserForm.value.restYear : "0",
      //   MFAStatus: this.addUserForm.value.mfaStatus,
      // }

      this.selecetdUserData.AspNetUser.ModifiedByUser = this.currentUser.UserName,
        // this.selecetdUserData.AspNetUser.UserId = this.userGuidId,

        this.selecetdUserData.AspNetUser.UserName = this.addUserForm.value.userName;
      this.selecetdUserData.AspNetUser.Password = this.addUserForm.value.confirmPassword;
      this.selecetdUserData.AspNetUser.PhoneNo = this.addUserForm.value.mobileNo;
      this.selecetdUserData.AspNetUser.Email = this.addUserForm.value.email;
      this.selecetdUserData.AspNetUser.SecurityQuestion = this.addUserForm.value.securityQuestion;
      this.selecetdUserData.AspNetUser.SecurityAnswer = this.addUserForm.value.securityAnswer;
      this.selecetdUserData.AspNetUser.DeActivate_User = this.addUserForm.value.deactivateUser;
      this.selecetdUserData.AspNetUser.Locked_User = this.addUserForm.value.lockedUser;
      this.selecetdUserData.AspNetUser.Approval_From = this.addUserForm.value.approvalForm != null && this.addUserForm.value.approvalForm != '' ? Number(this.addUserForm.value.approvalForm) : 0;
      this.selecetdUserData.AspNetUser.Approval_To = this.addUserForm.value.approvalTo != null && this.addUserForm.value.approvalTo != '' ? Number(this.addUserForm.value.approvalTo) : 0;
      this.selecetdUserData.AspNetUser.Region = this.addUserForm.value.region;
      this.selecetdUserData.AspNetUser.DeActivate = this.addUserForm.value.deactivateUser != null && this.addUserForm.value.deactivateUser != false ? 1 : 0;

      this.selecetdUserData.AspNetUserBranch.City = this.addUserForm.value.city ? this.addUserForm.value.city : [];
      this.selecetdUserData.AspNetUserBranch.DeviationRight = this.addUserForm.value.deviationRight;
      this.selecetdUserData.AspNetUserBranch.ForeCloseBill = this.addUserForm.value.foreCloseBilling != null && this.addUserForm.value.foreCloseBilling != false ? 1 : 0;
      this.selecetdUserData.AspNetUserBranch.MgmtConsole = this.addUserForm.value.mgmtConsole != null && this.addUserForm.value.mgmtConsole != false ? 1 : 0;
      this.selecetdUserData.AspNetUserBranch.Int = this.addUserForm.value.interestMarket != null && this.addUserForm.value.interestMarket != '' ? this.addUserForm.value.interestMarket : "0";
      this.selecetdUserData.AspNetUserBranch.FixedInt = this.addUserForm.value.interestFixed != null && this.addUserForm.value.interestFixed != '' ? this.addUserForm.value.interestFixed : "0";
      this.selecetdUserData.AspNetUserBranch.RV = this.addUserForm.value.rv != null && this.addUserForm.value.rv != '' ? this.addUserForm.value.rv : "0";
      this.selecetdUserData.AspNetUserBranch.RMTB = this.addUserForm.value.rmtb != null && this.addUserForm.value.rmtb != '' ? this.addUserForm.value.rmtb : "0";
      this.selecetdUserData.AspNetUserBranch.MFee = this.addUserForm.value.mfee != null && this.addUserForm.value.mfee != '' ? this.addUserForm.value.mfee : "0";
      this.selecetdUserData.AspNetUserBranch.AccAppFrom = this.addUserForm.value.accAppFrom != null && this.addUserForm.value.accAppFrom != '' ? Number(this.addUserForm.value.accAppFrom) : 0;
      this.selecetdUserData.AspNetUserBranch.AccAppTo = this.addUserForm.value.accAppTo != null && this.addUserForm.value.accAppTo != '' ? Number(this.addUserForm.value.accAppTo) : 0;
      this.selecetdUserData.AspNetUserBranch.ExceptionalRights = this.addUserForm.value.exRights != null && this.addUserForm.value.exRights != false ? 1 : 0;
      this.selecetdUserData.AspNetUserBranch.InsFirstYear = this.addUserForm.value.firstYear != null && this.addUserForm.value.firstYear != '' ? this.addUserForm.value.firstYear : "0";
      this.selecetdUserData.AspNetUserBranch.InsRestYear = this.addUserForm.value.restYear != null && this.addUserForm.value.restYear != '' ? this.addUserForm.value.restYear : "0";

      this.selecetdUserData.AspNetUserMembership.MFAStatus = this.addUserForm.value.mfaStatus;
      this.selecetdUserData.AspNetUserMembership.Email = this.addUserForm.value.email;
      this.selecetdUserData.AspNetUserMembership.LoweredEmail = this.addUserForm.value.email;

      // let formData: FormData = new FormData();
      //formData.append("RequestData", JSON.stringify(obj));
      this.spinner.show();
      this.clientService.UpdateUser(this.selecetdUserData).subscribe((res: any) => {
        if (!res.HasErrors) {
          this.toaster.success('User Updated Successfully', undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
          this.submitted = false;
          this.addUserForm.reset(defaultValues);
          this.router.navigate(["/users-list"], {
            state: {
              level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
            }
          });
        }
        else {
          this.toaster.error(res?.Errors[0]?.Message, undefined, {
            positionClass: 'toast-top-center'
          });
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

  toNumber(value: string) {
    return Number(value);
  }

  removeValidators() {
    this.addUserForm.get('password')?.setErrors(null);
    this.addUserForm.get('password')?.setValue(null);
    this.addUserForm.get('password')?.setValidators(null);
    this.addUserForm.get('password')?.updateValueAndValidity();
    this.addUserForm.get('confirmPassword')?.setErrors(null);
    this.addUserForm.get('confirmPassword')?.setValue(null);
    this.addUserForm.get('confirmPassword')?.setValidators(null);
    this.addUserForm.get('confirmPassword')?.updateValueAndValidity();
    // this.addUserForm.get('securityAnswer')?.setValue(null);
    // this.addUserForm.get('securityAnswer')?.setValidators(null);
    // this.addUserForm.get('securityAnswer')?.updateValueAndValidity();
    // this.addUserForm.get('securityQuestion')?.setValue(null);
    // this.addUserForm.get('securityQuestion')?.setValidators(null);
    // this.addUserForm.get('securityQuestion')?.updateValueAndValidity();
    this.addUserForm.updateValueAndValidity();
  }

  setValidators() {
    this.addUserForm.get('password')?.setValidators([Validators.required, Validators.pattern(Constant.passwordRegExp)]);
    this.addUserForm.get('password')?.updateValueAndValidity();
    this.addUserForm.get('confirmPassword')?.setValidators([Validators.required, Validators.pattern(Constant.passwordRegExp)]);
    this.addUserForm.get('confirmPassword')?.updateValueAndValidity();
    // this.addUserForm.get('securityQuestion')?.setValidators([Validators.required]);
    // this.addUserForm.get('securityQuestion')?.updateValueAndValidity();
    // this.addUserForm.get('securityAnswer')?.setValidators([Validators.required]);
    // this.addUserForm.get('securityAnswer')?.updateValueAndValidity();
    this.addUserForm.updateValueAndValidity();
    this.addUserForm.markAllAsTouched();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.addUserForm.reset(defaultValues);
    this.setValidators();
  }


  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.userGuidId, Name: this.selecetdUserData.AspNetUser.UserName, moduleName: 'add-user' }
    });
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
      data: { mode: status, data: { Id: null, workflowId: this.TransactionId } },
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

let defaultValues = {
  userName: '',
  mobileNo: '',
  password: '',
  confirmPassword: '',
  email: '',
  securityAnswer: '',
  securityQuestion: '',
  region: null,
  city: null,
  foreCloseBilling: false,
  deactivateUser: false,
  lockedUser: false,
  deviationRight: false,
  mgmtConsole: false,
  exRights: false,
  interestMarket: '',
  interestFixed: '',
  rmtb: '',
  mfee: '',
  approvalForm: '',
  approvalTo: '',
  accAppFrom: '',
  accAppTo: '',
  firstYear: '',
  restYear: '',
  rv: '',
  mfaStatus: false
}