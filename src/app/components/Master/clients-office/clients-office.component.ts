import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { DatePipe } from '@angular/common';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';
import { MatDialog } from '@angular/material/dialog';

export interface PeriodicElement {
  ClientId: number;
  ClientOfficeCode: number;
  ClientName: string;
  CityName: string;
  PinCode: number;
  ContactPerson: string;
  OracleCustId: number;
  OracleCustSiteId: number;
  Status: string;
  GSTNO: string;
}

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-clients-office',
  templateUrl: './clients-office.component.html',
  styleUrls: ['./clients-office.component.scss']
})
export class ClientsOfficeComponent {
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

  addClientofficeForm!: FormGroup;
  submitted: boolean = false;
  cityList: any;
  clientList: any;
  clientId: number = 0;
  ClientOfficeId: number = 0;
  SEZList = [{ SEZName: 'Yes', SEZValue: true }, { SEZName: 'No', SEZValue: false }];
  BDMList: any;
  currentDate: Date = new Date();
  selectedClientOfficeData: any;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  editMode: boolean = false;
  gstRegDateChanged: boolean = false;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

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
      this.ClientOfficeId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.IsApproverView = false;
        this.editMode = false;
        this.getClientOfficeById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getClientOfficeById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getClientOfficeById();
      }
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }


    this.addClientofficeForm = new FormGroup({
      clientName: new FormControl(null, [Validators.required]),
      officeAddress1: new FormControl('', Validators.required),
      officeAddress2: new FormControl('', Validators.required),
      city: new FormControl(null, [Validators.required]),
      contactPerson: new FormControl('', [Validators.required]),
      TelephoneNo: new FormControl('', [Validators.required, Validators.pattern(Constant.phoneRegExp)]),
      pinCode: new FormControl('', [Validators.required, Validators.pattern(Constant.pinCode)]),
      SEZ: new FormControl(null, Validators.required),
      poNo: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      GSTNumber: new FormControl('', [Validators.pattern(Constant.GSTNumber)]),
      BDM: new FormControl(null),
      billing: new FormControl(false),
      LUT: new FormControl(false),
      HideClientName: new FormControl(false),
      GSTRegistrationDate: new FormControl(''),
      isPermanent: new FormControl(false),
    });

    this.getCity();
    this.GetAllClients();
    this.getRolewiseUsers();
    this.addClientofficeForm.markAllAsTouched();

  }

  get validators() {
    return this.addClientofficeForm.controls;
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Clients / Account Details';
      this.breadcrumbService.setBreadcrumbs(['Master / Clients / Account Details', breadcrumb]);
    });
  }

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  getClientOfficeById() {
    this.spinner.show();
    this.clientService.getClientOfficeById(this.ClientOfficeId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedClientOfficeData = res;
          this.addClientofficeForm.reset(defaultValues);
          if (this.isView || this.IsApproverView) {
            this.addClientofficeForm.disable();
          }
          if (this.editMode) {
            this.addClientofficeForm.get('TelephoneNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addClientofficeForm.get('pinCode')?.setValidators([Validators.required, Validators.pattern(Constant.pinCodeSpChar)]);
            this.addClientofficeForm.get('poNo')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.addClientofficeForm.get('GSTNumber')?.setValidators([Validators.pattern(Constant.GSTNumberSpChar)]);
          } else {
            this.addClientofficeForm.get('TelephoneNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
            this.addClientofficeForm.get('pinCode')?.setValidators([Validators.required, Validators.pattern(Constant.pinCode)]);
            this.addClientofficeForm.get('poNo')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.addClientofficeForm.get('GSTNumber')?.setValidators([Validators.pattern(Constant.GSTNumber)]);
          }
          // To apply the new validators, you need to update the form control's value
          this.addClientofficeForm.updateValueAndValidity();

          this.addClientofficeForm.patchValue({
            clientName: this.selectedClientOfficeData.ClientId,
            officeAddress1: this.selectedClientOfficeData.Address1,
            officeAddress2: this.selectedClientOfficeData.Address2,
            city: this.selectedClientOfficeData.CityId,
            contactPerson: this.selectedClientOfficeData.ConPerson,
            TelephoneNo: this.selectedClientOfficeData.Phone,
            pinCode: this.selectedClientOfficeData.PinCode,
            SEZ: this.selectedClientOfficeData.SEZ,
            poNo: this.selectedClientOfficeData.PONUM,
            GSTNumber: this.selectedClientOfficeData.GstNo,
            BDM: this.selectedClientOfficeData.UserId,
            billing: this.selectedClientOfficeData.IsBilling == 1 ? true : false,
            LUT: this.selectedClientOfficeData.LUT,
            HideClientName: this.selectedClientOfficeData.ClientNameFlag,
            GSTRegistrationDate: new Date(this.selectedClientOfficeData.GstNoRegDate),
            isPermanent: this.selectedClientOfficeData.IsGstNoPermanent,
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
          Contact_P: "",
          PinCode: "",
          CreatedBy: this.currentUser.UserId
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

  getRolewiseUsers() {
    this.spinner.show();
    let data = "BDM";
    this.clientService.getRolewiseUsers(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.BDMList = res.Rows;
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

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.addClientofficeForm.reset(defaultValues);
    this.submitted = false;
    this.ClientOfficeId = data.Id;

    if (this.editMode) {
      this.addClientofficeForm.get('contactPerson')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
      this.addClientofficeForm.get('TelephoneNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
      this.addClientofficeForm.get('GSTNumber')?.setValidators([Validators.pattern(Constant.GSTNumberSpChar)]);

    } else {
      this.addClientofficeForm.get('contactPerson')?.setValidators([Validators.required, Validators.pattern(Constant.textInput)]);
      this.addClientofficeForm.get('TelephoneNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
      this.addClientofficeForm.get('GSTNumber')?.setValidators([Validators.pattern(Constant.GSTNumber)]);
    }
    // To apply the new validators, you need to update the form control's value
    this.addClientofficeForm.updateValueAndValidity();
    this.addClientofficeForm.markAllAsTouched();

    this.addClientofficeForm.get('clientName')?.setValue(data.ClientId);
    this.addClientofficeForm.get('officeAddress')?.setValue(data.Address1);
    this.addClientofficeForm.get('city')?.setValue(data.CityId);
    this.addClientofficeForm.get('contactPerson')?.setValue(data.ConPerson);
    this.addClientofficeForm.get('TelephoneNo')?.setValue(data.Phone);
    this.addClientofficeForm.get('pinCode')?.setValue(data.PinCode);
    this.addClientofficeForm.get('SEZ')?.setValue(data.SEZ);
    this.addClientofficeForm.get('poNo')?.setValue(data.PONUM);
    this.addClientofficeForm.get('GSTNumber')?.setValue(data.GstNo);
    this.addClientofficeForm.get('BDM')?.setValue(data.Bdm);
    this.addClientofficeForm.get('billing')?.setValue(data.IsBilling);
    this.addClientofficeForm.get('LUT')?.setValue(data.LUT);
    this.addClientofficeForm.get('HideClientName')?.setValue(data.ClientNameFlag);
    this.addClientofficeForm.get('GSTRegistrationDate')?.setValue(new Date(data.GstNoRegDate));
    this.addClientofficeForm.get('isPermanent')?.setValue(data.isPermanent);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }
  cancelClick() {
    this.editMode = false;
    this.addClientofficeForm.reset(defaultValues);
    this.submitted = false;
    this.addClientofficeForm.markAllAsTouched();
  }

  addClientOffice() {
    this.submitted = true;
    console.log(this.addClientofficeForm);
    if (this.addClientofficeForm.status == 'VALID') {
      const data =
      {
        CreatedById: this.currentUser.UserId,

        ClientId: this.addClientofficeForm.value.clientName,
        Address1: this.addClientofficeForm.value.officeAddress1,
        Address2: this.addClientofficeForm.value.officeAddress2,
        CityId: this.addClientofficeForm.value.city,
        PinCode: this.addClientofficeForm.value.pinCode,
        Phone: this.addClientofficeForm.value.TelephoneNo,
        ConPerson: this.addClientofficeForm.value.contactPerson,
        UserId: this.addClientofficeForm.value.BDM,
        IsBilling: (this.addClientofficeForm.value.billing == true) ? 1 : 0,
        GstNo: this.addClientofficeForm.value.GSTNumber,
        GstNoRegDate: this.addClientofficeForm.value.GSTRegistrationDate ? this.formatDateInISO(this.addClientofficeForm.value.GSTRegistrationDate) : '',
        IsGstNoPermanent: this.addClientofficeForm.value.isPermanent,
        SEZ: this.addClientofficeForm.value.SEZ,
        LUT: this.addClientofficeForm.value.LUT,
        PONUM: this.addClientofficeForm.value.poNo,
        ClientNameFlag: this.addClientofficeForm.value.HideClientName,

        Dormant: false,
        Address3: "",
        OldClientCode: "",
        OldCityCode: "",
        OldOfficeCode: "",
        VatInvoiceOffice: false,
        TinNo: "",
        R12OracleCustomerId: "",
        R12OracleCustSiteId: "",
        Status: "",
        InStatus: "",
        ErrorRemarks: "",
        SEZLocation: false,
        LUL: false,
        POS: 1,
        DivisionFlag: 1,
        Mailto: "",
        MailCC: "",

      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addClientOffices(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Client office added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
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

  updateClientOffice() {
    this.submitted = true;
    console.log(this.addClientofficeForm);
    if (this.addClientofficeForm.status == 'VALID') {
      // const data =
      // {
      //   ClientId: this.addClientofficeForm.value.clientName,
      //   Address1: this.addClientofficeForm.value.officeAddress1,
      //   Address2: this.addClientofficeForm.value.officeAddress2,
      //   CityId: this.addClientofficeForm.value.city,
      //   PinCode: this.addClientofficeForm.value.pinCode,
      //   Phone: this.addClientofficeForm.value.TelephoneNo,
      //   ConPerson: this.addClientofficeForm.value.contactPerson,
      //   UserId: this.addClientofficeForm.value.BDM,
      //   IsBilling: (this.addClientofficeForm.value.billing == true) ? 1 : 0,
      //   GstNo: this.addClientofficeForm.value.GSTNumber,
      //   GstNoRegDate: this.addClientofficeForm.value.GSTRegistrationDate ? this.gstRegDateChanged ? this.formatDateInISO(this.addClientofficeForm.value.GSTRegistrationDate) : this.formatDateInISO(this.addClientofficeForm.value.GSTRegistrationDate) : '',
      //   IsGstNoPermanent: this.addClientofficeForm.value.isPermanent,
      //   SEZ: this.addClientofficeForm.value.SEZ,
      //   LUT: this.addClientofficeForm.value.LUT,
      //   PONUM: this.addClientofficeForm.value.poNo,
      //   ClientNameFlag: this.addClientofficeForm.value.HideClientName,
      //   ModifiedById: this.currentUser.UserId,
      //   Id: this.ClientOfficeId,

      //   Dormant: false,
      //   Address3: "",
      //   OldClientCode: "",
      //   OldCityCode: "",
      //   OldOfficeCode: "",
      //   VatInvoiceOffice: false,
      //   TinNo: "",
      //   R12OracleCustomerId: "",
      //   R12OracleCustSiteId: "",
      //   Status: "",
      //   InStatus: "",
      //   ErrorRemarks: "",
      //   SEZLocation: false,
      //   LUL: false,
      //   POS: 1,
      //   DivisionFlag: 1,
      //   Mailto: "",
      //   MailCC: "",
      // }

      this.selectedClientOfficeData.ClientId = this.addClientofficeForm.value.clientName;
      this.selectedClientOfficeData.Address1 = this.addClientofficeForm.value.officeAddress1;
      this.selectedClientOfficeData.Address2 = this.addClientofficeForm.value.officeAddress2;
      this.selectedClientOfficeData.CityId = this.addClientofficeForm.value.city;
      this.selectedClientOfficeData.PinCode = this.addClientofficeForm.value.pinCode;
      this.selectedClientOfficeData.Phone = this.addClientofficeForm.value.TelephoneNo;
      this.selectedClientOfficeData.ConPerson = this.addClientofficeForm.value.contactPerson;
      this.selectedClientOfficeData.UserId = this.addClientofficeForm.value.BDM;
      this.selectedClientOfficeData.IsBilling = (this.addClientofficeForm.value.billing == true) ? 1 : 0;
      this.selectedClientOfficeData.GstNo = this.addClientofficeForm.value.GSTNumber;
      this.selectedClientOfficeData.GstNoRegDate = this.addClientofficeForm.value.GSTRegistrationDate ? this.gstRegDateChanged ? this.formatDateInISO(this.addClientofficeForm.value.GSTRegistrationDate) : this.formatDateInISO(this.addClientofficeForm.value.GSTRegistrationDate) : '';
      this.selectedClientOfficeData.IsGstNoPermanent = this.addClientofficeForm.value.isPermanent;
      this.selectedClientOfficeData.SEZ = this.addClientofficeForm.value.SEZ;
      this.selectedClientOfficeData.LUT = this.addClientofficeForm.value.LUT;
      this.selectedClientOfficeData.PONUM = this.addClientofficeForm.value.poNo;
      this.selectedClientOfficeData.ClientNameFlag = this.addClientofficeForm.value.HideClientName;
      this.selectedClientOfficeData.ModifiedById = this.currentUser.UserId;
      this.selectedClientOfficeData.Id = this.ClientOfficeId;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedClientOfficeData));

      this.spinner.show();
      this.clientService.updateClientOffices(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Client office updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
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
    if (field == 'GSTRegistrationDate') {
      this.gstRegDateChanged = true;
    }
  }

  resetForm() {
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.addClientofficeForm.reset(defaultValues);
    this.submitted = false;
    this.addClientofficeForm.markAllAsTouched();
    this.gstRegDateChanged = false;
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.ClientOfficeId, Name: this.selectedClientOfficeData.ClientName, moduleName: 'client-office' }
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
  clientName: null,
  officeAddress1: '',
  officeAddress2: '',
  city: null,
  contactPerson: '',
  TelephoneNo: '',
  pinCode: '',
  SEZ: null,
  poNo: '',
  GSTNumber: '',
  BDM: null,
  billing: false,
  LUT: false,
  HideClientName: false,
  GSTRegistrationDate: '',
  isPermanent: false,
}