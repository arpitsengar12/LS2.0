import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../client.service';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/shared/model/constant';
import { CommonService } from 'src/app/shared/Services/common.service';
import { MatTabGroup } from '@angular/material/tabs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

export interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-detail',
  templateUrl: './add-detail.component.html',
  styleUrls: ['./add-detail.component.scss']
})
export class AddDetailComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  // clientDetailsForm!: FormGroup;
  isSaveClick: boolean = false;
  clientId: 0;
  selecetdClientData: any;
  isView: boolean = false;
  cityList: any;
  regionList: any;
  industryTypeList: any;
  clientList: any;
  partOfGroup: any;
  userdata: any;
  constant: any;
  selectedtab: number = 0;
  versionHistory: any;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  IsApproverView: boolean = false;
  TransactionId: number = 0;

  paymentDueDate = [
    { value: 0 },
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
    { value: 6 },
    { value: 7 },
    { value: 8 },
    { value: 9 },
    { value: 10 },
    { value: 11 },
    { value: 12 },
    { value: 13 },
    { value: 14 },
    { value: 15 },
    { value: 16 },
    { value: 17 },
    { value: 18 },
    { value: 19 },
    { value: 20 },
    { value: 21 },
    { value: 22 },
    { value: 23 },
    { value: 24 },
    { value: 25 },
    { value: 26 },
    { value: 27 },
    { value: 28 },
    { value: 29 },
    { value: 30 },
    { value: 31 },
    { value: 32 },
    { value: 33 },
    { value: 34 },
    { value: 35 },
    { value: 36 },
    { value: 37 },
    { value: 38 },
    { value: 39 },
    { value: 40 },
    { value: 41 },
    { value: 42 },
    { value: 43 },
    { value: 44 },
    { value: 45 },
    { value: 46 },
    { value: 47 },
    { value: 48 },
    { value: 49 },
    { value: 50 },
    { value: 51 },
    { value: 52 },
    { value: 53 },
    { value: 54 },
    { value: 55 },
    { value: 56 },
    { value: 57 },
    { value: 58 },
    { value: 59 },
    { value: 60 },
    { value: 61 },
    { value: 62 },
    { value: 63 },
    { value: 64 },
    { value: 65 },
    { value: 66 },
    { value: 67 },
    { value: 68 },
    { value: 69 },
    { value: 70 },
    { value: 71 },
    { value: 72 },
    { value: 73 },
    { value: 74 },
    { value: 75 },
    { value: 76 },
    { value: 77 },
    { value: 78 },
    { value: 79 },
    { value: 80 },
    { value: 81 },
    { value: 82 },
    { value: 83 },
    { value: 84 },
    { value: 85 },
    { value: 86 },
    { value: 87 },
    { value: 88 },
    { value: 89 },
    { value: 90 },
  ]
  category = [
    { name: "Unlisted-Limited" },
    { name: "Unlisted-Private-Limited" },
    { name: "Null" }
  ];
  japneseList = [
    { id: 1, name: "Yes" },
    { id: 0, name: "No" }
  ];
  turnOverList = [
    { value: "5 to 150 Crs" },
    { value: "150 to 500 Crs" },
    { value: ">=500 Crs" }
  ];
  strengthList = [
    { value: "300 to 1000" },
    { value: "20 to 300" },
    { value: ">=1000" }
  ]
  bdmRoleUserList = [
    { value: "" }
  ]
  oceanList = [
    { id: 1, value: "Red" },
    { id: 2, value: "Blue" }
  ]
  invoicePatternList = [
    { Id: 1, value: "Not Specific" },
    { Id: 2, value: "Location Wise" },
    { Id: 3, value: "Asset Wise" },
    { Id: 4, value: "Bank Wise" }
  ]
  subIndustryList = [
    { value: "Agent" },
    { value: "Agriculture" },
    { value: "IT" },
    { value: "Hospital" },
    { value: "Metal" },
    { value: "Legal" },
  ]
  parentList: any;
  // submitted: boolean = false;
  editMode: boolean = false;

  clientDetailsForm!: FormGroup;
  InvoiceDetailsForm!: FormGroup;
  clientDetailsFormSubmitted: boolean = false;
  InvoiceDetailsFormSubmitted: boolean = false;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private clientService: ClientService,
    private toaster: ToastrService,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
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
      console.log(history.state);

      this.TransactionId = history.state.TransactionId;
      this.IsAuditTrail = history.state.IsAuditTrail;

      this.clientId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getClientById(this.clientId);
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getClientById(this.clientId);
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getClientById(this.clientId);
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);

    this.cityList = [];
    this.industryTypeList = [];
    this.partOfGroup = [];
    this.clientList = [];

    this.constant = Constant;
    this.clientDetailsForm = new FormGroup({
      ClientName: new FormControl('', [Validators.required, Validators.pattern(Constant.textInput)]),
      AccountName: new FormControl('', [Validators.required, Validators.pattern(Constant.textInput)]),
      Email: new FormControl('', [Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]),
      Email2: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      AccountAddress: new FormControl(''),
      Address2: new FormControl(''),
      Address3: new FormControl(''),
      Address2Toggle: new FormControl(false),
      Address3Toggle: new FormControl(false),
      Mobile: new FormControl('', [Validators.required, Validators.pattern(Constant.phoneRegExp)]),
      Mobile2: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      regionControl: new FormControl(null, [Validators.required]),
      officeAddress: new FormControl(''),
      pinCode: new FormControl(''),
      City: new FormControl(null, [Validators.required]),
      IsJapanese: new FormControl(null, [Validators.required]),
      TurnOver: new FormControl(null, [Validators.required]),
      Strength: new FormControl(null, [Validators.required]),
      ParentId: new FormControl(null),
      ContactPerson: new FormControl(''),
      ContactPerson2: new FormControl(''),
      Description: new FormControl(''),
      Designation: new FormControl(''),
      PartOfGroup: new FormControl(null),
      IndustryType: new FormControl(null, [Validators.required]),
      SubIndustry: new FormControl(null, [Validators.required]),
      BdmRm: new FormControl(null),
      Category: new FormControl(null),
      Ocean: new FormControl(null),
      OracleClient: new FormControl(''),
      CoordinatorEmail: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      clientPONo: new FormControl(false),
      printBreakUpRentalInvoice: new FormControl(false),
      SEZ: new FormControl(false),
      N2NClient: new FormControl(false),
      HandlingCharges: new FormControl(false),
      SuspendedFMS: new FormControl(false),
      AutoMobileass: new FormControl(false),
      RelatedParty: new FormControl(false),
      NACH: new FormControl(false),
      PanNo: new FormControl('', [Validators.pattern(Constant.panNumber)]),
      // TanNo: new FormControl('', [Validators.pattern(Constant.tanNumber)]),
      ExerciseNo: new FormControl(''),
      TIN: new FormControl(''),
      ServiceTaxNO: new FormControl(''),
      CST: new FormControl(''),
      PaymentDueDate: new FormControl(''),
      PaymentAfter: new FormControl(''),
      PaymentData: new FormControl(''),
    });
    this.InvoiceDetailsForm = new FormGroup({
      InvoicePattern: new FormControl(null),
      AnnBillAddress: new FormControl(false),
      EmployeeID: new FormControl(false),
      SbuUnit: new FormControl(false),
      InvoiceDate: new FormControl(false),
      PoNo: new FormControl(false),
      ActivationDate: new FormControl(false),
      TinNO: new FormControl(false),
      Disclaimer: new FormControl(false),

    })
    // this.clientDetailsForm.markAllAsTouched();
    this.clientDetailsForm.markAllAsTouched();
    this.InvoiceDetailsForm.markAllAsTouched();
    this.getAllData();
    this.getRolewiseUsers();

  }

  ngOnInit(): void {
    this.getAllIndustryType();

    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Clients';
      this.breadcrumbService.setBreadcrumbs(['Master / Clients', breadcrumb]);
    });
  }

  get clientDetailsFormValidators() {
    return this.clientDetailsForm.controls;
  }

  get invoiceDetailsFormValidators() {
    return this.clientDetailsForm.controls;
  }

  /**Function to get all the City list */
  getAllCity() {
    const data =
      { Page: { PageNumber: 0, PageSize: 0 } }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

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

    })
  }

  getCurrentTab() {
    const selectedIndex = this.tabGroup.selectedIndex;
    console.log(`Current active tab index: ${selectedIndex}`);
  }

  /**** function to get all the dropdown data */
  getAllData() {
    this.spinner.show();
    this.clientService.getAllAddClientData().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          // this.regionList = res.Records;
          this.regionList = res.RegionList;
          this.cityList = res.CityList;
          this.partOfGroup = res.GroupOfCompaniesList;
          this.parentList = res.ParentList;
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

  /**Function to get all the region list */
  getAllRegion() {
    this.spinner.show();
    const data =
      { Page: { PageNumber: 0, PageSize: 0 } }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

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

  getRolewiseUsers() {
    this.spinner.show();
    let data = "BDM";
    this.clientService.getRolewiseUsers(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.bdmRoleUserList = res.Rows;
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

  /**Function to get all the Indutry Type list */
  getAllIndustryType() {
    const data = "Industry Type"
    this.spinner.show();
    this.clientService.getAllIndustryType(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.industryTypeList = res.Rows;
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

  getClientById(id: any) {
    this.spinner.show();
    this.clientService.getClientById(id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selecetdClientData = res;
          if (this.isView || this.IsApproverView) {
            this.clientDetailsForm.disable();
            this.InvoiceDetailsForm.disable();
          }
          if (this.editMode) { // to set validation of * in update mode
            this.clientDetailsForm.get('ClientName')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
            this.clientDetailsForm.get('AccountName')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
            this.clientDetailsForm.get('Mobile')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.clientDetailsForm.get('Mobile2')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.clientDetailsForm.get('Email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.clientDetailsForm.get('Email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.clientDetailsForm.get('CoordinatorEmail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.clientDetailsForm.get('PanNo')?.setValidators([Validators.pattern(Constant.panNumberSpChar)]);
            // this.clientDetailsForm.get('TanNo')?.setValidators([Validators.pattern(Constant.panNumberSpChar)]);
          } else {
            this.clientDetailsForm.get('ClientName')?.setValidators([Validators.required, Validators.pattern(Constant.textInput)]);
            this.clientDetailsForm.get('AccountName')?.setValidators([Validators.required, Validators.pattern(Constant.textInput)]);
            this.clientDetailsForm.get('Mobile')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
            this.clientDetailsForm.get('Mobile2')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.clientDetailsForm.get('Email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.clientDetailsForm.get('Email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.clientDetailsForm.get('CoordinatorEmail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.clientDetailsForm.get('PanNo')?.setValidators([Validators.pattern(Constant.panNumber)]);
            // this.clientDetailsForm.get('TanNo')?.setValidators([Validators.pattern(Constant.panNumber)]);
          }

          this.clientDetailsForm.get('ClientName')?.updateValueAndValidity();
          this.clientDetailsForm.get('AccountName')?.updateValueAndValidity();
          this.clientDetailsForm.get('Mobile')?.updateValueAndValidity();
          this.clientDetailsForm.get('Mobile2')?.updateValueAndValidity();
          this.clientDetailsForm.get('Email')?.updateValueAndValidity();
          this.clientDetailsForm.get('Email2')?.updateValueAndValidity();
          this.clientDetailsForm.get('CoordinatorEmail')?.updateValueAndValidity();
          this.clientDetailsForm.get('PanNo')?.updateValueAndValidity();

          // To apply the new validators, you need to update the form control's value
          this.clientDetailsForm.updateValueAndValidity();

          this.clientDetailsForm.patchValue({
            ClientName: this.selecetdClientData.ClientName,
            AccountName: this.selecetdClientData.AccountName,
            Email: this.selecetdClientData.EmailId1,
            Email2: this.selecetdClientData.EmailId2,
            AccountAddress: this.selecetdClientData.AccountAddress,
            Address2: this.selecetdClientData.Address2,
            Address3: this.selecetdClientData.Address3,
            Mobile: this.selecetdClientData.Mobile1,
            Mobile2: this.selecetdClientData.Mobile2,
            regionControl: this.selecetdClientData.Region,
            officeAddress: this.selecetdClientData.Address1,
            pinCode: this.selecetdClientData.Pin,
            City: this.selecetdClientData.CityId,
            IsJapanese: this.selecetdClientData.IsJapanese,
            TurnOver: this.selecetdClientData.TurnOver,
            Strength: this.selecetdClientData.Strength,
            ParentId: this.selecetdClientData.ParentId,
            ContactPerson: this.selecetdClientData.ConPerson1,
            ContactPerson2: this.selecetdClientData.ConPerson2,
            PartOfGroup: this.selecetdClientData.GOCId != 0 ? this.selecetdClientData.GOCId : null,
            IndustryType: this.selecetdClientData.IndustryType,
            SubIndustry: this.selecetdClientData.SubIndustry,
            Category: this.selecetdClientData.Category,
            Ocean: this.selecetdClientData.Ocean,
            OracleClient: this.selecetdClientData.OracleClient,
            CoordinatorEmail: this.selecetdClientData.CoordinatorEmailId,
            BdmRm: Number(this.selecetdClientData.BDM),
            PaymentDueDate: this.selecetdClientData.Paymentdays,
            PaymentAfter: this.selecetdClientData.PaymentdaysAlt,
            PaymentData: this.selecetdClientData.PaymentdaysAltDesc,
            SEZ: this.selecetdClientData.SEZ,
            N2NClient: this.selecetdClientData.N2NClient,
            HandlingCharges: this.selecetdClientData.HandlingCharges === 1 ? true : false,
            NACH: this.selecetdClientData.NACH,
            PanNo: this.selecetdClientData.PANNo,
            // TanNo: this.selecetdClientData.TAN,
            ExerciseNo: this.selecetdClientData.ExciseNo,
            TIN: this.selecetdClientData.TIN,
            ServiceTaxNO: this.selecetdClientData.ServiceTaxNo,
            CST: this.selecetdClientData.CSTNo,
            Description: this.selecetdClientData.RelPartyDescription,
            printBreakUpRentalInvoice: this.selecetdClientData.Breakup,
            SuspendedFMS: this.selecetdClientData.NoFMS === 1 ? true : false,
            Designation: this.selecetdClientData.Designation1,
            RelatedParty: this.selecetdClientData.RelatedParty,
            AutoMobileass: this.selecetdClientData.MemOfAutoAsso,
          });

          this.InvoiceDetailsForm.patchValue({
            InvoicePattern: this.selecetdClientData.OpInvType,
            AnnBillAddress: this.selecetdClientData.ChkAddressAsPerAnnexure === 1 ? true : false,
            EmployeeID: this.selecetdClientData.ChkempId,
            ActivationDate: this.selecetdClientData.ChkActDate,
            InvoiceDate: this.selecetdClientData.ChkInvDate,
            PoNo: this.selecetdClientData.ChkPO,
            SbuUnit: this.selecetdClientData.ChkSBU,
            TinNO: this.selecetdClientData.ChkCIPLShowTin,
            Disclaimer: this.selecetdClientData.ShowDisclaimer,
          })

          // this.clientDetailsForm.get('ClientName')?.disable();
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

  get f() { return this.clientDetailsForm.controls };
  get f1() { return this.InvoiceDetailsForm.controls };

  addClient() {
    console.log(this.clientDetailsForm);
    this.clientDetailsFormSubmitted = true;
    this.InvoiceDetailsFormSubmitted = true;
    if (this.clientDetailsForm.status == 'VALID' && this.InvoiceDetailsForm.status == 'VALID') {

      let clientDetails = {
        CreatedById: this.currentUser.UserId,
        Dormant: 0,

        ClientName: this.clientDetailsForm.value.ClientName,
        AccountName: this.clientDetailsForm.value.AccountName,
        EmailId1: this.clientDetailsForm.value.Email,
        EmailId2: this.clientDetailsForm.value.Email2,
        AccountAddress: this.clientDetailsForm.value.AccountAddress,
        Address2: this.clientDetailsForm.value.Address2,
        Address3: this.clientDetailsForm.value.Address3,
        Mobile1: this.clientDetailsForm.value.Mobile,
        Mobile2: this.clientDetailsForm.value.Mobile2,
        Region: this.clientDetailsForm.value.regionControl,
        Address1: this.clientDetailsForm.value.officeAddress,
        Pin: this.clientDetailsForm.value.pinCode,
        CityId: this.clientDetailsForm.value.City,
        IsJapanese: Number(this.clientDetailsForm.value.IsJapanese),
        TurnOver: this.clientDetailsForm.value.TurnOver,
        Strength: this.clientDetailsForm.value.Strength,
        ParentId: this.clientDetailsForm.value.ParentId,
        ConPerson1: this.clientDetailsForm.value.ContactPerson,
        ConPerson2: this.clientDetailsForm.value.ContactPerson2,
        RelPartyDescription: this.clientDetailsForm.value.Description,
        Designation1: this.clientDetailsForm.value.Designation,
        GOCId: this.clientDetailsForm.value.PartOfGroup != 0 ? this.clientDetailsForm.value.PartOfGroup : null,
        IndustryType: this.clientDetailsForm.value.IndustryType,
        SubIndustry: this.clientDetailsForm.value.SubIndustry,
        BDM: this.clientDetailsForm.value.BdmRm,
        Category: this.clientDetailsForm.value.Category,
        Ocean: this.clientDetailsForm.value.Ocean,
        OracleClient: this.clientDetailsForm.value.OracleClient,
        CoordinatorEmailId: this.clientDetailsForm.value.CoordinatorEmail,
        paymentDAys: this.clientDetailsForm.value.PaymentDueDate,
        paymentdaysalt: this.clientDetailsForm.value.PaymentAfter,
        PaymentdaysAltDesc: this.clientDetailsForm.value.PaymentData,
        Breakup: this.clientDetailsForm.value.printBreakUpRentalInvoice,
        SEZ: this.clientDetailsForm.value.SEZ,
        N2NClient: this.clientDetailsForm.value.N2NClient,
        HandlingCharges: this.clientDetailsForm.value.HandlingCharges != null && this.clientDetailsForm.value.HandlingCharges != '' && this.clientDetailsForm.value.HandlingCharges ? 1 : 0,
        NoFMS: this.clientDetailsForm.value.SuspendedFMS != null && this.clientDetailsForm.value.SuspendedFMS != '' && this.clientDetailsForm.value.SuspendedFMS ? 1 : 0,
        MemOfAutoAsso: this.clientDetailsForm.value.AutoMobileass,
        RelatedParty: this.clientDetailsForm.value.RelatedParty,
        NACH: this.clientDetailsForm.value.NACH,
        PANNo: this.clientDetailsForm.value.PanNo,
        TIN: this.clientDetailsForm.value.TIN,
        ServiceTaxNo: this.clientDetailsForm.value.ServiceTaxNO,
        CSTNo: this.clientDetailsForm.value.CST,

        ChkempId: this.InvoiceDetailsForm.value.EmployeeID,
        ChkSBU: this.InvoiceDetailsForm.value.SbuUnit,
        ChkPO: this.InvoiceDetailsForm.value.PoNo,
        chkActDate: this.InvoiceDetailsForm.value.ActivationDate,
        ChkCIPLShowTin: this.InvoiceDetailsForm.value.TinNO,
        // TAN: this.InvoiceDetailsForm.value.TanNo,
        ExciseNo: this.InvoiceDetailsForm.value.ExerciseNo,

        ShowDisclaimer: this.InvoiceDetailsForm.value.Disclaimer,
        ChkAddressAsPerAnnexure: this.InvoiceDetailsForm.value.AnnBillAddress === true ? 1 : 0,
        ChkInvDate: this.InvoiceDetailsForm.value.InvoiceDate,
        OpInvType: this.InvoiceDetailsForm.value.InvoicePattern
      };

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(clientDetails));

      this.spinner.show();
      this.clientService.addNewClient(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success(res.Message, undefined, {
              positionClass: 'toast-top-center'
            });

            this.spinner.hide();
            this.router.navigate(["/clientMaker"], {
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
      })
    }

  }

  updateClient() {
    this.clientDetailsFormSubmitted = true;
    this.InvoiceDetailsFormSubmitted = true;
    console.log(this.clientDetailsForm);
    console.log(this.InvoiceDetailsForm);
    if (this.clientDetailsForm.status == 'VALID' && this.InvoiceDetailsForm.status == 'VALID') {

      // let clientDetails = {
      //   ModifiedById: this.currentUser.UserId,
      //   Id: this.clientId,
      //   Dormant: this.selecetdClientData.Dormant,
      //   IsActive: this.selecetdClientData.IsActive,

      //   ClientName: this.clientDetailsForm.value.ClientName,
      //   AccountName: this.clientDetailsForm.value.AccountName,
      //   EmailId1: this.clientDetailsForm.value.Email,
      //   EmailId2: this.clientDetailsForm.value.Email2,
      //   AccountAddress: this.clientDetailsForm.value.AccountAddress,
      //   Address2: this.clientDetailsForm.value.Address2,
      //   Address3: this.clientDetailsForm.value.Address3,
      //   Mobile1: this.clientDetailsForm.value.Mobile,
      //   Mobile2: this.clientDetailsForm.value.Mobile2,
      //   Region: this.clientDetailsForm.value.regionControl,
      //   Address1: this.clientDetailsForm.value.officeAddress,
      //   Pin: this.clientDetailsForm.value.pinCode,
      //   CityId: this.clientDetailsForm.value.City,
      //   IsJapanese: Number(this.clientDetailsForm.value.IsJapanese),
      //   TurnOver: this.clientDetailsForm.value.TurnOver,
      //   Strength: this.clientDetailsForm.value.Strength,
      //   ParentId: this.clientDetailsForm.value.ParentId,
      //   ConPerson1: this.clientDetailsForm.value.ContactPerson,
      //   ConPerson2: this.clientDetailsForm.value.ContactPerson2,
      //   RelPartyDescription: this.clientDetailsForm.value.Description,
      //   Designation1: this.clientDetailsForm.value.Designation,
      //   GOCId: this.clientDetailsForm.value.PartOfGroup,
      //   IndustryType: this.clientDetailsForm.value.IndustryType,
      //   SubIndustry: this.clientDetailsForm.value.SubIndustry,
      //   BDM: this.clientDetailsForm.value.BdmRm,
      //   Category: this.clientDetailsForm.value.Category,
      //   Ocean: this.clientDetailsForm.value.Ocean,
      //   OracleClient: this.clientDetailsForm.value.OracleClient,
      //   CoordinatorEmailId: this.clientDetailsForm.value.CoordinatorEmail,
      //   paymentDAys: this.clientDetailsForm.value.PaymentDueDate,
      //   paymentdaysalt: this.clientDetailsForm.value.PaymentAfter,
      //   PaymentdaysAltDesc: this.clientDetailsForm.value.PaymentData,
      //   Breakup: this.clientDetailsForm.value.printBreakUpRentalInvoice,
      //   SEZ: this.clientDetailsForm.value.SEZ,
      //   N2NClient: this.clientDetailsForm.value.N2NClient,
      //   HandlingCharges: this.clientDetailsForm.value.HandlingCharges != null && this.clientDetailsForm.value.HandlingCharges != '' && this.clientDetailsForm.value.HandlingCharges ? 1 : 0,
      //   NoFMS: this.clientDetailsForm.value.SuspendedFMS != null && this.clientDetailsForm.value.SuspendedFMS != '' && this.clientDetailsForm.value.SuspendedFMS ? 1 : 0,
      //   MemOfAutoAsso: this.clientDetailsForm.value.AutoMobileass,
      //   RelatedParty: this.clientDetailsForm.value.RelatedParty,
      //   NACH: this.clientDetailsForm.value.NACH,
      //   PANNo: this.clientDetailsForm.value.PanNo,
      //   TIN: this.clientDetailsForm.value.TIN,
      //   ServiceTaxNo: this.clientDetailsForm.value.ServiceTaxNO,
      //   CSTNo: this.clientDetailsForm.value.CST,

      //   ChkempId: this.InvoiceDetailsForm.value.EmployeeID,
      //   ChkSBU: this.InvoiceDetailsForm.value.SbuUnit,
      //   ChkPO: this.InvoiceDetailsForm.value.PoNo,
      //   chkActDate: this.InvoiceDetailsForm.value.ActivationDate,
      //   ChkCIPLShowTin: this.InvoiceDetailsForm.value.TinNO,
      //   ExciseNo: this.InvoiceDetailsForm.value.ExerciseNo,
      //   ShowDisclaimer: this.InvoiceDetailsForm.value.Disclaimer,
      //   ChkAddressAsPerAnnexure: this.InvoiceDetailsForm.value.AnnBillAddress === true ? 1 : 0,
      //   ChkInvDate: this.InvoiceDetailsForm.value.InvoiceDate,
      //   OpInvType: this.InvoiceDetailsForm.value.InvoicePattern,

      //   CreatedById: this.selecetdClientData.CreatedById,
      //   CreatedDate: this.selecetdClientData.CreatedDate,
      //   ModifiedDate: this.selecetdClientData.ModifiedDate,
      //   NGOCID: this.selecetdClientData.NGOCID,
      //   LeaseVendor: this.selecetdClientData.LeaseVendor,
      //   PCStatus: this.selecetdClientData.PCStatus,
      //   ChkActDate: this.selecetdClientData.ChkActDate,
      //   DormantRemark: this.selecetdClientData.DormantRemark,
      //   Designation2: this.selecetdClientData.Designation2,
      //   Paymentdays: this.selecetdClientData.Paymentdays,
      //   PaymentdaysAlt: this.selecetdClientData.PaymentdaysAlt,
      //   LastUpdatedDate: this.selecetdClientData.LastUpdatedDate,
      //   R12OracleCustomerId: this.selecetdClientData.R12OracleCustomerId,
      //   R12OracleCustSiteId: this.selecetdClientData.R12OracleCustSiteId,
      //   ErrorRemarks: this.selecetdClientData.ErrorRemarks,
      //   BDMEmail: this.selecetdClientData.BDMEmail,
      //   SFAccountId: this.selecetdClientData.SFAccountId,
      //   SFClientId: this.selecetdClientData.SFClientId,
      //   OldOutStandingFromDate: this.selecetdClientData.OldOutStandingFromDate,
      //   OutStandingLastUpdatedOn: this.selecetdClientData.OutStandingLastUpdatedOn,
      //   Status: this.selecetdClientData.Status,
      //   ApprovalRemark: this.selecetdClientData.ApprovalRemark,
      //   CityName: this.selecetdClientData.CityName,
      //   CreatedUserName: this.selecetdClientData.CityName,
      //   ClientStatus: this.selecetdClientData.ClientStatus,
      //   GOCName: this.selecetdClientData.GOCName,
      //   MGroupOfCompanies: this.selecetdClientData.MGroupOfCompanies,
      //   MCity: this.selecetdClientData.MCity,
      //   CreatedBy: this.selecetdClientData.CreatedBy,
      //   ModifiedBy: this.selecetdClientData.ModifiedBy,
      //   ClinetApprover: this.selecetdClientData.ClinetApprover,
      //   MIndustryType: this.selecetdClientData.MIndustryType,
      // };

      this.selecetdClientData.ModifiedById = this.currentUser.UserId,

        this.selecetdClientData.ClientName = this.clientDetailsForm.value.ClientName;
      this.selecetdClientData.AccountName = this.clientDetailsForm.value.AccountName;
      this.selecetdClientData.EmailId1 = this.clientDetailsForm.value.Email;
      this.selecetdClientData.EmailId2 = this.clientDetailsForm.value.Email2;
      this.selecetdClientData.AccountAddress = this.clientDetailsForm.value.AccountAddress;
      this.selecetdClientData.Address2 = this.clientDetailsForm.value.Address2;
      this.selecetdClientData.Address3 = this.clientDetailsForm.value.Address3;
      this.selecetdClientData.Mobile1 = this.clientDetailsForm.value.Mobile;
      this.selecetdClientData.Mobile2 = this.clientDetailsForm.value.Mobile2;
      this.selecetdClientData.Region = this.clientDetailsForm.value.regionControl;
      this.selecetdClientData.Address1 = this.clientDetailsForm.value.officeAddress;
      this.selecetdClientData.Pin = this.clientDetailsForm.value.pinCode;
      this.selecetdClientData.CityId = this.clientDetailsForm.value.City;
      this.selecetdClientData.IsJapanese = Number(this.clientDetailsForm.value.IsJapanese);
      this.selecetdClientData.TurnOver = this.clientDetailsForm.value.TurnOver;
      this.selecetdClientData.Strength = this.clientDetailsForm.value.Strength;
      this.selecetdClientData.ParentId = this.clientDetailsForm.value.ParentId;
      this.selecetdClientData.ConPerson1 = this.clientDetailsForm.value.ContactPerson;
      this.selecetdClientData.ConPerson2 = this.clientDetailsForm.value.ContactPerson2;
      this.selecetdClientData.RelPartyDescription = this.clientDetailsForm.value.Description;
      this.selecetdClientData.Designation1 = this.clientDetailsForm.value.Designation;
      this.selecetdClientData.GOCId = this.clientDetailsForm.value.PartOfGroup != 0 ? this.clientDetailsForm.value.PartOfGroup : null,
        this.selecetdClientData.IndustryType = this.clientDetailsForm.value.IndustryType;
      this.selecetdClientData.SubIndustry = this.clientDetailsForm.value.SubIndustry;
      this.selecetdClientData.BDM = this.clientDetailsForm.value.BdmRm;
      this.selecetdClientData.Category = this.clientDetailsForm.value.Category;
      this.selecetdClientData.Ocean = this.clientDetailsForm.value.Ocean;
      this.selecetdClientData.OracleClient = this.clientDetailsForm.value.OracleClient;
      this.selecetdClientData.CoordinatorEmailId = this.clientDetailsForm.value.CoordinatorEmail;
      this.selecetdClientData.paymentDAys = this.clientDetailsForm.value.PaymentDueDate;
      this.selecetdClientData.paymentdaysalt = this.clientDetailsForm.value.PaymentAfter;
      this.selecetdClientData.PaymentdaysAltDesc = this.clientDetailsForm.value.PaymentData;
      this.selecetdClientData.Breakup = this.clientDetailsForm.value.printBreakUpRentalInvoice;
      this.selecetdClientData.SEZ = this.clientDetailsForm.value.SEZ;
      this.selecetdClientData.N2NClient = this.clientDetailsForm.value.N2NClient;
      this.selecetdClientData.HandlingCharges = this.clientDetailsForm.value.HandlingCharges != null && this.clientDetailsForm.value.HandlingCharges != '' && this.clientDetailsForm.value.HandlingCharges ? 1 : 0;
      this.selecetdClientData.NoFMS = this.clientDetailsForm.value.SuspendedFMS != null && this.clientDetailsForm.value.SuspendedFMS != '' && this.clientDetailsForm.value.SuspendedFMS ? 1 : 0;
      this.selecetdClientData.MemOfAutoAsso = this.clientDetailsForm.value.AutoMobileass;
      this.selecetdClientData.RelatedParty = this.clientDetailsForm.value.RelatedParty;
      this.selecetdClientData.NACH = this.clientDetailsForm.value.NACH;
      this.selecetdClientData.PANNo = this.clientDetailsForm.value.PanNo;
      this.selecetdClientData.TIN = this.clientDetailsForm.value.TIN;
      this.selecetdClientData.ServiceTaxNo = this.clientDetailsForm.value.ServiceTaxNO;
      this.selecetdClientData.CSTNo = this.clientDetailsForm.value.CST;

      this.selecetdClientData.ChkempId = this.InvoiceDetailsForm.value.EmployeeID;
      this.selecetdClientData.ChkSBU = this.InvoiceDetailsForm.value.SbuUnit;
      this.selecetdClientData.ChkPO = this.InvoiceDetailsForm.value.PoNo;
      this.selecetdClientData.chkActDate = this.InvoiceDetailsForm.value.ActivationDate;
      this.selecetdClientData.ChkCIPLShowTin = this.InvoiceDetailsForm.value.TinNO;
      this.selecetdClientData.ExciseNo = this.InvoiceDetailsForm.value.ExerciseNo;
      this.selecetdClientData.ShowDisclaimer = this.InvoiceDetailsForm.value.Disclaimer;
      this.selecetdClientData.ChkAddressAsPerAnnexure = this.InvoiceDetailsForm.value.AnnBillAddress === true ? 1 : 0;
      this.selecetdClientData.ChkInvDate = this.InvoiceDetailsForm.value.InvoiceDate;
      this.selecetdClientData.OpInvType = this.InvoiceDetailsForm.value.InvoicePattern;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selecetdClientData));

      this.spinner.show();
      this.clientService.updateClient(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            // this.toastr.success("Client updated Successfully.",);
            this.toaster.success(res.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.router.navigate(["/clientMaker"], {
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
      })
    }
  }


  onKeyPress(event: any) {
    Constant.mobileNo(event);
  }

  tabClick(event: any) {
    this.selectedtab = event.index

    let tab: any = event.tab;

    if (tab) {
      let _closestTabGroup: any = tab._closestTabGroup;
      let _elementRef: any = _closestTabGroup._elementRef;
      let nativeElement: any = _elementRef.nativeElement;
      let children: any = nativeElement.children;
      let children1: any = children[1];
      let Childs: any = children1.children;
      let Child1 = Childs[0];
      let Child2 = Childs[1];

      // let childArray: any[] = [Child1, Child2];
      // childArray.map((item, i) => {
      //   let tabContentWrapper: any = item.children;
      //   let tabContent: any = tabContentWrapper[0];
      //   if (this.selectedtab === i) {
      //     tabContent.classList.add('blue-bg');
      //   } else {
      //     tabContent.classList.remove('blue-bg');
      //   }
      // });
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.clientId, Name: this.selecetdClientData.ClientName, moduleName: 'add-client-detail' }
    });
  }

  changeAddress2(checked: boolean) {
    if (checked) {
      this.clientDetailsForm.get('Address2')?.setValue(this.clientDetailsForm.value.AccountAddress);
    }
    else {
      this.clientDetailsForm.get('Address2')?.setValue('');
    }
  }

  changeAddress3(checked: boolean) {
    if (checked) {
      this.clientDetailsForm.get('Address3')?.setValue(this.clientDetailsForm.value.AccountAddress);
    }
    else {
      this.clientDetailsForm.get('Address3')?.setValue('');
    }
  }

  moveToNextTab() {
    if (this.selectedtab == 0) {
      this.clientDetailsFormSubmitted = true;
      if (this.clientDetailsForm.status == 'VALID') {
        this.selectedtab = 1;
      }
    }
  }

  resetForm() {
    this.editMode = false;
    // this.submitted = false;
    this.clientDetailsFormSubmitted = false;
    this.InvoiceDetailsFormSubmitted = false;
    this.isView = false;
    this.IsApproverView = false;
    this.clientDetailsForm.reset(defaultclientDetailsValues);
    this.clientDetailsForm.markAllAsTouched();
    this.InvoiceDetailsForm.reset(defaultInvoiceValues);
    this.InvoiceDetailsForm.markAllAsTouched();

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

let defaultclientDetailsValues = {
  ClientName: '',
  AccountName: '',
  Email: '',
  Email2: '',
  AccountAddress: '',
  Address2: '',
  Address3: '',
  Address2Toggle: false,
  Address3Toggle: false,
  Mobile: '',
  Mobile2: '',
  regionControl: null,
  officeAddress: '',
  pinCode: '',
  City: null,
  IsJapanese: null,
  TurnOver: null,
  Strength: null,
  ParentId: null,
  ContactPerson: '',
  ContactPerson2: '',
  Description: '',
  Designation: '',
  PartOfGroup: null,
  IndustryType: null,
  SubIndustry: null,
  BdmRm: null,
  Category: null,
  Ocean: null,
  OracleClient: '',
  CoordinatorEmail: '',
  clientPONo: false,
  printBreakUpRentalInvoice: false,
  SEZ: false,
  N2NClient: false,
  HandlingCharges: false,
  SuspendedFMS: false,
  AutoMobileass: false,
  RelatedParty: false,
  NACH: false,
  PanNo: '',
  // TanNo: '',
  ExerciseNo: '',
  TIN: '',
  ServiceTaxNO: '',
  CST: '',
  PaymentDueDate: '',
  PaymentAfter: '',
  PaymentData: '',
}

let defaultInvoiceValues = {
  InvoicePattern: null,
  AnnBillAddress: false,
  EmployeeID: false,
  SbuUnit: false,
  InvoiceDate: false,
  PoNo: false,
  ActivationDate: false,
  TinNO: false,
  Disclaimer: false,
}