import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { LocalStorageServiceService } from 'src/app/shared/Services/local-storage-service.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../../client.service';
import { DatePipe, Location } from '@angular/common';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-state',
  templateUrl: './add-state.component.html',
  styleUrls: ['./add-state.component.scss']
})

export class AddStateComponent {
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

  addstateForm!: FormGroup;
  submitted: boolean = false;
  contractData: any;
  isView: boolean = false;
  editMode: boolean = false;
  regionList: any;
  stateId = 0;
  selectedstateData: any;
  isParentDropdnVisible: boolean = false;
  parentStateList: any;
  oracleVatPercList: any;
  tradeCertVisible: boolean = false;
  TaxPercEfdFromChanged: boolean = false;
  fromDateChanged: boolean = false;
  toDateChanged: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;

  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private clientService: ClientService,
    private toaster: ToastrService,
    private localService: LocalStorageServiceService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    public location: Location,
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private datePipe: DatePipe,
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
      this.stateId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getstateById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getstateById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getstateById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.addstateForm = new FormGroup({
      regionName: new FormControl(null, [Validators.required]),
      stateName: new FormControl('', [Validators.required]),
      stateCode: new FormControl(''),
      lastInvNo: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      linkToParentState: new FormControl(false),
      parentState: new FormControl(null),
      parent: new FormControl(''),
      VATCreditNA: new FormControl(''),
      localSaleTaxNo: new FormControl(''),
      phoneNo: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      address1: new FormControl(''),
      address2: new FormControl(''),
      oldStateCode: new FormControl(''),
      TinNo: new FormControl(''),
      minCarValue: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      maxCarValue: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      oracleCode: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      VATAccNo: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      oracleVATPerc: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      VATApplicable: new FormControl(false),
      CarCreditAvailable: new FormControl(false),
      AccCreditAvailable: new FormControl(false),
      buyingCarPerc: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      buyingAccPerc: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      sellingCarPerc: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      sellingAccPerc: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      VATPercEMI: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      TaxPercEfdFrom: new FormControl(''),
      IsTradeCertificate: new FormControl(false),
      TCertificateNo: new FormControl(''),
      TCertificateValidFrom: new FormControl(''),
      TCertificateValidTo: new FormControl(''),
    });
    this.addstateForm.markAllAsTouched();
    this.addstateForm.get('parent')?.disable();

