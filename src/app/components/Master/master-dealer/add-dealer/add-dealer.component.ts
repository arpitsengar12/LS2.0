import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../../client.service';
import { Location } from '@angular/common';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { MatDialog } from '@angular/material/dialog';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

export interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-dealer',
  templateUrl: './add-dealer.component.html',
  styleUrls: ['./add-dealer.component.scss']
})
export class AddDealerComponent {
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

  // addDealerForm!: FormGroup;
  CreditorDetailsForm!: FormGroup;
  ContactDetailsForm!: FormGroup;
  AccountDetailsForm!: FormGroup;
  DealerAndDocDetailsForm!: FormGroup;

  CreditorDetailsFormSubmitted: boolean = false;
  ContactDetailsFormSubmitted: boolean = false;
  AccountDetailsFormSubmitted: boolean = false;
  DealerAndDocDetailsFormSubmitted: boolean = false;
  IsDealerForm: boolean = false;
  selectedFormType: string = 'Creditor';
  resetFormGroup: boolean = false;
  panelOpenState = false;
  selectedtab: number = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  submitted: boolean = false;
  cityList: any;
  editMode: boolean = false;
  dealerId: number = 0;
  dealerList: any;
  selecetdDealerData: any;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  minDate: Date = new Date();
  currentDate: Date = new Date();
  pCompanyList: any;
  accTypeList: any;
  relatedDeptLit: any;
  manufacturersList: any;
  instrumentTypesList: any;
  turnOversList = [{ Id: 1, type: '100 Cr' }, { Id: 2, type: '50 Cr' }, { Id: 3, type: '<50 Cr' }];
  dealerTypeList = [{ Id: 1, type: 'WorkShop Service' }, { Id: 2, type: 'WorkShop A/C Repair' }, { Id: 3, type: 'ShowRoom' }, { Id: 4, type: 'Others' }];
  docTypeList: any;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDay: any;
  fromDateChanged: boolean = false;
  toDateChanged: boolean = false;
  securityDepDateChanged: boolean = false;
  GSTRegDateChanged: boolean = false;
  files: File[] = [];
  fileName: string = '';
  media: string | Blob;
  fileType: string = '';
  url: any = '';
  imageType = Constant.imageType;
  pdfType = Constant.pdfType;
  attachmentType: string = '';
  imageUploaded: boolean = false;
  pdfUploaded: boolean = false;

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
    private router: Router,
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
      this.dealerId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getDealerById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getDealerById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getDealerById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.CreditorDetailsForm = new FormGroup({
      parentCompany: new FormControl(null,),
      dealerName: new FormControl('', Validators.required),
      accountName: new FormControl('', [Validators.required]),
      accType: new FormControl(null),
      vendorSiteName: new FormControl('', [Validators.required]),
      address1: new FormControl('', [Validators.required]),
      address2: new FormControl('', [Validators.required]),
      address3: new FormControl('', [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      pinCode: new FormControl('', [Validators.required, Validators.pattern(Constant.pinCode)]),

      relatedDept: new FormControl(null, [Validators.required]),
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
      paymentDays: new FormControl(''),
      IsAgreement: new FormControl(false),
      MSME: new FormControl(false),
      manufacturer: new FormControl(null),
      subLocation: new FormControl(''),
      instrumentType: new FormControl(null),
      securityDepositAmt: new FormControl(''),
      securityDepositDate: new FormControl(''),
      turnOver: new FormControl(null),
      EInvoiceOpted: new FormControl(false),
    });

    this.ContactDetailsForm = new FormGroup({
      ContactPerson1: new FormControl('', [Validators.required]),
      mobile1: new FormControl('', [Validators.required, Validators.pattern(Constant.phoneRegExp)]),
      email1: new FormControl('', [Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]),
      ContactPerson2: new FormControl(''),
      email2: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      mobile2: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      landLine: new FormControl(''),
      faxNumber: new FormControl(''),

      ServiceContactPerson: new FormControl(''),
      Servicemobile1: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      Serviceemail1: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      SalesContactPerson: new FormControl(''),
      Salesmobile1: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      Salesemail1: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
    });

    this.AccountDetailsForm = new FormGroup({
      bankName: new FormControl('', [Validators.required]),
      bankBranchName: new FormControl(''),
      bankAccNo: new FormControl('', [Validators.required]),
      IFSCCode: new FormControl('', [Validators.required]),
      MICRCode: new FormControl(''),
      panNo: new FormControl('', [Validators.required, Validators.pattern(Constant.panNumber)]),
      GSTNumber: new FormControl('', [Validators.required, Validators.pattern(Constant.GSTNumber)]),
      ifPermanent: new FormControl(false),
      acknowledged: new FormControl(false),
      GSTRegistrationDate: new FormControl(''),
      tinNo: new FormControl('', [Validators.required]),
      serviceTaxNo: new FormControl('', [Validators.required]),
      remark: new FormControl(''),
    });

    this.DealerAndDocDetailsForm = new FormGroup({
      freeService: new FormControl(''),
      discountOnParts: new FormControl('', Validators.pattern(Constant.decimalNo)),
      discountOnLabour: new FormControl('', Validators.pattern(Constant.decimalNo)),
      generalDiscount: new FormControl('', Validators.pattern(Constant.decimalNo)),
      dealerType: new FormControl(null),
      genDiscntRemark: new FormControl(''),
      offDays: new FormControl(''),
      docType: new FormControl(null),
      documentFile: new FormControl(''),
    });


    this.getCity();
    this.getAllDealerDropDowns();
    // this.addDealerForm.markAllAsTouched();
    this.CreditorDetailsForm.markAllAsTouched();
    this.ContactDetailsForm.markAllAsTouched();
    this.AccountDetailsForm.markAllAsTouched();
    this.DealerAndDocDetailsForm.markAllAsTouched();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Dealers';
      this.breadcrumbService.setBreadcrumbs(['Master / Dealers', breadcrumb]);
    });
  }

  // get validators() {
  //   return this.addDealerForm.controls;
  // }

  get CreditorDetailsValidators() {
    return this.CreditorDetailsForm.controls;
  }

  get ContactDetailsValidators() {
    return this.ContactDetailsForm.controls;
  }

  get AccountDetailsValidators() {
    return this.AccountDetailsForm.controls;
  }

  get DealerAndDocDetailsValidators() {
    return this.DealerAndDocDetailsForm.controls;
  }


  getDealerById() {
    this.spinner.show();
    this.clientService.getDealerById(this.dealerId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selecetdDealerData = res;
          this.CreditorDetailsForm.reset(CreditorDetailsDefaultValues);
          this.ContactDetailsForm.reset(ContactDetailsDefaultValues);
          this.AccountDetailsForm.reset(AccountDetailsDefaultValues);
          this.DealerAndDocDetailsForm.reset(DealerAndDocDetailsDefaultValues);
          if (this.selecetdDealerData.Creditor.IsDealer) {
            this.DealerFormSelected(this.resetFormGroup = false);
          }
          else {
            this.CreditorFormSelected(this.resetFormGroup = false);
          }
          if (this.isView || this.IsApproverView) {
            // this.addDealerForm.disable();
            this.CreditorDetailsForm.disable();
            this.ContactDetailsForm.disable();
            this.AccountDetailsForm.disable();
            this.DealerAndDocDetailsForm.disable();
          }
          if (this.editMode) {
            this.ContactDetailsForm.get('mobile1')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.ContactDetailsForm.get('email1')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.ContactDetailsForm.get('mobile2')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.ContactDetailsForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.ContactDetailsForm.get('Servicemobile1')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.ContactDetailsForm.get('Serviceemail1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.ContactDetailsForm.get('Salesmobile1')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.ContactDetailsForm.get('Salesemail1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.AccountDetailsForm.get('panNo')?.setValidators([Validators.required, Validators.pattern(Constant.panNumberSpChar)]);
            this.AccountDetailsForm.get('GSTNumber')?.setValidators([Validators.required, Validators.pattern(Constant.GSTNumberSpChar)]);
            this.ContactDetailsForm.get('pinCode')?.setValidators([Validators.required, Validators.pattern(Constant.pinCodeSpChar)]);
          } else {
            this.ContactDetailsForm.get('mobile1')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
            this.ContactDetailsForm.get('email1')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.ContactDetailsForm.get('mobile2')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.ContactDetailsForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.ContactDetailsForm.get('Servicemobile1')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.ContactDetailsForm.get('Serviceemail1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.ContactDetailsForm.get('Salesmobile1')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.ContactDetailsForm.get('Salesemail1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.AccountDetailsForm.get('panNo')?.setValidators([Validators.required, Validators.pattern(Constant.panNumber)]);
            this.AccountDetailsForm.get('GSTNumber')?.setValidators([Validators.required, Validators.pattern(Constant.GSTNumber)]);
            this.ContactDetailsForm.get('pinCode')?.setValidators([Validators.required, Validators.pattern(Constant.pinCode)]);
          }
          // To apply the new validators, you need to update the form control's value
          // this.addDealerForm.updateValueAndValidity();
          this.CreditorDetailsForm.updateValueAndValidity();
          this.ContactDetailsForm.updateValueAndValidity();
          this.AccountDetailsForm.updateValueAndValidity();
          this.DealerAndDocDetailsForm.updateValueAndValidity();


          this.CreditorDetailsForm.patchValue({
            parentCompany: this.selecetdDealerData.Creditor.ParentId,
            dealerName: this.selecetdDealerData.Creditor.CreditorName,
            accountName: this.selecetdDealerData.Creditor.AccName,
            accType: this.selecetdDealerData.Creditor.AccType,
            vendorSiteName: this.selecetdDealerData.Creditor.R12VendorSiteName,
            address1: this.selecetdDealerData.Creditor.Address1,
            address2: this.selecetdDealerData.Creditor.Address2,
            address3: this.selecetdDealerData.Creditor.Address3,
            city: this.selecetdDealerData.Creditor.CityId,
            pinCode: this.selecetdDealerData.Creditor.PinCode,

            relatedDept: this.selecetdDealerData.Creditor.DeptId,
            fromDate: this.selecetdDealerData.Creditor.FromDate ? new Date(this.selecetdDealerData.Creditor.FromDate) : null,
            toDate: this.selecetdDealerData.Creditor.ToDate ? new Date(this.selecetdDealerData.Creditor.ToDate) : null,
            paymentDays: this.selecetdDealerData.Creditor.PaymentTermDays,
            IsAgreement: this.selecetdDealerData.Creditor.IsAgrement == 1 ? true : false,
            MSME: this.selecetdDealerData.Creditor.MSME,
            manufacturer: this.selecetdDealerData.Creditor.ManufacturerId,
            subLocation: this.selecetdDealerData.Creditor.SubLocation,
            instrumentType: this.selecetdDealerData.Creditor.InstrumentType,
            securityDepositAmt: this.selecetdDealerData.Creditor.Securitydepositamount,
            securityDepositDate: this.selecetdDealerData.Creditor.Securitydepositdate ? new Date(this.selecetdDealerData.Creditor.Securitydepositdate) : null,
            turnOver: this.selecetdDealerData.Creditor.TurnOver,
            EInvoiceOpted: this.selecetdDealerData.Creditor.EinvoiceOpt == 1 ? true : false,
          });
          this.ContactDetailsForm.patchValue({
            ContactPerson1: this.selecetdDealerData.Creditor.ContactPerson1,
            mobile1: this.selecetdDealerData.Creditor.Mobile1,
            email1: this.selecetdDealerData.Creditor.Email1,
            ContactPerson2: this.selecetdDealerData.Creditor.ContactPerson2,
            email2: this.selecetdDealerData.Creditor.Email2,
            mobile2: this.selecetdDealerData.Creditor.Mobile2,
            landLine: this.selecetdDealerData.Creditor.LandLineNo,
            faxNumber: this.selecetdDealerData.Creditor.Fax,

            ServiceContactPerson: this.selecetdDealerData.Creditor.ServiceContact,
            Servicemobile1: this.selecetdDealerData.Creditor.ServiceMobile,
            Serviceemail1: this.selecetdDealerData.Creditor.ServiceEmailId,
            SalesContactPerson: this.selecetdDealerData.Creditor.SalesContact,
            Salesmobile1: this.selecetdDealerData.Creditor.SalesMobile,
            Salesemail1: this.selecetdDealerData.Creditor.SalesEmail,
          });
          this.AccountDetailsForm.patchValue({
            bankName: this.selecetdDealerData.Creditor.BankName,
            bankBranchName: this.selecetdDealerData.Creditor.BankBranchName,
            bankAccNo: this.selecetdDealerData.Creditor.BankAccNumber,
            IFSCCode: this.selecetdDealerData.Creditor.IFSCCode,
            MICRCode: this.selecetdDealerData.Creditor.MICRCode,
            panNo: this.selecetdDealerData.Creditor.PANNo,
            GSTNumber: this.selecetdDealerData.Creditor.GstNo,
            ifPermanent: this.selecetdDealerData.Creditor.IsGstNoPermanent,
            acknowledged: this.selecetdDealerData.Creditor.Accknowledged,
            GSTRegistrationDate: this.selecetdDealerData.Creditor.GstNoRegDate ? new Date(this.selecetdDealerData.Creditor.GstNoRegDate) : null,
            tinNo: this.selecetdDealerData.Creditor.TINNo,
            serviceTaxNo: this.selecetdDealerData.Creditor.STNo,
            remark: this.selecetdDealerData.Creditor.AccknowledgedRemarks,
          });
          if (this.selecetdDealerData.CreditorDetails != null) {
            this.DealerAndDocDetailsForm.patchValue({
              freeService: this.selecetdDealerData.CreditorDetails.FreeServices,
              discountOnParts: this.selecetdDealerData.CreditorDetails.DiscountOnParts,
              discountOnLabour: this.selecetdDealerData.CreditorDetails.DiscountOnLabour,
              generalDiscount: this.selecetdDealerData.CreditorDetails.GeneralDiscount,
              dealerType: this.selecetdDealerData.CreditorDetails.DealerType,
              genDiscntRemark: this.selecetdDealerData.CreditorDetails.GeneralDiscountRemarks,
              offDays: this.selecetdDealerData.CreditorDetails.OffDays,
            });
          }
          if (this.selecetdDealerData.CreditorDocument != null) {
            this.DealerAndDocDetailsForm.patchValue({
              docType: this.selecetdDealerData.CreditorDocument.DocumentTypeId,
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

  DealerFormSelected(value: any) {
    this.IsDealerForm = true;
    this.selectedFormType = 'Dealer';
    if (value) {
      this.resetForm();
    }

    this.CreditorDetailsForm.get('parentCompany')?.setValidators([Validators.required]);
    this.CreditorDetailsForm.updateValueAndValidity();
    this.CreditorDetailsForm.markAllAsTouched();
  }

  CreditorFormSelected(value: any) {
    this.IsDealerForm = false;
    this.selectedFormType = 'Creditor';
    if (value) {
      this.resetForm();
    }

    this.CreditorDetailsForm.get('parentCompany')?.removeValidators(Validators.required);
    this.CreditorDetailsForm.get('parentCompany')?.updateValueAndValidity();
    this.CreditorDetailsForm.updateValueAndValidity();
    this.CreditorDetailsForm.markAllAsTouched();
  }

  tabClick(event: any) {
    this.selectedtab = event.index;

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
      let Child3 = Childs[2];
      let Child4 = Childs[3];

      // let childArray: any[] = [Child1, Child2, Child3, Child4];
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

  moveToNextTab() {
    if (this.selectedtab == 0) {
      console.log(this.CreditorDetailsForm);

      this.CreditorDetailsFormSubmitted = true;
      if (this.CreditorDetailsForm.status == 'VALID') {
        this.selectedtab = 1;
      }
    }
    else if (this.selectedtab == 1) {
      this.ContactDetailsFormSubmitted = true;
      if (this.ContactDetailsForm.status == 'VALID') {
        this.selectedtab = 2;
      }
    }
    else if (this.selectedtab == 2) {
      this.AccountDetailsFormSubmitted = true;
      if (this.AccountDetailsForm.status == 'VALID') {
        this.selectedtab = 3;
      }
    }
  }

  onFromDtChange(event: any) {
    this.minDate = event.value;
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

  getAllDealerDropDowns() {
    this.spinner.show();
    this.clientService.getAllDealerDropDowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.accTypeList = res.AccountList;
          this.relatedDeptLit = res.DepartmentList;
          this.docTypeList = res.DocumentList;
          this.instrumentTypesList = res.InstrumentList;
          this.manufacturersList = res.ManufacturerList;
          this.pCompanyList = res.ParentCreditorList;
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

  onDayChange(event: any) {
    this.selectedDay = event.value;
    if (this.selectedDay) {
      // this.addDealerForm.get('offDays')?.setValue(this.selectedDay);
      this.DealerAndDocDetailsForm.get('offDays')?.setValue(this.selectedDay);

    } else {
      // this.addDealerForm.get('offDays')?.setValue('');
      this.DealerAndDocDetailsForm.get('offDays')?.setValue('');
    }
  }


  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  addDealer() {
    this.CreditorDetailsFormSubmitted = true;
    this.ContactDetailsFormSubmitted = true;
    this.AccountDetailsFormSubmitted = true;
    this.DealerAndDocDetailsFormSubmitted = true;
    console.log(this.CreditorDetailsForm);
    console.log(this.ContactDetailsForm);
    console.log(this.AccountDetailsForm);
    console.log(this.DealerAndDocDetailsForm);
    if (this.CreditorDetailsForm.status == 'VALID' && this.ContactDetailsForm.status == 'VALID' && this.AccountDetailsForm.status == 'VALID' && this.DealerAndDocDetailsForm.status == 'VALID') {

      let creditorDetails = {
        IsDealer: this.selectedFormType == 'Dealer' ? true : false,
        ParentId: this.CreditorDetailsForm.value.parentCompany,
        CreditorName: this.CreditorDetailsForm.value.dealerName,
        AccName: this.CreditorDetailsForm.value.accountName,
        AccType: this.CreditorDetailsForm.value.accType,
        R12VendorSiteName: this.CreditorDetailsForm.value.vendorSiteName,
        Address1: this.CreditorDetailsForm.value.address1,
        Address2: this.CreditorDetailsForm.value.address2,
        Address3: this.CreditorDetailsForm.value.address3,
        CityId: this.CreditorDetailsForm.value.city,
        PinCode: this.CreditorDetailsForm.value.pinCode,

        DeptId: this.CreditorDetailsForm.value.relatedDept,
        FromDate: this.CreditorDetailsForm.value.fromDate ? this.formatDateInISO(this.CreditorDetailsForm.value.fromDate) : null,
        ToDate: this.CreditorDetailsForm.value.toDate ? this.formatDateInISO(this.CreditorDetailsForm.value.toDate) : null,
        PaymentTermDays: this.CreditorDetailsForm.value.paymentDays,
        IsAgrement: this.CreditorDetailsForm.value.IsAgreement == true ? 1 : 0,
        MSME: this.CreditorDetailsForm.value.MSME != null ? this.CreditorDetailsForm.value.MSME : false,
        ManufacturerId: this.CreditorDetailsForm.value.manufacturer,
        SubLocation: this.CreditorDetailsForm.value.subLocation,
        InstrumentType: this.CreditorDetailsForm.value.instrumentType,
        Securitydepositamount: this.CreditorDetailsForm.value.securityDepositAmt,
        Securitydepositdate: this.CreditorDetailsForm.value.securityDepositDate ? this.formatDateInISO(this.CreditorDetailsForm.value.securityDepositDate) : null,
        TurnOver: this.CreditorDetailsForm.value.turnOver,
        EinvoiceOpt: this.CreditorDetailsForm.value.EInvoiceOpted == true ? 1 : 0,
      };
      let contactDetails = {
        ContactPerson1: this.ContactDetailsForm.value.ContactPerson1,
        Mobile1: this.ContactDetailsForm.value.mobile1,
        Email1: this.ContactDetailsForm.value.email1,
        ContactPerson2: this.ContactDetailsForm.value.ContactPerson2,
        Email2: this.ContactDetailsForm.value.email2,
        Mobile2: this.ContactDetailsForm.value.mobile2,
        LandLineNo: this.ContactDetailsForm.value.landLine,
        Fax: this.ContactDetailsForm.value.faxNumber,

        ServiceContact: this.ContactDetailsForm.value.ServiceContactPerson,
        ServiceMobile: this.ContactDetailsForm.value.Servicemobile1,
        ServiceEmailId: this.ContactDetailsForm.value.Serviceemail1,
        SalesContact: this.ContactDetailsForm.value.SalesContactPerson,
        SalesMobile: this.ContactDetailsForm.value.Salesmobile1,
        SalesEmail: this.ContactDetailsForm.value.Salesemail1,
      };
      let accountDetails = {
        BankName: this.AccountDetailsForm.value.bankName,
        BankBranchName: this.AccountDetailsForm.value.bankBranchName,
        BankAccNumber: this.AccountDetailsForm.value.bankAccNo,
        IFSCCode: this.AccountDetailsForm.value.IFSCCode,
        MICRCode: this.AccountDetailsForm.value.MICRCode,
        PANNo: this.AccountDetailsForm.value.panNo,
        GstNo: this.AccountDetailsForm.value.GSTNumber,
        IsGstNoPermanent: this.AccountDetailsForm.value.ifPermanent != null ? this.AccountDetailsForm.value.ifPermanent : false,
        Accknowledged: this.AccountDetailsForm.value.acknowledged != null ? this.AccountDetailsForm.value.acknowledged : false,
        GstNoRegDate: this.AccountDetailsForm.value.GSTRegistrationDate ? this.formatDateInISO(this.AccountDetailsForm.value.GSTRegistrationDate) : null,
        TINNo: this.AccountDetailsForm.value.tinNo,
        STNo: this.AccountDetailsForm.value.serviceTaxNo,
        AccknowledgedRemarks: this.AccountDetailsForm.value.remark,
      };
      let dealerAndDocDetails = {
        creditordetails: {
          FreeServices: this.DealerAndDocDetailsForm.value.freeService,
          DiscountOnParts: this.DealerAndDocDetailsForm.value.discountOnParts,
          DiscountOnLabour: this.DealerAndDocDetailsForm.value.discountOnLabour,
          GeneralDiscount: this.DealerAndDocDetailsForm.value.generalDiscount,
          DealerType: this.DealerAndDocDetailsForm.value.dealerType,
          GeneralDiscountRemarks: this.DealerAndDocDetailsForm.value.genDiscntRemark,
          OffDays: this.DealerAndDocDetailsForm.value.offDays,
          OldCreditorCode: ""
        },
        creditordocument: {
          DocumentTypeId: this.DealerAndDocDetailsForm.value.docType
        },
      };

      const concatenatedData = {
        CreatedById: this.currentUser.UserId,
        CreatedBy: this.currentUser.UserName,
        IsActive: true,
        Dormant: false,

        ...creditorDetails,
        ...contactDetails,
        ...accountDetails,
        ...dealerAndDocDetails,
      };

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(concatenatedData));

      // formData.append("file", this.media);
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }
      this.spinner.show();
      this.clientService.addDealer(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.spinner.hide();
            this.router.navigate(["/master-dealers"], {
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

  updateDealer() {
    this.CreditorDetailsFormSubmitted = true;
    this.ContactDetailsFormSubmitted = true;
    this.AccountDetailsFormSubmitted = true;
    this.DealerAndDocDetailsFormSubmitted = true;
    console.log(this.CreditorDetailsForm);
    console.log(this.ContactDetailsForm);
    console.log(this.AccountDetailsForm);
    console.log(this.DealerAndDocDetailsForm);

    if (this.CreditorDetailsForm.status == 'VALID' && this.ContactDetailsForm.status == 'VALID' && this.AccountDetailsForm.status == 'VALID' && this.DealerAndDocDetailsForm.status == 'VALID') {

      let creditorDetails = {
        IsDealer: this.selectedFormType == 'Dealer' ? true : false,
        ParentId: this.CreditorDetailsForm.value.parentCompany ? this.CreditorDetailsForm.value.parentCompany : 0,
        CreditorName: this.CreditorDetailsForm.value.dealerName,
        AccName: this.CreditorDetailsForm.value.accountName,
        AccType: this.CreditorDetailsForm.value.accType,
        R12VendorSiteName: this.CreditorDetailsForm.value.vendorSiteName,
        Address1: this.CreditorDetailsForm.value.address1,
        Address2: this.CreditorDetailsForm.value.address2,
        Address3: this.CreditorDetailsForm.value.address3,
        CityId: this.CreditorDetailsForm.value.city,
        PinCode: this.CreditorDetailsForm.value.pinCode,

        DeptId: this.CreditorDetailsForm.value.relatedDept,
        FromDate: this.CreditorDetailsForm.value.fromDate ? this.fromDateChanged ? this.formatDateInISO(this.CreditorDetailsForm.value.fromDate) : this.formatDateInISO(this.CreditorDetailsForm.value.fromDate) : null,
        ToDate: this.CreditorDetailsForm.value.toDate ? this.toDateChanged ? this.formatDateInISO(this.CreditorDetailsForm.value.toDate) : this.formatDateInISO(this.CreditorDetailsForm.value.toDate) : null,
        PaymentTermDays: this.CreditorDetailsForm.value.paymentDays,
        IsAgrement: this.CreditorDetailsForm.value.IsAgreement == true ? 1 : 0,
        MSME: this.CreditorDetailsForm.value.MSME != null ? this.CreditorDetailsForm.value.MSME : false,
        ManufacturerId: this.CreditorDetailsForm.value.manufacturer,
        SubLocation: this.CreditorDetailsForm.value.subLocation,
        InstrumentType: this.CreditorDetailsForm.value.instrumentType,
        Securitydepositamount: this.CreditorDetailsForm.value.securityDepositAmt,
        Securitydepositdate: this.CreditorDetailsForm.value.securityDepositDate ? this.securityDepDateChanged ? this.formatDateInISO(this.CreditorDetailsForm.value.securityDepositDate) : this.formatDateInISO(this.CreditorDetailsForm.value.securityDepositDate) : null,
        TurnOver: this.CreditorDetailsForm.value.turnOver,
        EinvoiceOpt: this.CreditorDetailsForm.value.EInvoiceOpted == true ? 1 : 0,
      };
      let contactDetails = {
        ContactPerson1: this.ContactDetailsForm.value.ContactPerson1,
        Mobile1: this.ContactDetailsForm.value.mobile1,
        Email1: this.ContactDetailsForm.value.email1,
        ContactPerson2: this.ContactDetailsForm.value.ContactPerson2,
        Email2: this.ContactDetailsForm.value.email2,
        Mobile2: this.ContactDetailsForm.value.mobile2,
        LandLineNo: this.ContactDetailsForm.value.landLine,
        Fax: this.ContactDetailsForm.value.faxNumber,

        ServiceContact: this.ContactDetailsForm.value.ServiceContactPerson,
        ServiceMobile: this.ContactDetailsForm.value.Servicemobile1,
        ServiceEmailId: this.ContactDetailsForm.value.Serviceemail1,
        SalesContact: this.ContactDetailsForm.value.SalesContactPerson,
        SalesMobile: this.ContactDetailsForm.value.Salesmobile1,
        SalesEmail: this.ContactDetailsForm.value.Salesemail1,
      };
      let accountDetails = {
        BankName: this.AccountDetailsForm.value.bankName,
        BankBranchName: this.AccountDetailsForm.value.bankBranchName,
        BankAccNumber: this.AccountDetailsForm.value.bankAccNo,
        IFSCCode: this.AccountDetailsForm.value.IFSCCode,
        MICRCode: this.AccountDetailsForm.value.MICRCode,
        PANNo: this.AccountDetailsForm.value.panNo,
        GstNo: this.AccountDetailsForm.value.GSTNumber,
        IsGstNoPermanent: this.AccountDetailsForm.value.ifPermanent != null ? this.AccountDetailsForm.value.ifPermanent : false,
        Accknowledged: this.AccountDetailsForm.value.acknowledged != null ? this.AccountDetailsForm.value.acknowledged : false,
        GstNoRegDate: this.AccountDetailsForm.value.GSTRegistrationDate ? this.GSTRegDateChanged ? this.formatDateInISO(this.AccountDetailsForm.value.GSTRegistrationDate) : this.formatDateInISO(this.AccountDetailsForm.value.GSTRegistrationDate) : null,
        TINNo: this.AccountDetailsForm.value.tinNo,
        STNo: this.AccountDetailsForm.value.serviceTaxNo,
        AccknowledgedRemarks: this.AccountDetailsForm.value.remark,
      };
      let dealerAndDocDetails = {
        creditordetails: {
          Id: this.selecetdDealerData.CreditorDetails != null && this.selecetdDealerData.CreditorDetails != undefined ? this.selecetdDealerData.CreditorDetails.Id : undefined,
          FreeServices: this.DealerAndDocDetailsForm.value.freeService,
          DiscountOnParts: this.DealerAndDocDetailsForm.value.discountOnParts != null && this.DealerAndDocDetailsForm.value.discountOnParts != undefined ? this.DealerAndDocDetailsForm.value.discountOnParts : null,
          DiscountOnLabour: this.DealerAndDocDetailsForm.value.discountOnLabour,
          GeneralDiscount: this.DealerAndDocDetailsForm.value.generalDiscount,
          DealerType: this.DealerAndDocDetailsForm.value.dealerType,
          GeneralDiscountRemarks: this.DealerAndDocDetailsForm.value.genDiscntRemark,
          OffDays: this.DealerAndDocDetailsForm.value.offDays,
          Dormant: false,
          OldCreditorCode: ""
        },
        creditordocument: {
          Id: this.selecetdDealerData.CreditorDocument != null && this.selecetdDealerData.CreditorDocument != undefined ? this.selecetdDealerData.CreditorDocument.Id : undefined,
          DocumentTypeId: this.DealerAndDocDetailsForm.value.docType
        },
      };

      const concatenatedData = {
        ModifiedById: this.currentUser.UserId,
        ModifiedBy: this.currentUser.UserName,
        Id: this.selecetdDealerData.Creditor.Id,
        Dormant: false,
        IsActive: this.selecetdDealerData.Creditor.IsActive,

        ...creditorDetails,
        ...contactDetails,
        ...accountDetails,
        ...dealerAndDocDetails,
      };

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(concatenatedData));

      // formData.append("file", this.media);
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }
      this.spinner.show();
      this.clientService.updateDealer(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.spinner.hide();
            this.router.navigate(["/master-dealers"], {
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

  resetForm() {
    this.editMode = false;
    this.submitted = false;
    this.IsApproverView = false;
    this.isView = false;
    // this.addDealerForm.reset();
    // this.addDealerForm.markAllAsTouched();

    this.CreditorDetailsForm.reset(CreditorDetailsDefaultValues);
    this.ContactDetailsForm.reset(ContactDetailsDefaultValues);
    this.AccountDetailsForm.reset(AccountDetailsDefaultValues);
    this.DealerAndDocDetailsForm.reset(DealerAndDocDetailsDefaultValues);

    this.CreditorDetailsFormSubmitted = false;
    this.ContactDetailsFormSubmitted = false;
    this.AccountDetailsFormSubmitted = false;
    this.DealerAndDocDetailsFormSubmitted = false;
    this.fromDateChanged = false;
    this.toDateChanged = false;
    this.securityDepDateChanged = false;
    this.GSTRegDateChanged = false;

    this.CreditorDetailsForm.markAllAsTouched();
    this.ContactDetailsForm.markAllAsTouched();
    this.AccountDetailsForm.markAllAsTouched();
    this.DealerAndDocDetailsForm.markAllAsTouched();

  }

  versionPageredirect() {
    this.router.navigate(["/version-history"], {
      state: { level: this.AccessLevel, id: this.dealerId, Name: this.selecetdDealerData.Creditor.CreditorName, moduleName: 'add-masterDealer' }
    });
  }

  onDateChange(event: any, field: any) {
    if (field == 'fromDate') {
      this.fromDateChanged = true;
    }
    else if (field == 'toDate') {
      this.toDateChanged = true;
    }
    else if (field == 'securityDepositDate') {
      this.securityDepDateChanged = true;
    }
    else if (field == 'GSTRegistrationDate') {
      this.GSTRegDateChanged = true;
    }
  }

  onSelect(event: any) {
    this.files = [];
    this.toaster.clear();
    this.files.push(...event.addedFiles);
    if (this.commonService.validateImageFile(this.files[0])) {
      const reader = new FileReader();
      reader.readAsDataURL(this.files[0]);
      reader.onload = () => {
        this.url = reader.result as string;
      };
      this.fileName = this.files[0]?.name;
      this.fileType = this.files[0]?.type;
      this.attachmentType = this.fileType.split('/')[1];
      if (this.imageType.includes(this.attachmentType)) {
        this.imageUploaded = true;
      }
      else {
        this.imageUploaded = false;
      }
    }
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

let CreditorDetailsDefaultValues = {
  parentCompany: null,
  dealerName: '',
  accountName: '',
  accType: null,
  vendorSiteName: '',
  address1: '',
  address2: '',
  address3: '',
  city: null,
  pinCode: '',

  relatedDept: null,
  fromDate: '',
  toDate: '',
  paymentDays: '',
  IsAgreement: false,
  MSME: false,
  manufacturer: null,
  subLocation: '',
  instrumentType: null,
  securityDepositAmt: '',
  securityDepositDate: '',
  turnOver: null,
  EInvoiceOpted: false,
};

let ContactDetailsDefaultValues = {
  ContactPerson1: '',
  mobile1: '',
  email1: '',
  ContactPerson2: '',
  email2: '',
  mobile2: '',
  landLine: '',
  faxNumber: '',

  ServiceContactPerson: '',
  Servicemobile1: '',
  Serviceemail1: '',
  SalesContactPerson: '',
  Salesmobile1: '',
  Salesemail1: '',
};

let AccountDetailsDefaultValues = {
  bankName: '',
  bankBranchName: '',
  bankAccNo: '',
  IFSCCode: '',
  MICRCode: '',
  panNo: '',
  GSTNumber: '',
  ifPermanent: false,
  acknowledged: false,
  GSTRegistrationDate: '',
  tinNo: '',
  serviceTaxNo: '',
  remark: '',
};

let DealerAndDocDetailsDefaultValues = {
  freeService: '',
  discountOnParts: '',
  discountOnLabour: '',
  generalDiscount: '',
  dealerType: null,
  genDiscntRemark: '',
  offDays: '',
  docType: null,
  documentFile: '',
};