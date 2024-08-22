import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { MatDialog } from '@angular/material/dialog';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-create-users-and-drivers',
  templateUrl: './create-users-and-drivers.component.html',
  styleUrls: ['./create-users-and-drivers.component.scss']
})

export class CreateUsersAndDriversComponent {
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

  addDriverUserForm!: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  submitted: boolean = false;
  cityList: any;
  editMode: boolean = false;
  driverUserId: number = 0;
  driverUserList: any;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  selecetdDriverUserData: any;
  clientList: any;
  minDate: Date = new Date();
  currentDate: Date = new Date();
  addressTypeList = [{ addressType: "Client Address" }, { addressType: "User Specific" }];
  selectedClient: any;
  isClientAddress: boolean = false;
  isUserAddress: boolean = false;
  filterBtnClicked: boolean = false;
  dobDateChanged: boolean = false;
  withEmpSinceChanged: boolean = false;
  expiryDateChanged: boolean = false;

  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Group Name' },
    { filterName: 'City' },
    { filterName: 'Created By' },
  ];

  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  selectedRowIndex: any;
  IsSearch: boolean = false;

  constructor(
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    protected commonService: CommonService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
    private router: Router,
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
      this.driverUserId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.driverUserById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.driverUserById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.driverUserById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.addDriverUserForm = new FormGroup({
      prefixName: new FormControl('', [Validators.required,]),
      clientName: new FormControl(null, [Validators.required]),
      firstName: new FormControl('', [Validators.required, Validators.pattern(Constant.textInput)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern(Constant.textInput)]),
      mobile1: new FormControl('', [Validators.required, Validators.pattern(Constant.phoneRegExp)]),
      email1: new FormControl('', [Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]),

      employeeId: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      // addressType: new FormControl(null),
      clientAddrType: new FormControl(false),
      userAddrType: new FormControl(false),
      address1: new FormControl(''),
      city: new FormControl(null),
      telephone: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      faxNumber: new FormControl('', [Validators.pattern(Constant.faxNumber)]),
      email2: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      poNo: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      address2: new FormControl(''),
      address3: new FormControl(''),
      pinCode: new FormControl('', [Validators.pattern(Constant.pinCode)]),
      email3: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      department: new FormControl(''),
      designation: new FormControl(''),
      license: new FormControl(''),
      authority: new FormControl(''),
      expiry: new FormControl(''),
      withEmplrSince: new FormControl(''),
      dob: new FormControl(''),
      tfsClientName: new FormControl(''),

      rAddr1: new FormControl(''),
      rAddr2: new FormControl(''),
      rAddr3: new FormControl(''),
      rCity: new FormControl(null),
      rPhone: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      nameList: new FormControl(''),

    });

    this.getCity();
    this.GetAllClients();
    this.addDriverUserForm.markAllAsTouched();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Clients / Account Details';
      this.breadcrumbService.setBreadcrumbs(['Master / Clients / Account Details', breadcrumb]);
    });
  }

  get validators() {
    return this.addDriverUserForm.controls;
  }

  driverUserById() {
    this.spinner.show();
    this.clientService.getDriverUserById(this.driverUserId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selecetdDriverUserData = res;
          if (this.isView || this.IsApproverView) {
            this.addDriverUserForm.disable();
          }
          if (this.editMode) {
            this.addDriverUserForm.get('firstName')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
            this.addDriverUserForm.get('lastName')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
            this.addDriverUserForm.get('mobile1')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addDriverUserForm.get('email1')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addDriverUserForm.get('telephone')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addDriverUserForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addDriverUserForm.get('email3')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addDriverUserForm.get('rPhone')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
          } else {
            this.addDriverUserForm.get('firstName')?.setValidators([Validators.required, Validators.pattern(Constant.textInput)]);
            this.addDriverUserForm.get('lastName')?.setValidators([Validators.required, Validators.pattern(Constant.textInput)]);
            this.addDriverUserForm.get('mobile1')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
            this.addDriverUserForm.get('email1')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addDriverUserForm.get('telephone')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.addDriverUserForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addDriverUserForm.get('email3')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addDriverUserForm.get('rPhone')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
          }
          // To apply the new validators, you need to update the form control's value
          this.addDriverUserForm.updateValueAndValidity();

          this.addDriverUserForm.patchValue({
            prefixName: this.selecetdDriverUserData.PreFix,
            clientName: this.selecetdDriverUserData.ClientId,
            firstName: this.selecetdDriverUserData.FName,
            lastName: this.selecetdDriverUserData.LName,
            mobile1: this.selecetdDriverUserData.Mobile,
            email1: this.selecetdDriverUserData.Email,

            employeeId: this.selecetdDriverUserData.EmployeeId,
            clientAddrType: null, //
            userAddrType: null, //
            address1: this.selecetdDriverUserData.Address1,
            city: this.selecetdDriverUserData.CityId,
            telephone: this.selecetdDriverUserData.Phone,
            faxNumber: this.selecetdDriverUserData.Fax,
            email2: this.selecetdDriverUserData.Email1,
            poNo: this.selecetdDriverUserData.PONumber,
            address2: this.selecetdDriverUserData.Address2,
            address3: this.selecetdDriverUserData.Address3,
            pinCode: this.selecetdDriverUserData.Pin,
            email3: this.selecetdDriverUserData.Email2,
            department: this.selecetdDriverUserData.DepartmentId,
            designation: this.selecetdDriverUserData.Designation,
            license: this.selecetdDriverUserData.LicenseNo,
            authority: this.selecetdDriverUserData.IssuAuthority,
            expiry: this.selecetdDriverUserData.Expiry,
            withEmplrSince: this.selecetdDriverUserData.StartServiceDate,
            dob: this.selecetdDriverUserData.DOB,
            tfsClientName: this.selecetdDriverUserData.ChildName,

            rAddr1: this.selecetdDriverUserData.RAddress1,
            rAddr2: this.selecetdDriverUserData.RAddress2,
            rAddr3: this.selecetdDriverUserData.RAddress3,
            rCity: this.selecetdDriverUserData.RCityId,
            rPhone: this.selecetdDriverUserData.RContact,
            nameList: null, //
          });
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

  GetAllClients() {
    const data =
    {
      Page:
      {
        PageNumber: 0,
        PageSize: 0,
        Filter: {
          ClientName: "",
          CityName: "",
          PANNo: "",
          PinCode: "",
          CreatedBy: "",
          UserName: "",
          // Id: 1, // this.currentUser.RoleId,
          // RoleName: "BDM", // this.currentUser.UserRole,
          // DepartmentId: 1 // this.currentUser.DepartmentId
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllClient(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.clientList = res.Records;
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

  selectClient(event: any) {
    this.isClientAddress = false;
    this.selectedClient = event;

    this.addDriverUserForm.get('addressType')?.reset();
    this.addDriverUserForm.get('address1')?.reset();
    this.addDriverUserForm.get('city')?.reset();
    this.addDriverUserForm.get('address2')?.reset();
    this.addDriverUserForm.get('address3')?.reset();
    this.addDriverUserForm.get('pinCode')?.reset();
  }

  adrressToggle(event: any, type: any) {
    if (event.checked && type == 'Client Address') {
      this.isClientAddress = true;
      this.isUserAddress = false;

      this.addDriverUserForm.get('userAddrType')?.setValue(false);
      if (this.selectedClient) {
        this.addDriverUserForm.get('address1')?.setValue(this.selectedClient.AccountAddress);
        this.addDriverUserForm.get('city')?.setValue(this.selectedClient.CityId);
        this.addDriverUserForm.get('address2')?.setValue(this.selectedClient.Address2);
        this.addDriverUserForm.get('address3')?.setValue(this.selectedClient.Address3);
        this.addDriverUserForm.get('pinCode')?.setValue(this.selectedClient.Pin);
      }
    }
    else if (event.checked && type == 'User Specific') {
      this.isUserAddress = true;
      this.isClientAddress = false;

      this.addDriverUserForm.get('clientAddrType')?.setValue(false);
      this.addDriverUserForm.get('address1')?.setValue('');
      this.addDriverUserForm.get('city')?.setValue(null);
      this.addDriverUserForm.get('address2')?.setValue('');
      this.addDriverUserForm.get('address3')?.setValue('');
      this.addDriverUserForm.get('pinCode')?.setValue('');
    }
    else if (!event.checked) {
      this.isUserAddress = false;
      this.isClientAddress = false;

      this.addDriverUserForm.get('address1')?.reset();
      this.addDriverUserForm.get('city')?.reset();
      this.addDriverUserForm.get('address2')?.reset();
      this.addDriverUserForm.get('address3')?.reset();
      this.addDriverUserForm.get('pinCode')?.reset();
    }
  }

  cancelClick() {
    this.editMode = false;
    this.selectedRowIndex = null;
    this.addDriverUserForm.reset(defaultValues);
    this.submitted = false;
    this.isClientAddress = false;
    this.addDriverUserForm.markAllAsTouched();
  }

  addDriverUser() {
    this.submitted = true;
    console.log(this.addDriverUserForm);
    if (this.addDriverUserForm.status == 'VALID') {
      const data =
      {
        CreatedById: this.currentUser.UserId,

        PreFix: this.addDriverUserForm.value.prefixName,
        ClientId: this.addDriverUserForm.value.clientName,
        FName: this.addDriverUserForm.value.firstName,
        LName: this.addDriverUserForm.value.lastName,
        Mobile: this.addDriverUserForm.value.mobile1,
        Email: this.addDriverUserForm.value.email1,
        EmployeeId: this.addDriverUserForm.value.employeeId,
        // addressType: this.addDriverUserForm.value.addressType,
        Address1: this.addDriverUserForm.value.address1,
        CityId: this.addDriverUserForm.value.city,
        Phone: this.addDriverUserForm.value.telephone,
        Contact: '',
        Fax: this.addDriverUserForm.value.faxNumber,
        Email1: this.addDriverUserForm.value.email2,
        PONumber: this.addDriverUserForm.value.poNo,
        Dormant: false,
        Address2: this.addDriverUserForm.value.address2,
        Address3: this.addDriverUserForm.value.address3,
        Address4: '',
        Pin: this.addDriverUserForm.value.pinCode,
        Email2: this.addDriverUserForm.value.email3,
        DepartmentId: this.addDriverUserForm.value.department,
        Designation: this.addDriverUserForm.value.designation,
        LicenseNo: this.addDriverUserForm.value.license,
        IssuAuthority: this.addDriverUserForm.value.authority,
        Expiry: this.addDriverUserForm.value.expiry != null ? this.formatDateInISO(this.addDriverUserForm.value.expiry) : null,
        // withEmplrSince: '',
        DOB: this.addDriverUserForm.value.dob != null ? this.formatDateInISO(this.addDriverUserForm.value.dob) : null,
        ChildName: this.addDriverUserForm.value.tfsClientName,

        RAddress1: this.addDriverUserForm.value.rAddr1,
        RAddress2: this.addDriverUserForm.value.rAddr2,
        RAddress3: this.addDriverUserForm.value.rAddr3,
        RAddress4: '',
        RCityId: this.addDriverUserForm.value.rCity,
        RContact: this.addDriverUserForm.value.rPhone,

        StartServiceDate: this.addDriverUserForm.value.withEmplrSince != null ? this.formatDateInISO(this.addDriverUserForm.value.withEmplrSince) : null,
        LicenseType: '',
        ClientOfficeId: null,
        IsUserAddress: 0,
        OldUserCode: '',
        OldClientCode: '',
        OldcityCode: '',
        OldRcityCode: '',
        OldClientOffice: '',
        AltContactNo: '',
        Flag: '',
        IPAddress: '',
        Gender: 0,
        VerifiedData: '',
        IsFromClientDataVerification: '',
        PortalId: 0,


      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addDriverAndUser(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.router.navigate(["/account-details"], {
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

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }


  updateDriverUser() {
    this.submitted = true;
    console.log(this.addDriverUserForm);
    if (this.addDriverUserForm.status == 'VALID') {
      // const data =
      // {
      //   ModifiedById: this.currentUser.UserId,

      //   Id: this.driverUserId,
      //   PreFix: this.addDriverUserForm.value.prefixName,
      //   ClientId: this.addDriverUserForm.value.clientName,
      //   FName: this.addDriverUserForm.value.firstName,
      //   LName: this.addDriverUserForm.value.lastName,
      //   Mobile: this.addDriverUserForm.value.mobile1,
      //   Email: this.addDriverUserForm.value.email1,
      //   EmployeeId: this.addDriverUserForm.value.employeeId,
      //   // addressType: this.addDriverUserForm.value.addressType,
      //   Address1: this.addDriverUserForm.value.address1,
      //   CityId: this.addDriverUserForm.value.city,
      //   Phone: this.addDriverUserForm.value.telephone,
      //   Contact: '',
      //   Fax: this.addDriverUserForm.value.faxNumber,
      //   Email1: this.addDriverUserForm.value.email2,
      //   PONumber: this.addDriverUserForm.value.poNo,
      //   Dormant: false,
      //   Address2: this.addDriverUserForm.value.address2,
      //   Address3: this.addDriverUserForm.value.address3,
      //   Address4: '',
      //   Pin: this.addDriverUserForm.value.pinCode,
      //   Email2: this.addDriverUserForm.value.email3,
      //   DepartmentId: this.addDriverUserForm.value.department,
      //   Designation: this.addDriverUserForm.value.designation,
      //   LicenseNo: this.addDriverUserForm.value.license,
      //   IssuAuthority: this.addDriverUserForm.value.authority,
      //   Expiry: this.addDriverUserForm.value.expiry != null ? this.expiryDateChanged ? this.formatDateInISO(this.addDriverUserForm.value.expiry) : this.formatDateInISO(this.addDriverUserForm.value.expiry) : null,
      //   // withEmplrSince: '',
      //   DOB: this.addDriverUserForm.value.dob != null ? this.dobDateChanged ? this.formatDateInISO(this.addDriverUserForm.value.dob) : this.formatDateInISO(this.addDriverUserForm.value.dob) : null,
      //   ChildName: this.addDriverUserForm.value.tfsClientName,
      //   RAddress1: this.addDriverUserForm.value.rAddr1,
      //   RAddress2: this.addDriverUserForm.value.rAddr2,
      //   RAddress3: this.addDriverUserForm.value.rAddr3,
      //   RAddress4: '',
      //   RCityId: this.addDriverUserForm.value.rCity,
      //   RContact: this.addDriverUserForm.value.rPhone,

      //   StartServiceDate: this.addDriverUserForm.value.withEmplrSince != null ? this.withEmpSinceChanged ? this.formatDateInISO(this.addDriverUserForm.value.withEmplrSince) : this.formatDateInISO(this.addDriverUserForm.value.withEmplrSince) : null,
      //   LicenseType: '',
      //   ClientOfficeId: null,
      //   IsUserAddress: 0,
      //   OldUserCode: '',
      //   OldClientCode: '',
      //   OldcityCode: '',
      //   OldRcityCode: '',
      //   OldClientOffice: '',
      //   AltContactNo: '',
      //   Flag: '',
      //   IPAddress: '',
      //   Gender: 0,
      //   VerifiedData: '',
      //   IsFromClientDataVerification: '',
      //   PortalId: 0,


      // }

      this.selecetdDriverUserData.ModifiedById = this.currentUser.UserId;

      this.selecetdDriverUserData.PreFix = this.addDriverUserForm.value.prefixName;
      this.selecetdDriverUserData.ClientId = this.addDriverUserForm.value.clientName;
      this.selecetdDriverUserData.FName = this.addDriverUserForm.value.firstName;
      this.selecetdDriverUserData.LName = this.addDriverUserForm.value.lastName;
      this.selecetdDriverUserData.Mobile = this.addDriverUserForm.value.mobile1;
      this.selecetdDriverUserData.Email = this.addDriverUserForm.value.email1;
      this.selecetdDriverUserData.EmployeeId = this.addDriverUserForm.value.employeeId;
      this.selecetdDriverUserData.Address1 = this.addDriverUserForm.value.address1;
      this.selecetdDriverUserData.CityId = this.addDriverUserForm.value.city;
      this.selecetdDriverUserData.Phone = this.addDriverUserForm.value.telephone;
      this.selecetdDriverUserData.Fax = this.addDriverUserForm.value.faxNumber;
      this.selecetdDriverUserData.Email1 = this.addDriverUserForm.value.email2;
      this.selecetdDriverUserData.PONumber = this.addDriverUserForm.value.poNo;
      this.selecetdDriverUserData.Address2 = this.addDriverUserForm.value.address2;
      this.selecetdDriverUserData.Address3 = this.addDriverUserForm.value.address3;
      this.selecetdDriverUserData.Pin = this.addDriverUserForm.value.pinCode;
      this.selecetdDriverUserData.Email2 = this.addDriverUserForm.value.email3;
      this.selecetdDriverUserData.DepartmentId = this.addDriverUserForm.value.department;
      this.selecetdDriverUserData.Designation = this.addDriverUserForm.value.designation;
      this.selecetdDriverUserData.LicenseNo = this.addDriverUserForm.value.license;
      this.selecetdDriverUserData.IssuAuthority = this.addDriverUserForm.value.authority;
      this.selecetdDriverUserData.Expiry = this.addDriverUserForm.value.expiry != null ? this.expiryDateChanged ? this.formatDateInISO(this.addDriverUserForm.value.expiry) : this.formatDateInISO(this.addDriverUserForm.value.expiry) : null;
      this.selecetdDriverUserData.DOB = this.addDriverUserForm.value.dob != null ? this.dobDateChanged ? this.formatDateInISO(this.addDriverUserForm.value.dob) : this.formatDateInISO(this.addDriverUserForm.value.dob) : null;
      this.selecetdDriverUserData.ChildName = this.addDriverUserForm.value.tfsClientName;
      this.selecetdDriverUserData.RAddress1 = this.addDriverUserForm.value.rAddr1;
      this.selecetdDriverUserData.RAddress2 = this.addDriverUserForm.value.rAddr2;
      this.selecetdDriverUserData.RAddress3 = this.addDriverUserForm.value.rAddr3;
      this.selecetdDriverUserData.RCityId = this.addDriverUserForm.value.rCity;
      this.selecetdDriverUserData.RContact = this.addDriverUserForm.value.rPhone;
      this.selecetdDriverUserData.StartServiceDate = this.addDriverUserForm.value.withEmplrSince != null ? this.withEmpSinceChanged ? this.formatDateInISO(this.addDriverUserForm.value.withEmplrSince) : this.formatDateInISO(this.addDriverUserForm.value.withEmplrSince) : null;


      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selecetdDriverUserData));

      this.spinner.show();
      this.clientService.updateDriverAndUser(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.router.navigate(["/account-details"], {
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

  onDateChange(event: any, field: any) {
    if (field == 'dob') {
      this.dobDateChanged = true;
    }
    else if (field == 'expiry') {
      this.expiryDateChanged = true;
    }
    else if (field == 'withEmplrSince') {
      this.withEmpSinceChanged = true;
    }
  }

  resetForm() {
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.isClientAddress = false;
    this.selectedClient = null;
    this.addDriverUserForm.reset(defaultValues);
    this.submitted = false;
    this.addDriverUserForm.markAllAsTouched();
    this.dobDateChanged = false;
    this.expiryDateChanged = false;
    this.withEmpSinceChanged = false;
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.driverUserId, Name: this.selecetdDriverUserData.FName, moduleName: 'create-usersAndDrivers' }
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
  prefixName: '',
  clientName: null,
  firstName: '',
  lastName: '',
  mobile1: '',
  email1: '',

  employeeId: '',
  clientAddrType: false,
  userAddrType: false,
  address1: '',
  city: null,
  telephone: '',
  faxNumber: '',
  email2: '',
  poNo: '',
  address2: '',
  address3: '',
  pinCode: '',
  email3: '',
  department: '',
  designation: '',
  license: '',
  authority: '',
  expiry: '',
  withEmplrSince: '',
  dob: '',
  tfsClientName: '',

  rAddr1: '',
  rAddr2: '',
  rAddr3: '',
  rCity: null,
  rPhone: '',
  nameList: '',
}