    this.getAllRegion();
    this.getAllgetParentState();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / State';
      this.breadcrumbService.setBreadcrumbs(['Master / State', breadcrumb]);
    });
  }

  get validators() {
    return this.addstateForm.controls;
  }

  getstateById() {
    let Id = this.stateId;
    this.spinner.show();
    this.clientService.getStateById(Id).subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedstateData = res;

          if (this.isView || this.IsApproverView) {
            this.addstateForm.disable();
          }
          if (this.editMode) { // to set validation of * in update mode
            this.addstateForm.get('lastInvNo')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            // this.addstateForm.get('VATCreditNA')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.addstateForm.get('phoneNo')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            // this.addstateForm.get('TinNo')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.addstateForm.get('oracleCode')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.addstateForm.get('VATAccNo')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
          } else {
            this.addstateForm.get('lastInvNo')?.setValidators([Validators.pattern(Constant.IntNo)]);
            // this.addstateForm.get('VATCreditNA')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.addstateForm.get('phoneNo')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            // this.addstateForm.get('TinNo')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.addstateForm.get('oracleCode')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.addstateForm.get('VATAccNo')?.setValidators([Validators.pattern(Constant.IntNo)]);
          }
          // To apply the new validators, you need to update the form control's value
          this.addstateForm.updateValueAndValidity();

          this.addstateForm.patchValue({

            regionName: this.selectedstateData.RegionId,
            stateName: this.selectedstateData.StateName,
            stateCode: this.selectedstateData.GstStateCode,
            lastInvNo: this.selectedstateData.LastInvNo,
            linkToParentState: this.selectedstateData.ParentStateId != null && this.selectedstateData.ParentStateId != 0 && this.selectedstateData.ParentStateId ? true : false,
            parentState: this.selectedstateData.ParentStateId,
            VATCreditNA: this.selectedstateData.LeaseTax,
            localSaleTaxNo: this.selectedstateData.LSTNumber,
            phoneNo: this.selectedstateData.PhoneNo,
            address1: this.selectedstateData.Address,
            address2: this.selectedstateData.Address1,
            oldStateCode: this.selectedstateData.OldStateCode,
            TinNo: this.selectedstateData.TinNo,
            minCarValue: this.selectedstateData.MinCarValue,
            maxCarValue: this.selectedstateData.MaxCarValue,
            oracleCode: this.selectedstateData.OracleStateCode,
            VATAccNo: this.selectedstateData.VatAccountNo,
            oracleVATPerc: this.selectedstateData.OraVatPer,
            VATApplicable: this.selectedstateData.VatApp,
            CarCreditAvailable: this.selectedstateData.VatCreditCar,
            AccCreditAvailable: this.selectedstateData.VatCreditAcc,
            buyingCarPerc: this.selectedstateData.VatBuyCar,
            buyingAccPerc: this.selectedstateData.VatBuyAcc,
            sellingCarPerc: this.selectedstateData.VatSellCar,
            sellingAccPerc: this.selectedstateData.VatSellAcc,
            VATPercEMI: this.selectedstateData.VatPerFin,
            TaxPercEfdFrom: this.selectedstateData.VatPerEffectedForm,
            IsTradeCertificate: this.selectedstateData.TradeCertificateApp,
            TCertificateNo: this.selectedstateData.TradeCertificate,
            TCertificateValidFrom: this.selectedstateData.ValidFrom,
            TCertificateValidTo: this.selectedstateData.ValidTo,
          });

          // if (this.selectedstateData.ParentStateId != null && this.selectedstateData.ParentStateId != 0 && this.selectedstateData.ParentStateId) {
          //   this.isParentDropdnVisible = true;
          // }

          this.isParentDropdnVisible = true;

          if (this.selectedstateData.TradeCertificateApp != null && this.selectedstateData.TradeCertificateApp) {
            this.tradeCertVisible = true;
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

  getAllgetParentState() {
    this.spinner.show();
    this.clientService.getParentState().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.parentStateList = res.Rows;
          this.spinner.hide();
          let stateData = {
            Id: 0,
            StateName: "None",
            RegionName: "None",
            VatAccountNo: "",
            OldStateCode: "",
            LastInvNo: 0,
            OraVatPer: 0,
            vatPerFin: 0,
            GstNo: "",
            GstRegDate: ""
          }
          this.parentStateList.unshift(stateData);
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

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  addstate() {
    console.log(this.addstateForm);
    this.submitted = true;
    if (this.addstateForm.status == 'VALID') {
      const data = {
        CreatedById: this.currentUser.UserId,

        RegionId: this.addstateForm.value.regionName,
        StateName: this.addstateForm.value.stateName,
        GstStateCode: this.addstateForm.value.stateCode,
        LastInvNo: this.addstateForm.value.lastInvNo,
        ParentStateId: this.addstateForm.value.parentState,
        LSTNumber: this.addstateForm.value.localSaleTaxNo,
        PhoneNo: this.addstateForm.value.phoneNo,
        Address: this.addstateForm.value.address1,
        Address1: this.addstateForm.value.address2,
        OldStateCode: this.addstateForm.value.oldStateCode,
        TinNo: this.addstateForm.value.TinNo,
        MinCarValue: this.addstateForm.value.minCarValue,
        MaxCarValue: this.addstateForm.value.maxCarValue,
        OracleStateCode: this.addstateForm.value.oracleCode,
        VatAccountNo: this.addstateForm.value.VATAccNo,
        VatApp: this.addstateForm.value.VATApplicable,
        VatCreditCar: this.addstateForm.value.CarCreditAvailable,
        VatCreditAcc: this.addstateForm.value.AccCreditAvailable,
        VatBuyCar: this.addstateForm.value.buyingCarPerc,
        VatBuyAcc: this.addstateForm.value.buyingAccPerc,
        VatSellCar: this.addstateForm.value.sellingCarPerc,
        VatSellAcc: this.addstateForm.value.sellingAccPerc,
        TradeCertificateApp: this.addstateForm.value.IsTradeCertificate != null ? this.addstateForm.value.IsTradeCertificate : false,
        TradeCertificate: this.addstateForm.value.TCertificateNo,
        ValidFrom: this.addstateForm.value.TCertificateValidFrom ? this.formatDateInISO(this.addstateForm.value.TCertificateValidFrom) : null,
        ValidTo: this.addstateForm.value.TCertificateValidTo ? this.formatDateInISO(this.addstateForm.value.TCertificateValidTo) : null,
        LeaseTax: this.addstateForm.value.VATCreditNA,
        VatPerFin: this.addstateForm.value.VATPercEMI,
        VatPerEffectedForm: this.addstateForm.value.TaxPercEfdFrom ? this.formatDateInISO(this.addstateForm.value.TaxPercEfdFrom) : null,
        OraVatPer: this.addstateForm.value.oracleVATPerc,
        Dormant: false,

        // TIN: "11",
        // SaleTaxFp: 210,
        // StFlatSame: 40.0,
        // StFlatOthers: 760.0,
        // StPerSame: 10.0,
        // StPerOthers: 50.0,
        // ServiceTax: 50.0,
        // GstNo: "sgrheg",
        // GstRegDate: "0001-01-01T00:00:00",
        // UnionTerritory: false,
        // GSTPartner: 10,
        // POS: 10,
        // PinCode: "453533",
        // GSTCity: "Pune",
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addState(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("State details added successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/master-states"], {
              state: {
                level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
              }
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

  updatestate() {
    this.submitted = true;
    console.log(this.addstateForm);

    if (this.addstateForm.status == 'VALID') {
      // const data = {
      //   StateID: this.stateId,
      //   ModifiedById: this.currentUser.UserId,

      //   RegionId: this.addstateForm.value.regionName,
      //   StateName: this.addstateForm.value.stateName,
      //   GstStateCode: this.addstateForm.value.stateCode,
      //   LastInvNo: this.addstateForm.value.lastInvNo,
      //   ParentStateId: this.addstateForm.value.parentState,
      //   LSTNumber: this.addstateForm.value.localSaleTaxNo,
      //   PhoneNo: this.addstateForm.value.phoneNo,
      //   Address: this.addstateForm.value.address1,
      //   Address1: this.addstateForm.value.address2,
      //   OldStateCode: this.addstateForm.value.oldStateCode,
      //   TinNo: this.addstateForm.value.TinNo,
      //   MinCarValue: this.addstateForm.value.minCarValue,
      //   MaxCarValue: this.addstateForm.value.maxCarValue,
      //   OracleStateCode: this.addstateForm.value.oracleCode,
      //   VatAccountNo: this.addstateForm.value.VATAccNo,
      //   VatApp: this.addstateForm.value.VATApplicable,
      //   VatCreditCar: this.addstateForm.value.CarCreditAvailable,
      //   VatCreditAcc: this.addstateForm.value.AccCreditAvailable,
      //   VatBuyCar: this.addstateForm.value.buyingCarPerc,
      //   VatBuyAcc: this.addstateForm.value.buyingAccPerc,
      //   VatSellCar: this.addstateForm.value.sellingCarPerc,
      //   VatSellAcc: this.addstateForm.value.sellingAccPerc,
      //   TradeCertificateApp: this.addstateForm.value.IsTradeCertificate != null ? this.addstateForm.value.IsTradeCertificate : false,
      //   TradeCertificate: this.addstateForm.value.TCertificateNo,
      //   ValidFrom: this.addstateForm.value.TCertificateValidFrom ? this.fromDateChanged ? this.formatDateInISO(this.addstateForm.value.TCertificateValidFrom) : this.formatDateInISO(this.addstateForm.value.TCertificateValidFrom) : null,
      //   ValidTo: this.addstateForm.value.TCertificateValidTo ? this.toDateChanged ? this.formatDateInISO(this.addstateForm.value.TCertificateValidTo) : this.formatDateInISO(this.addstateForm.value.TCertificateValidTo) : null,
      //   LeaseTax: this.addstateForm.value.VATCreditNA,
      //   VatPerFin: this.addstateForm.value.VATPercEMI,
      //   VatPerEffectedForm: this.addstateForm.value.TaxPercEfdFrom ? this.TaxPercEfdFromChanged ? this.formatDateInISO(this.addstateForm.value.TaxPercEfdFrom) : this.formatDateInISO(this.addstateForm.value.TaxPercEfdFrom) : null,
      //   OraVatPer: this.addstateForm.value.oracleVATPerc,
      //   Dormant: false,

      //   // "TIN": "de33",
      //   // "SaleTaxFp": 110,
      //   // "StFlatSame": 10.0,
      //   // "StFlatOthers": 230.0,
      //   // "StPerSame": 10.0,
      //   // "StPerOthers": 50.0,
      //   // "ServiceTax": 50.0,
      //   // "GstNo": "sgrheg",
      //   // "GstRegDate": "0001-01-01T00:00:00",
      //   // "UnionTerritory": false,
      //   // "GSTPartner": 10,
      //   // "POS": 10,
      //   // "PinCode": "gsrgrer",
      //   // "GSTCity": "noida",
      // }

      this.selectedstateData.ModifiedById = this.currentUser.UserId;

      this.selectedstateData.RegionId = this.addstateForm.value.regionName;
      this.selectedstateData.StateName = this.addstateForm.value.stateName;
      this.selectedstateData.GstStateCode = this.addstateForm.value.stateCode;
      this.selectedstateData.LastInvNo = this.addstateForm.value.lastInvNo;
      this.selectedstateData.ParentStateId = this.addstateForm.value.parentState;
      this.selectedstateData.LSTNumber = this.addstateForm.value.localSaleTaxNo;
      this.selectedstateData.PhoneNo = this.addstateForm.value.phoneNo;
      this.selectedstateData.Address = this.addstateForm.value.address1;
      this.selectedstateData.Address1 = this.addstateForm.value.address2;
      this.selectedstateData.OldStateCode = this.addstateForm.value.oldStateCode;
      this.selectedstateData.TinNo = this.addstateForm.value.TinNo;
      this.selectedstateData.MinCarValue = this.addstateForm.value.minCarValue;
      this.selectedstateData.MaxCarValue = this.addstateForm.value.maxCarValue;
      this.selectedstateData.OracleStateCode = this.addstateForm.value.oracleCode;
      this.selectedstateData.VatAccountNo = this.addstateForm.value.VATAccNo;
      this.selectedstateData.VatApp = this.addstateForm.value.VATApplicable;
      this.selectedstateData.VatCreditCar = this.addstateForm.value.CarCreditAvailable;
      this.selectedstateData.VatCreditAcc = this.addstateForm.value.AccCreditAvailable;
      this.selectedstateData.VatBuyCar = this.addstateForm.value.buyingCarPerc;
      this.selectedstateData.VatBuyAcc = this.addstateForm.value.buyingAccPerc;
      this.selectedstateData.VatSellCar = this.addstateForm.value.sellingCarPerc;
      this.selectedstateData.VatSellAcc = this.addstateForm.value.sellingAccPerc;
      this.selectedstateData.TradeCertificateApp = this.addstateForm.value.IsTradeCertificate != null ? this.addstateForm.value.IsTradeCertificate : false;
      this.selectedstateData.TradeCertificate = this.addstateForm.value.TCertificateNo;
      this.selectedstateData.ValidFrom = this.addstateForm.value.TCertificateValidFrom ? this.fromDateChanged ? this.formatDateInISO(this.addstateForm.value.TCertificateValidFrom) : this.formatDateInISO(this.addstateForm.value.TCertificateValidFrom) : null;
      this.selectedstateData.ValidTo = this.addstateForm.value.TCertificateValidTo ? this.toDateChanged ? this.formatDateInISO(this.addstateForm.value.TCertificateValidTo) : this.formatDateInISO(this.addstateForm.value.TCertificateValidTo) : null;
      this.selectedstateData.LeaseTax = this.addstateForm.value.VATCreditNA;
      this.selectedstateData.VatPerFin = this.addstateForm.value.VATPercEMI;
      this.selectedstateData.VatPerEffectedForm = this.addstateForm.value.TaxPercEfdFrom ? this.TaxPercEfdFromChanged ? this.formatDateInISO(this.addstateForm.value.TaxPercEfdFrom) : this.formatDateInISO(this.addstateForm.value.TaxPercEfdFrom) : null;
      this.selectedstateData.OraVatPer = this.addstateForm.value.oracleVATPerc;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedstateData));

      this.spinner.show();
      this.clientService.updateState(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("State details updated successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/master-states"], {
              state: {
                level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
              }
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
      })
    }
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.isView = false;
    this.IsApproverView = false;
    this.addstateForm.reset();
    this.addstateForm.setValue(defaultValues);
    this.addstateForm.markAllAsTouched();
    this.TaxPercEfdFromChanged = false;
    this.fromDateChanged = false;
    this.toDateChanged = false;
  }

  changeIsParent(checked: boolean) {
    if (checked) {
      // this.addstateForm.get('parentState')?.setValue(null);
      this.isParentDropdnVisible = true;
    }
  }

  TradeToggleChange(checked: boolean) {
    if (checked) {
      this.tradeCertVisible = true;
    } else {
      this.tradeCertVisible = false;
    }
  }

  parentChange(event: any) {
    if (event.Id == 0 || event.StateName == 'None') {
      this.isParentDropdnVisible = false;
      this.addstateForm.get('linkToParentState')?.setValue(false);
      this.addstateForm.get('parentState')?.setValue(null);
    }
  }

  onDateChange(event: any, field: any) {
    if (field == 'TaxPercEfdFrom') {
      this.TaxPercEfdFromChanged = true;
    }
    else if (field == 'TCertificateValidFrom') {
      this.fromDateChanged = true;
    } else if (field == 'TCertificateValidTo') {
      this.toDateChanged = true;
    }
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.stateId, Name: this.selectedstateData.StateName, moduleName: 'add-state' }
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
  regionName: null,
  stateName: '',
  stateCode: '',
  lastInvNo: '',
  linkToParentState: false,
  parentState: null,
  parent: '',
  VATCreditNA: '',
  localSaleTaxNo: '',
  phoneNo: '',
  address1: '',
  address2: '',
  oldStateCode: '',
  TinNo: '',
  minCarValue: '',
  maxCarValue: '',
  oracleCode: '',
  VATAccNo: '',
  oracleVATPerc: '',
  VATApplicable: false,
  CarCreditAvailable: false,
  AccCreditAvailable: false,
  buyingCarPerc: '',
  buyingAccPerc: '',
  sellingCarPerc: '',
  sellingAccPerc: '',
  VATPercEMI: '',
  TaxPercEfdFrom: '',
  IsTradeCertificate: false,
  TCertificateNo: '',
  TCertificateValidFrom: '',
  TCertificateValidTo: '',
}