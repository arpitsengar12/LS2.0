import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { LocalStorageServiceService } from 'src/app/shared/Services/local-storage-service.service';
import { ClientService } from '../../../../client.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatListOptionTogglePosition } from '@angular/material/list';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';
import { Constant } from 'src/app/shared/model/constant';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Sort } from '@angular/material/sort';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

export interface RouteData {
  breadcrumb?: string;
}

export interface PeriodicElement {
  Id: number,
  segmentType: string,
  standardAmt: string,
  deviationAmt: string,
  appliedAmt: string,
}

@Component({
  selector: 'app-create-contact-agreement',
  templateUrl: './create-contact-agreement.component.html',
  styleUrls: ['./create-contact-agreement.component.scss']
})
export class CreateContactAgreementComponent {
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

  sortState: string = '';
  sortDirection: string = '';
  @ViewChild('segmentTable') segmentTable!: MatTable<any>;
  @ViewChild('serviceTable') serviceTable!: MatTable<any>;
  @ViewChild('parameterTable') parameterTable!: MatTable<any>;
  @ViewChild('adminTable') adminTable!: MatTable<any>;
  @ViewChild('clientRVTable') clientRVTable!: MatTable<any>;

  // addContractForm!: FormGroup;
  addServiceForm!: FormGroup;
  isServiceFormSubmitted: boolean = false;
  adminForm!: FormGroup;
  index = 0;
  submitted: boolean = false;
  adminFormsubmitted: boolean = false;
  contractData: any;
  isSaveClick: boolean = false;
  editMode: boolean = false;
  isView: boolean = false;
  cityList: any;
  selectedRowIndex: any;
  selectedtab: number = 0;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @Input() togglePosition: MatListOptionTogglePosition;
  dataSource = new MatTableDataSource<PeriodicElement>();
  segmentTableList: any[] = [
    { SegmentId: 1, segType: 'Segment A', Standard: 400, Deviation: 0.0, Applied: 0.0 },
    { SegmentId: 2, segType: 'Segment B', Standard: 600, Deviation: 0.0, Applied: 0.0 },
    { SegmentId: 3, segType: 'Segment C', Standard: 600, Deviation: 0.0, Applied: 0.0 },
    { SegmentId: 4, segType: 'Segment C-Upper', Standard: 600, Deviation: 0.0, Applied: 0.0 },
    { SegmentId: 5, segType: 'Segment D', Standard: 1000, Deviation: 0.0, Applied: 0.0 },
    { SegmentId: 6, segType: 'Segment E', Standard: 2000, Deviation: 0.0, Applied: 0.0 },
  ];
  displayedColumns = ['segmentType', 'standardAmt', 'deviationAmt', 'appliedAmt'];
  servicesTableList: any[] = [];
  displayedColumns1 = ['serviceID', 'serviceDesc', 'Deviation', 'nonMaint', 'Action'];
  parametersList: any[] = [
    { srNo: '01', PrmName: 'Reimbursement Amount', VariableFactor: "0.0", },
    { srNo: '02', PrmName: 'Time period to trigger this clause', VariableFactor: "0.0" },
    { srNo: '03', PrmName: 'Accidental Case Coverage', VariableFactor: "0.0" },
    { srNo: '04', PrmName: 'Reimbursement to', VariableFactor: "0.0" },
    { srNo: '05', PrmName: 'Per day amount', VariableFactor: "0.0" },
  ];
  displayedColumns2 = ['srNo', 'parameter', 'VariableFactor'];
  clientList: any;
  subscriptionList: any;
  industryTypeList = ['Leasing', 'FL Leasing'];
  bounceChargeList = [{ Id: 1, type: 'Yes' }, { Id: 2, type: 'No' }];
  sourcingLocList: any;
  bdmManagerList: any;
  relManagerList: any;
  paymentTypeList = [{ Id: 1, paymentMode: 'Monthly' }, { Id: 2, paymentMode: 'Quartely' }, { Id: 3, paymentMode: 'Half Yearly' }, { Id: 4, paymentMode: 'Yearly' }];
  paymentModeList = [{ Id: 1, type: 'Advance' }, { Id: 2, type: 'Arrears' }];
  registerOwnerList = [{ Id: 1, type: 'SMAS' }, { Id: 2, type: 'Client' }];
  assestActDateList = [{ Id: 1, type: 'Registration' }, { Id: 2, type: 'Payment' }, { Id: 3, type: 'Delivery' }];
  insuranceTypeList = [{ Id: 1, type: 'Only Third Party' }, { Id: 2, type: '1st Year Financial rest reimbursed' }, { Id: 3, type: 'All Year Financed' }, { Id: 4, type: 'All Year reimbursed' }];
  roadTaxTypeList = [{ Id: 1, type: '1st Year Financial rest reimbursed' }, { Id: 2, type: 'All Year Financed' }, { Id: 3, type: 'All Year reimbursed' }];
  inFavourOfList = [{ Id: 1, type: 'Insurance Company' }, { Id: 2, type: 'SMAS' }];
  managementFeeTypeList = [{ Id: 1, type: 'Not Applicable' }, { Id: 2, type: 'Fixed Charges' }];
  brokerageList = [0.50, 1.00, 1.50, 2.00, 2.50, 3.00];
  residualList = [{ Id: 1, type: 'HRV' }, { Id: 2, type: 'LRV' }, { Id: 3, type: 'FL' }];
  CSNetPriceList = [{ Id: 1, type: 'On Net Price' }, { Id: 2, type: 'On Base Price' }];
  rTaxAccessoriesList = ['Road Tax', 'Accessories'];
  maintTypeList = ['With Maint', 'With Tyre and Batteries'];
  accessoriesList: any
  servicesList: any;
  leaseTypeList: any;
  objectTypeList: any;
  clientRVTableList: any;
  displayedColumns3 = ['Month', '12', '24', '36', '48', '60'];
  masterAgmtSelected: boolean = false;
  residHRVSelected: boolean = false;
  insurTypSelected: boolean = false;
  selectedService: any;
  adminTableList: any[] = [];
  displayedColumns4 = ['srNo', 'userName', 'approvalStage', 'Action'];
  DriversUsersList: any;
  approvalStageList = [{ apStage: 1, apLevel: 'Approval Level 1', selected: false }, { apStage: 2, apLevel: 'Approval Level 2', selected: false }, { apStage: 3, apLevel: 'Approval Level 3', selected: false }];
  DtlContractAgreementList: any;
  selectedContractAgmtData: any;
  ClientId = 0;
  contractId = 0;
  ProspectId = 0;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  adminSaved: boolean = false;
  DropdownData: any;
  IsBounceChargeApplied: boolean = false;
  isMFeeApplied: boolean = false;
  agmtDateChanged: boolean = false;

  AgmtDetailsForm!: FormGroup;
  AgmtDetailsFormSubmitted: boolean = false;
  ContinuationForm!: FormGroup;
  ContinuationFormSubmitted: boolean = false;
  StandardTermsForm!: FormGroup;
  StandardTermsFormSubmitted: boolean = false;
  addAsAdminForm!: FormGroup;
  addAsAdminFormSubmitted: boolean = false;
  OtherFeaturesForm!: FormGroup;
  OtherFeaturesFormSubmitted: boolean = false;

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
    private datePipe: DatePipe,
    private route: ActivatedRoute,
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

    this.clientRVTableList = [
      {
        C1: { Month: 'Month', colId: 1, RvValue: 'RV Value' },
        C2: { Month: '12', colId: 2, RvValue: 0.0 },
        C3: { Month: '24', colId: 3, RvValue: 0.0 },
        C4: { Month: '36', colId: 4, RvValue: 0.0 },
        C5: { Month: '48', colId: 5, RvValue: 0.0 },
        C6: { Month: '60', colId: 6, RvValue: 0.0 }
      }];
    // to load data before other API data
    // this.getAllContractDropdowns();
    this.formGroups();

    if (history.state.level) {
      this.IsAuditTrail = history.state.IsAuditTrail;
      this.contractId = history.state.id;

      this.TransactionId = history.state.TransactionId;
      this.IsApproverView = history.state.IsApproverView;

      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        // this.getContAgrmtById(this.contractId);
        this.getAllContractDropdowns();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        // this.getContAgrmtById(this.contractId);
        this.getAllContractDropdowns();
      }
      else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        // this.getContAgrmtById(this.contractId);
        this.getAllContractDropdowns();
      }
      else {
        this.onLoadData();
        this.getAllContractDropdowns();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.GetAllClients();
    this.getusersList();
    this.getAllCity();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Sales / Contract Agreement';
      this.breadcrumbService.setBreadcrumbs(['Master / Sales / Contract Agreement', breadcrumb]);
    });
  }

  formGroups() {
    // this.addContractForm = new FormGroup({
    //   masterAgreement: new FormControl(false),
    //   clientName: new FormControl(null, [Validators.required]),
    //   relManager: new FormControl(null, [Validators.required]),
    //   agmtDate: new FormControl('', Validators.required),
    //   isbounceCharge: new FormControl(null, Validators.required),
    //   bounceChargeValue: new FormControl('', Validators.required),
    //   cAgCode: new FormControl(''),
    //   miscCost: new FormControl(''),
    //   industryType: new FormControl(null),
    //   subscription: new FormControl(null),
    //   penalInterest: new FormControl(''),
    //   leaseType: new FormControl(null, [Validators.required]),
    //   sicCode: new FormControl(''),
    //   agmtNo: new FormControl(''),
    //   objectType: new FormControl(null, [Validators.required]),
    //   sourcingLoc: new FormControl(null),
    //   bdmManager: new FormControl(null),
    //   contRemark: new FormControl(''),
    //   paymentType: new FormControl(null),
    //   paymentMode: new FormControl(null),
    //   registerOwner: new FormControl(null),
    //   aActDate: new FormControl(null),
    //   cancelCharges: new FormControl(''),
    //   forCloseCharges: new FormControl(''),
    //   fixedValue: new FormControl(''),
    //   discRate: new FormControl(''),
    //   isOnline: new FormControl(false),
    //   Stdaccessories: new FormControl([]),

    //   insuranceManage: new FormControl(false),
    //   firstYDisc: new FormControl(''),
    //   restYDisc: new FormControl(''),
    //   roadTaxManage: new FormControl(false),
    //   insuranceType: new FormControl(null),
    //   inFavourOf: new FormControl(null),
    //   roadTaxType: new FormControl(null),
    //   managementFeeType: new FormControl(null),
    //   managementFeeFixed: new FormControl(''),

    //   openCalculation: new FormControl(false),
    //   clientFirstOption: new FormControl(false),
    //   downPayment: new FormControl(false),
    //   rmtbValue: new FormControl(''),
    //   rvValue: new FormControl(''),
    //   interestValue: new FormControl(''),
    //   fixedInterestValue: new FormControl(null),
    //   clientSpRv: new FormControl(null),
    //   monthlyPayToOEM: new FormControl(''),
    //   specMOValue: new FormControl(''),
    //   brokerage: new FormControl(''),
    //   brokerageValue: new FormControl(null),
    //   residualValue: new FormControl(null),
    //   CSNetPrice: new FormControl(null),
    //   CRVRoadTax: new FormControl(false),
    //   CRVAccessories: new FormControl(false),
    //   Maintenance: new FormControl(false),
    //   WithTyreBattery: new FormControl(false),

    //   companyCode: new FormControl(''),
    //   emailId: new FormControl(''),
    //   userId: new FormControl(''),
    //   contactNumber: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
    //   contactPerson: new FormControl(''),
    //   domainName: new FormControl(''),
    //   subDomainName: new FormControl(''),

    //   eliteServices: new FormControl(false),
    //   maintRco: new FormControl(false),
    //   NServiceTaxInsurance: new FormControl(false),
    //   NServiceTaxRoadTax: new FormControl(false),
    //   rvPrintOCF: new FormControl(false),
    //   bookValueChart: new FormControl(false),
    //   TLR: new FormControl(false),
    //   RTOKit: new FormControl(false),
    // });

    this.AgmtDetailsForm = new FormGroup({
      masterAgreement: new FormControl(false),
      clientName: new FormControl(null, [Validators.required]),
      relManager: new FormControl(null, [Validators.required]),
      agmtDate: new FormControl('', Validators.required),
      isbounceCharge: new FormControl(null, Validators.required),
      bounceChargeValue: new FormControl('', [Validators.required]),
      cAgCode: new FormControl(''),
      miscCost: new FormControl(''),
      industryType: new FormControl(null),
      subscription: new FormControl(null),
      penalInterest: new FormControl(''),
      leaseType: new FormControl(null, [Validators.required]),
      sicCode: new FormControl(''),
      agmtNo: new FormControl(''),
      objectType: new FormControl(null, [Validators.required]),
      sourcingLoc: new FormControl(null),
      bdmManager: new FormControl(null),
      contRemark: new FormControl(''),
      paymentType: new FormControl(null),
      paymentMode: new FormControl(null),
      registerOwner: new FormControl(null),
      aActDate: new FormControl(null),
      cancelCharges: new FormControl(''),
      forCloseCharges: new FormControl(''),
      fixedValue: new FormControl(''),
      discRate: new FormControl(''),
      isOnline: new FormControl(false),
      Stdaccessories: new FormControl([]),
    });

    this.ContinuationForm = new FormGroup({
      insuranceManage: new FormControl(false),
      firstYDisc: new FormControl(''),
      restYDisc: new FormControl(''),
      roadTaxManage: new FormControl(false),
      insuranceType: new FormControl(null),
      inFavourOf: new FormControl(null),
      roadTaxType: new FormControl(null),
      managementFeeType: new FormControl(null),
      managementFeeFixed: new FormControl(''),
    });

    this.StandardTermsForm = new FormGroup({
      openCalculation: new FormControl(false),
      clientFirstOption: new FormControl(false),
      downPayment: new FormControl(false),
      rmtbValue: new FormControl(''),
      rvValue: new FormControl(''),
      interestValue: new FormControl(''),
      fixedInterestValue: new FormControl(null),
      clientSpRv: new FormControl(null),
      monthlyPayToOEM: new FormControl(''),
      specMOValue: new FormControl(''),
      brokerage: new FormControl(''),
      brokerageValue: new FormControl(null),
      residualValue: new FormControl(null),
      CSNetPrice: new FormControl(null),
      CRVRoadTax: new FormControl(false),
      CRVAccessories: new FormControl(false),
      Maintenance: new FormControl(false),
      WithTyreBattery: new FormControl(false),
    });

    this.addAsAdminForm = new FormGroup({
      companyCode: new FormControl(''),
      emailId: new FormControl(''),
      userId: new FormControl(''),
      contactNumber: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      contactPerson: new FormControl(''),
      domainName: new FormControl(''),
      subDomainName: new FormControl(''),
    });

    this.OtherFeaturesForm = new FormGroup({
      eliteServices: new FormControl(false),
      maintRco: new FormControl(false),
      NServiceTaxInsurance: new FormControl(false),
      NServiceTaxRoadTax: new FormControl(false),
      rvPrintOCF: new FormControl(false),
      bookValueChart: new FormControl(false),
      TLR: new FormControl(false),
      RTOKit: new FormControl(false),
    });

    this.addServiceForm = new FormGroup({
      serviceOffered: new FormControl(null, [Validators.required]),
      deviationPerMonth: new FormControl('', [Validators.required]),
      usedInNonMaint: new FormControl(false),
    });

    this.adminForm = new FormGroup({
      userName: new FormControl(null, [Validators.required]),
      apvlLevel: new FormControl(null, [Validators.required]),
    });

    this.AgmtDetailsForm.markAllAsTouched();
    this.addAsAdminForm.markAllAsTouched();

    this.AgmtDetailsForm.get('cAgCode')?.disable();
    this.AgmtDetailsForm.get('agmtNo')?.disable();

  }

  // on load data 
  onLoadData() {
    this.AgmtDetailsForm.get('isbounceCharge')?.setValue(1);
    this.IsBounceChargeApplied = true;

    this.AgmtDetailsForm.get('brokerageValue')?.setValue(0.00);
    this.AgmtDetailsForm.get('paymentType')?.setValue(1);
    this.AgmtDetailsForm.get('paymentMode')?.setValue(1);
    this.AgmtDetailsForm.get('registerOwner')?.setValue(1);
    this.AgmtDetailsForm.get('aActDate')?.setValue(1);

    this.ContinuationForm.get('managementFeeType')?.setValue(1);
    this.isMFeeApplied = true;
    // this.ContinuationForm.get('managementFeeFixed')?.disable();
    this.ContinuationForm.get('insuranceType')?.setValue(3);
    this.insurTypSelected = true;
    this.ContinuationForm.get('roadTaxType')?.setValue(2);

    this.StandardTermsForm.get('residualValue')?.setValue(1);
    this.residHRVSelected = true;

    // this.AgmtDetailsForm.get('cAgCode')?.disable();
    // this.AgmtDetailsForm.get('agmtNo')?.disable();
    this.StandardTermsForm.get('CRVRoadTax')?.disable();
    this.StandardTermsForm.get('CRVAccessories')?.disable();
  }

  // get validators() {
  //   return this.addContractForm.controls;
  // }

  get AgmtDetailsValidators() {
    return this.AgmtDetailsForm.controls;
  }

  get ContinuationValidators() {
    return this.ContinuationForm.controls;
  }

  get StandardTermsValidators() {
    return this.StandardTermsForm.controls;
  }

  get addAsAdminValidators() {
    return this.addAsAdminForm.controls;
  }

  get OtherFeaturesValidators() {
    return this.OtherFeaturesForm.controls;
  }

  get serviceValidators() {
    return this.addServiceForm.controls;
  }

  get Adminvalidators() {
    return this.adminForm.controls;
  }

  accessory(index: number, accessory: string): string {
    return accessory;
  }

  getAllContractDropdowns() {
    this.spinner.show();
    this.clientService.getAllContractDropdowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {

          this.DropdownData = res;

          this.subscriptionList = res.SubscriptionList;
          this.leaseTypeList = res.LeaseType;
          this.objectTypeList = res.ObjectType;
          this.accessoriesList = res.AccessoriesList;
          this.servicesList = res.ServicesList;

          if (res.SegmentList) {
            res.SegmentList.map((element: any) => {
              this.segmentTableList.map(item => {
                if (element.GeneralDescription == item.segType) {
                  item.SegmentId = element.Id;
                }
              });
            })
          }
          if (this.segmentTable) {
            this.segmentTable.renderRows();
            this.selectedRowIndex = null;
            this.segmentTableList.map((item, index) => {
              item.position = index;
            });
          }

          if (this.editMode || this.isView || this.IsApproverView) {
            this.getContAgrmtById(this.contractId)
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

  getContAgrmtById(id: any) {
    this.spinner.show();
    this.clientService.getContractById(id).subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedContractAgmtData = res;
          this.ClientId = this.selectedContractAgmtData.ClientId;
          this.ProspectId = this.selectedContractAgmtData.ProspectId;
          this.DtlContractAgreementList = res.DtlContractAgreementList;



          this.AgmtDetailsForm.patchValue({
            cAgCode: this.contractId,
            clientName: this.selectedContractAgmtData.ClientId,
            leaseType: this.selectedContractAgmtData.ProductId,
            objectType: this.selectedContractAgmtData.ObjectId,
            masterAgreement: this.selectedContractAgmtData.MasterAgreement,
            relManager: this.selectedContractAgmtData.AccountManagerId && this.selectedContractAgmtData.AccountManagerId != '' ? Number(this.selectedContractAgmtData.AccountManagerId) : null,
            agmtDate: (new Date(this.selectedContractAgmtData.AgreementDate)),
            isbounceCharge: this.selectedContractAgmtData.IsBouncingCharges,
            bounceChargeValue: this.selectedContractAgmtData.BouncingCharges,
            miscCost: this.selectedContractAgmtData.MiscCost,
            subscription: this.selectedContractAgmtData.MasterAgreementId != 0 && this.selectedContractAgmtData.MasterAgreementId != null ? this.selectedContractAgmtData.MasterAgreementId : null,
            penalInterest: this.selectedContractAgmtData.PenelInterest,
            sourcingLoc: this.selectedContractAgmtData.SourceLocation != 0 && this.selectedContractAgmtData.SourceLocation != null ? this.selectedContractAgmtData.SourceLocation : null,
            bdmManager: this.selectedContractAgmtData.SalesManagerId && this.selectedContractAgmtData.SalesManagerId != '' ? Number(this.selectedContractAgmtData.SalesManagerId) : null,
            contRemark: this.selectedContractAgmtData.Particular,
            paymentType: this.selectedContractAgmtData.PaymentType != 0 && this.selectedContractAgmtData.PaymentType != null ? this.selectedContractAgmtData.PaymentType : null,
            paymentMode: this.selectedContractAgmtData.ARAD != 0 && this.selectedContractAgmtData.ARAD != null ? this.selectedContractAgmtData.ARAD : null,
            registerOwner: this.selectedContractAgmtData.RegisterOwner != 0 && this.selectedContractAgmtData.RegisterOwner != null ? this.selectedContractAgmtData.RegisterOwner : null,
            aActDate: this.selectedContractAgmtData.AssetActivation != 0 && this.selectedContractAgmtData.AssetActivation != null ? this.selectedContractAgmtData.AssetActivation : null,
            cancelCharges: this.selectedContractAgmtData.CancelCharges,
            forCloseCharges: this.selectedContractAgmtData.ForeClosureCharges,
            fixedValue: this.selectedContractAgmtData.ForClosureInterest,
            discRate: this.selectedContractAgmtData.FixDiscount,
            isOnline: this.selectedContractAgmtData.IsOnline,
            Stdaccessories: this.selectedContractAgmtData.StandardAccessory,

            // agmtNo: "",
            // industryType: null,
            // sicCode: "",
          });

          this.ContinuationForm.patchValue({
            insuranceManage: this.selectedContractAgmtData.InsManage,
            firstYDisc: this.selectedContractAgmtData.FirstYearDiscPerc,
            restYDisc: this.selectedContractAgmtData.RestYearDiscPerc,
            roadTaxManage: this.selectedContractAgmtData.RtManage,
            insuranceType: this.selectedContractAgmtData.InsType != 0 && this.selectedContractAgmtData.InsType != null ? this.selectedContractAgmtData.InsType : null,
            inFavourOf: this.selectedContractAgmtData.InFavourReimbursed != 0 && this.selectedContractAgmtData.InFavourReimbursed != null ? this.selectedContractAgmtData.InFavourReimbursed : null,
            roadTaxType: this.selectedContractAgmtData.RtType != 0 && this.selectedContractAgmtData.RtType != null ? this.selectedContractAgmtData.RtType : null,
            managementFeeType: this.selectedContractAgmtData.MgmtFeeType != 0 && this.selectedContractAgmtData.MgmtFeeType != null ? this.selectedContractAgmtData.MgmtFeeType : null,
            managementFeeFixed: this.selectedContractAgmtData.MgmtFixCharge,
          });

          this.StandardTermsForm.patchValue({
            openCalculation: this.selectedContractAgmtData.MaintenanceOpen,
            clientFirstOption: this.selectedContractAgmtData.ClientOption,
            downPayment: this.selectedContractAgmtData.DownPayment,
            rmtbValue: this.selectedContractAgmtData.RmtbDeviation,
            rvValue: this.selectedContractAgmtData.RvDeviation,
            interestValue: this.selectedContractAgmtData.InterestDeviation,
            fixedInterestValue: this.selectedContractAgmtData.VatInterest,
            clientSpRv: this.selectedContractAgmtData.ClientRv,
            monthlyPayToOEM: this.selectedContractAgmtData.OEMAmount,
            specMOValue: this.selectedContractAgmtData.MODeviation,
            brokerage: this.selectedContractAgmtData.Brokerage,
            brokerageValue: this.selectedContractAgmtData.BrokeragePercentage,
            residualValue: this.selectedContractAgmtData.RvType != 0 && this.selectedContractAgmtData.RvType != null ? this.selectedContractAgmtData.RvType : null,
            CSNetPrice: this.selectedContractAgmtData.CRVNetPrice != 0 && this.selectedContractAgmtData.CRVNetPrice != null ? this.selectedContractAgmtData.CRVNetPrice : null,
            CRVRoadTax: this.selectedContractAgmtData.CRVRoadTax,
            CRVAccessories: this.selectedContractAgmtData.CRVAccessories,
            Maintenance: this.selectedContractAgmtData.Maintenance,
            WithTyreBattery: this.selectedContractAgmtData.WithTyreBattery,
          });

          this.addAsAdminForm.patchValue({
            emailId: this.selectedContractAgmtData.IsAdminEmailId,
            userId: this.selectedContractAgmtData.IsAdminUserId,
            contactNumber: this.selectedContractAgmtData.IsAdminContNo,
            contactPerson: this.selectedContractAgmtData.IsAdminContPer,
            domainName: this.selectedContractAgmtData.IsAdminDomName,
            // companyCode: this.selectedContractAgmtData,
            // subDomainName: this.selectedContractAgmtData,

          });

          this.OtherFeaturesForm.patchValue({
            NServiceTaxInsurance: this.selectedContractAgmtData.NoServiceTaxOnInsurance,
            NServiceTaxRoadTax: this.selectedContractAgmtData.NoServiceTaxOnRoadTax,
            rvPrintOCF: this.selectedContractAgmtData.PrintRVonOCF,
            bookValueChart: this.selectedContractAgmtData.BookValueChart,
            RTOKit: this.selectedContractAgmtData.RTOKit,

            // eliteServices: this.selectedContractAgmtData,
            // maintRco: this.selectedContractAgmtData,
            // TLR: this.selectedContractAgmtData,

          });

          if (this.AgmtDetailsForm.value.isbounceCharge == 2) {
            let value: any = { Id: 2 };
            this.bouncingCharge(value);
          }

          this.selectedContractAgmtData.MasterAgreement == true ? this.masterAgmtSelected = true : this.masterAgmtSelected = false;


          // Segment Table
          if (res.ContractAgreementSegmentList && this.segmentTableList) {
            let list: any[] = this.segmentTableList;
            this.segmentTableList = list.map((segment: any) => {
              const matchingContractAgreementSegment = res.ContractAgreementSegmentList.find(
                (contractSegment: any) => contractSegment.SegmentId === segment.SegmentId
              );
              if (matchingContractAgreementSegment) {
                return {
                  ...segment, Id: matchingContractAgreementSegment.Id, Deviation: matchingContractAgreementSegment.Deviation, Applied: matchingContractAgreementSegment.Applied,
                };
              }

              return segment;
            });
          }

          // Parameter Table
          if (res.ContractAgrMntVarDtlList && this.parametersList) {
            this.parametersList = this.parametersList.map((parameter: any) => {
              const matchingContractAgrMntVarDtl = res.ContractAgrMntVarDtlList.find(
                (contractAgrMntVarDtl: any) => contractAgrMntVarDtl.PrmName === parameter.PrmName
              );
              if (matchingContractAgrMntVarDtl) {
                return {
                  ...parameter,
                  Id: matchingContractAgrMntVarDtl.Id,
                  VariableFactor: matchingContractAgrMntVarDtl.VariableFactor,
                };
              }

              return parameter;
            });
          }

          //ServicesTableList
          if (res.DtlContractAgreementList && this.servicesList) {
            this.servicesTableList = [];
            this.servicesList.map((item: any) => {
              res.DtlContractAgreementList.map((element: any) => {
                if (item.Id == element.ServiceId) {
                  let data = {
                    ServiceId: element.ServiceId,
                    ServiceDesc: item.ServiceDesc,
                    Deviation: element.Deviation,
                    NonMaintenance: element.NonMaintenance,
                    Id: element.Id,
                    ContractAgreId: this.contractId,
                  }
                  this.servicesTableList.push(data);
                }
              });
            });
          }

          // clientRVTableList
          if (res.QuotationRvValueList && this.clientRVTableList) {
            this.clientRVTableList = [
              {
                C1: { Month: 'Month', colId: 1, RvValue: 'RV Value', Id: 0 },
                C2: { Month: '12', colId: 2, RvValue: 0.0, Id: 0 },
                C3: { Month: '24', colId: 3, RvValue: 0.0, Id: 0 },
                C4: { Month: '36', colId: 4, RvValue: 0.0, Id: 0 },
                C5: { Month: '48', colId: 5, RvValue: 0.0, Id: 0 },
                C6: { Month: '60', colId: 6, RvValue: 0.0, Id: 0 }
              }];

            res.QuotationRvValueList.map((element: any) => {
              if (element.Month == this.clientRVTableList[0].C1.Month) {
                this.clientRVTableList[0].C1.RvValue = element.RvValue;
                this.clientRVTableList[0].C1.Id = element.Id;
              }
              else if (element.Month == this.clientRVTableList[0].C2.Month) {
                this.clientRVTableList[0].C2.RvValue = element.RvValue;
                this.clientRVTableList[0].C2.Id = element.Id;
              }
              else if (element.Month == this.clientRVTableList[0].C3.Month) {
                this.clientRVTableList[0].C3.RvValue = element.RvValue;
                this.clientRVTableList[0].C3.Id = element.Id;
              }
              else if (element.Month == this.clientRVTableList[0].C4.Month) {
                this.clientRVTableList[0].C4.RvValue = element.RvValue;
                this.clientRVTableList[0].C4.Id = element.Id;
              }
              else if (element.Month == this.clientRVTableList[0].C5.Month) {
                this.clientRVTableList[0].C5.RvValue = element.RvValue;
                this.clientRVTableList[0].C5.Id = element.Id;
              }
              else if (element.Month == this.clientRVTableList[0].C6.Month) {
                this.clientRVTableList[0].C6.RvValue = element.RvValue;
                this.clientRVTableList[0].C6.Id = element.Id;
              }
            });
          }

          // for residual value
          if (this.StandardTermsForm.value.residualValue != null) {
            if (this.StandardTermsForm.value.residualValue == 'HRV') {
              this.residHRVSelected = true;
              this.StandardTermsForm.get('CRVRoadTax')?.disable();
              this.StandardTermsForm.get('CRVAccessories')?.disable();
            }
            else {
              this.residHRVSelected = false;
              this.StandardTermsForm.get('CRVRoadTax')?.enable();
              this.StandardTermsForm.get('CRVAccessories')?.enable();
            }
          }
          this.getUserAndDriversData();

          if (this.isView || this.IsApproverView) {
            this.AgmtDetailsForm.disable();
            this.ContinuationForm.disable();
            this.StandardTermsForm.disable();
            this.addAsAdminForm.disable();
            this.OtherFeaturesForm.disable();
            this.addServiceForm.disable();
            this.adminForm.disable();
          }
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

  getusersList() {
    const data =
    {
      Page:
      {
        PageNumber: 0,
        PageSize: 0,
        Filter: {
          UserName: "",
          CityName: "",
          DeviationRights: "",
          CreatedById: ""
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getUser(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.bdmManagerList = res.Records;
          this.relManagerList = res.Records;
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

  getUserAndDriversData() {
    this.spinner.show();
    this.clientService.getDriversByClientId(this.ClientId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.DriversUsersList = res.Rows;
          this.spinner.hide();
        }
        else {
          // this.toaster.error(res?.Errors[0]?.Message, undefined, {
          //   positionClass: 'toast-top-center'
          // });
          this.spinner.hide();
        }
      }
      (err: any) => {
        // this.toaster.error(err, undefined, {
        //   positionClass: 'toast-top-center'
        // });
        this.spinner.hide();
      }
    });
  }

  getAllCity() {
    const data =
      { Page: { PageNumber: 0, PageSize: 0 } }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllCity(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.sourcingLocList = res.Records;
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

  tabClick(event: any) {
    this.selectedtab = event.index
    if (this.selectedtab == 3 && this.adminTableList.length == 0) {
      this.addNewRow();
    }

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
      let Child5 = Childs[4];

      // let childArray: any[] = [Child1, Child2, Child3, Child4, Child5];
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

  masterToggle(event: boolean) {
    if (event) {
      this.masterAgmtSelected = true;
      this.AgmtDetailsForm.get('subscription')?.reset();
    }
    else {
      this.masterAgmtSelected = false;
      this.AgmtDetailsForm.get('subscription')?.reset();
    }

  }

  selectClient(event: any) {
    this.ClientId = event.Id;
    this.addAsAdminForm.get('companyCode')?.setValue(event.Id);
    this.addAsAdminForm.get('emailId')?.setValue(event.EmailId1);
    this.addAsAdminForm.get('companyCode')?.disable();
    this.addAsAdminForm.get('emailId')?.disable();
    this.getUserAndDriversData();
  }

  bouncingCharge(event: any) {
    this.AgmtDetailsForm.get('bounceChargeValue')?.reset();
    if (event.Id == 1) {
      this.IsBounceChargeApplied = true;
      this.AgmtDetailsForm.get('bounceChargeValue')?.enable();
      this.AgmtDetailsForm.get('bounceChargeValue')?.setValidators([Validators.required]);
      this.AgmtDetailsForm.get('bounceChargeValue')?.updateValueAndValidity();
      this.AgmtDetailsForm.get('bounceChargeValue')?.markAsTouched();
    } else {
      this.IsBounceChargeApplied = false;
      this.AgmtDetailsForm.get('bounceChargeValue')?.setValidators(null);
      this.AgmtDetailsForm.get('bounceChargeValue')?.setErrors(null);
      this.AgmtDetailsForm.get('bounceChargeValue')?.updateValueAndValidity();
      this.AgmtDetailsForm.get('bounceChargeValue')?.markAsTouched();
    }

  }

  managemtFee(event: any) {
    if (event.type == 'Fixed Charges') {
      this.isMFeeApplied = true;
      this.ContinuationForm.get('managementFeeFixed')?.reset('');
      this.ContinuationForm.get('managementFeeFixed')?.enable();
    } else {
      this.isMFeeApplied = false;
      this.ContinuationForm.get('managementFeeFixed')?.reset('');
      // this.ContinuationForm.get('managementFeeFixed')?.disable();
    }
  }

  residValue(event: any) {
    if (event.type == 'HRV') {
      this.residHRVSelected = true;
      this.StandardTermsForm.get('CSNetPrice')?.reset(null);
      this.StandardTermsForm.get('roadTaxAccessories')?.reset();

      this.StandardTermsForm.get('CRVRoadTax')?.disable();
      this.StandardTermsForm.get('CRVAccessories')?.disable();
    } else {
      this.residHRVSelected = false;
      this.StandardTermsForm.get('CSNetPrice')?.reset(null);
      this.StandardTermsForm.get('roadTaxAccessories')?.reset();
      this.StandardTermsForm.get('CRVRoadTax')?.enable();
      this.StandardTermsForm.get('CRVAccessories')?.enable();

    }
  }

  insuranceValue(event: any) {
    if (event.type == 'Only Third Party' || event.type == 'All Year Financed') {
      this.insurTypSelected = true;
      this.ContinuationForm.get('inFavourOf')?.reset(null);
    } else {
      this.insurTypSelected = false;
      this.ContinuationForm.get('inFavourOf')?.reset(null);
    }
  }

  // cancel() {
  //   this.AgmtDetailsForm.reset(defaultValues);
  //   this.isView = false;
  //   this.insurTypSelected = false;
  //   this.residHRVSelected = false;
  //   this.AgmtDetailsForm.get('brokerageValue')?.setValue(0.00);
  //   this.AgmtDetailsForm.get('cAgCode')?.disable();
  //   this.AgmtDetailsForm.get('agmtNo')?.disable();

  //   this.servicesTableList = [];
  //   this.segmentTableList.map(item => {
  //     item.Deviation = 0.0;
  //     item.Applied = 0.0;
  //   });
  //   this.parametersList.map(item => {
  //     item.VariableFactor = "0.0";
  //   });
  //   this.clientRVTableList = [
  //     {
  //       C1: { Month: 'Month', colId: 1, RvValue: 'RV Value' },
  //       C2: { Month: '12', colId: 2, RvValue: 0.0 },
  //       C3: { Month: '24', colId: 3, RvValue: 0.0 },
  //       C4: { Month: '36', colId: 4, RvValue: 0.0 },
  //       C5: { Month: '48', colId: 5, RvValue: 0.0 },
  //       C6: { Month: '60', colId: 6, RvValue: 0.0 }
  //     }];
  // }

  devtApplied(element: any, event: Event) {
    let target: any = event.target;
    this.segmentTableList.map(item => {
      if (item.segType == element.segType) {
        if (target.innerText) {
          item.Deviation = parseFloat(target.innerText);
          item.Applied = parseFloat(target.innerText) + parseFloat(element.Standard);
        }
        else {
          item.Deviation = 0;
          item.Applied = parseFloat(element.Standard);
        }
      }
    });
  }

  selectService(event: any) {
    this.selectedService = event;
  }

  AddServiceData() {
    this.isServiceFormSubmitted = true;
    if (this.addServiceForm.status == 'VALID') {
      let serviceData: any = {
        ServiceId: this.selectedService.Id,
        ServiceDesc: this.selectedService.ServiceDesc,
        Deviation: parseFloat(this.addServiceForm.value.deviationPerMonth),
        NonMaintenance: this.addServiceForm.value.usedInNonMaint,
      }
      if (this.servicesTableList.length == 0) {
        this.servicesTableList.push(serviceData);
        this.serviceTable.renderRows();
      }
      else {
        let isServiceDataExist = this.servicesTableList.some(item =>
          item.ServiceId == serviceData.ServiceId &&
          item.ServiceDesc == serviceData.ServiceDesc &&
          item.Deviation == serviceData.Deviation &&
          item.NonMaintenance == serviceData.NonMaintenance
        );
        if (!isServiceDataExist) {
          this.servicesTableList.push(serviceData);
          this.serviceTable.renderRows();
        }
      }
    }

  }

  removeServiceData(element: any) {
    if (!this.editMode) {
      this.servicesTableList.map((item, index) => {
        if (item == element) {
          this.servicesTableList.splice(index, 1);
        }
      });
      this.serviceTable.renderRows();
    }
    else if (this.editMode) {
      if (this.DtlContractAgreementList) {
        this.DtlContractAgreementList.map((item: any) => {
          if (item.Id == element.Id) {
            this.deleteCAService(item.Id);
          }
        });
      }

      this.servicesTableList.map((item, index) => {
        if (item == element) {
          this.servicesTableList.splice(index, 1);
        }
      });
      this.serviceTable.renderRows();
    }


  }

  deleteCAService(id: any) {
    this.spinner.show();
    this.clientService.deleteCAService(id).subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {
          this.toaster.success("Service Deleted Successfully.", undefined, {
            positionClass: 'toast-top-center'
          });
          // this.router.navigate(["/contract-agreement"], {
          //   state: {
          //     level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
          //   }
          // });
          this.getContAgrmtById(this.contractId);
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

  createAdmin() {

  }

  updateDomain() {

  }

  onEditVarFactor(element: any, event: any) {
    let target: any = event.target;
    this.parametersList.map(item => {
      if (item.PrmName == element.PrmName) {
        item.VariableFactor = target.innerText;
      }
    });
  }

  onEditClientRV(element: any, event: any, colId: any) {
    let target: any = event.target;
    this.clientRVTableList.map((item: any) => {
      if (item.C2.colId == colId) {
        item.C2.RvValue = target.innerText;
      }
      else if (item.C3.colId == colId) {
        item.C3.RvValue = target.innerText;
      }
      else if (item.C4.colId == colId) {
        item.C4.RvValue = target.innerText;
      }
      else if (item.C5.colId == colId) {
        item.C5.RvValue = target.innerText;
      }
      else if (item.C6.colId == colId) {
        item.C6.RvValue = target.innerText;
      }
    });
  }

  saveAdmin() {
    this.adminFormsubmitted = true;
    if (this.adminForm.status == 'VALID') {
      this.adminTableList.map((item: any) => {
        item.selected = true;
        this.adminFormsubmitted = false;
      });
      this.adminSaved = true;
      // this.addNewRow();
      this.adminTable.renderRows();
    }
  }

  selectStage(event: any, element: any) {
    this.adminTableList.map((item: any) => {
      if (item.srNo == element.srNo) {
        item.apLevel = event.apLevel;
      }
    })
  }

  selectAdmin(event: any, element: any) {
    this.adminTableList.map((item: any) => {
      if (item.srNo == element.srNo) {
        item.userName = event.FName;
      }
    });
  }

  removeAdminData(element: any) {
    this.adminTableList.map((item: any, index: any) => {
      if (item.srNo == element.srNo) {
        this.adminTableList.splice(index, 1);
      }
    });
    this.adminTableList.map((item: any, index: any) => {
      item.srNo = index + 1;
    });
    this.adminTable.renderRows();
  }

  transformDataforAdd(clientRVTableList: any[]): any[] {
    const quotationrvvalue = [];

    for (const key in clientRVTableList[0]) {
      if (key.startsWith('C') && key !== 'C1') {
        const value = clientRVTableList[0][key];
        quotationrvvalue.push({
          'Month': value['Month'],
          'RvValue': parseFloat(value['RvValue']),
        });
      }
    }

    return quotationrvvalue;
  }

  transformDataforUpdate(clientRVTableList: any[]): any[] {
    const quotationrvvalue = [];

    for (const key in clientRVTableList[0]) {
      if (key.startsWith('C') && key !== 'C1') {
        const value = clientRVTableList[0][key];
        quotationrvvalue.push({
          'Month': value['Month'],
          'RvValue': parseFloat(value['RvValue']),
          'Id': value['Id'],
        });
      }
    }

    return quotationrvvalue;
  }

  addNewRow() {
    this.adminForm.reset(adminTableFormValues);
    this.adminSaved = false;
    this.index = this.adminTableList.length + 1;
    let data: any = {
      srNo: this.index,
      userName: `<form *ngIf="!element.selected" [formGroup]="adminForm">
      <div class="tagus-form-group without-icon">
        <ng-select dropdownPosition="bottom" formControlName="userName"
          placeholder="Select User" class="dropdown" bindLabel="FName"
          bindValue="Id" [items]="DriversUsersList" [appendTo]="'body'"
          [clearable]="false" (change)="selectAdmin($event,element)" #userNameDropdown (window:scroll)="userNameDropdown.close()" [ngClass]="userNameDropdown.hasValue || userNameDropdown.isOpen?'placeholder-padding':''">
        </ng-select>
      </div>
    </form>`,
      approvalStage: `<form *ngIf="!element.selected" [formGroup]="adminForm">
      <div class="tagus-form-group without-icon">
        <ng-select dropdownPosition="bottom" formControlName="apvlLevel"
          placeholder="Approval Stage" class="dropdown" bindLabel="apLevel"
          bindValue="apStage" [items]="approvalStageList" [appendTo]="'body'"
          [clearable]="false" (change)="selectStage($event,element)" #apvlLevelDropdown (window:scroll)="apvlLevelDropdown.close()" [ngClass]="apvlLevelDropdown.hasValue || apvlLevelDropdown.isOpen?'placeholder-padding':''">
        </ng-select>
      </div>
    </form>`, selectd: false
    };
    this.adminTableList.push(data);
    if (this.adminTable) {
      this.adminTable.renderRows();
    }
  }

  createUsersDrivers() {
    this.router.navigate(["/create-usersAndDrivers"], {
      state: { level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail }
    })
  }

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-MM-dd HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  addContract() {
    this.submitted = true;
    this.AgmtDetailsFormSubmitted = true;
    this.ContinuationFormSubmitted = true;
    this.StandardTermsFormSubmitted = true;
    this.addAsAdminFormSubmitted = true;
    this.OtherFeaturesFormSubmitted = true;

    console.log(this.AgmtDetailsForm);
    let modifiedservicesTableList = this.servicesTableList.map(({ ServiceDesc, ...rest }) => rest);
    let modifiedParameterList = this.parametersList.map(({ srNo, ...rest }) => rest);
    let quotationrvvalue = this.transformDataforAdd(this.clientRVTableList);
    let moedifiedAdminTable = this.adminTableList.map((item, index) => {
      if (item.userName = `<form *ngIf="!element.selected" [formGroup]="adminForm">
      <div class="tagus-form-group without-icon">
        <ng-select dropdownPosition="bottom" formControlName="userName"
          placeholder="Select User" class="dropdown" bindLabel="FName"
          bindValue="Id" [items]="DriversUsersList" [appendTo]="'body'"
          [clearable]="false" (change)="selectAdmin($event,element)" #userNameDropdown (window:scroll)="userNameDropdown.close()" [ngClass]="userNameDropdown.hasValue || userNameDropdown.isOpen?'placeholder-padding':''">
        </ng-select>
      </div>
    </form>`
        || item.approvalStage == `<form *ngIf="!element.selected" [formGroup]="adminForm">
    <div class="tagus-form-group without-icon">
      <ng-select dropdownPosition="bottom" formControlName="apvlLevel"
        placeholder="Approval Stage" class="dropdown" bindLabel="apLevel"
        bindValue="apStage" [items]="approvalStageList" [appendTo]="'body'"
        [clearable]="false" (change)="selectStage($event,element)" #apvlLevelDropdown (window:scroll)="apvlLevelDropdown.close()" [ngClass]="apvlLevelDropdown.hasValue || apvlLevelDropdown.isOpen?'placeholder-padding':''">
      </ng-select>
    </div>
  </form>`) {
        this.adminTableList.splice(index, 1)
      }
    });

    let FilteredAdminTable = moedifiedAdminTable.filter(item => item !== undefined);

    if (this.AgmtDetailsForm.status == 'VALID' && this.ContinuationForm.status == 'VALID' && this.StandardTermsForm.status == 'VALID' && this.addAsAdminForm.status == 'VALID' && this.OtherFeaturesForm.status == 'VALID') {
      const data = {
        CreatedById: this.currentUser.UserId,

        ClientId: this.AgmtDetailsForm.value.clientName,
        ProspectId: this.AgmtDetailsForm.value.clientName,
        ProductId: this.AgmtDetailsForm.value.leaseType,
        ObjectId: this.AgmtDetailsForm.value.objectType,
        AccountManagerId: this.AgmtDetailsForm.value.relManager,
        AgreementDate: this.AgmtDetailsForm.value.agmtDate ? this.formatDateInISO(this.AgmtDetailsForm.value.agmtDate) : '',
        MasterAgreement: this.AgmtDetailsForm.value.masterAgreement,
        IsBouncingCharges: this.AgmtDetailsForm.value.isbounceCharge,
        BouncingCharges: parseFloat(this.AgmtDetailsForm.value.bounceChargeValue), // decimal
        MiscCost: parseFloat(this.AgmtDetailsForm.value.miscCost),  // decimal
        PenelInterest: parseFloat(this.AgmtDetailsForm.value.penalInterest),  // decimal
        AssetActivation: this.AgmtDetailsForm.value.aActDate,
        MasterAgreementId: this.AgmtDetailsForm.value.subscription,
        SourceLocation: this.AgmtDetailsForm.value.sourcingLoc,
        SalesManagerId: this.AgmtDetailsForm.value.bdmManager,
        Particular: this.AgmtDetailsForm.value.contRemark,
        PaymentType: this.AgmtDetailsForm.value.paymentType,
        CancelCharges: parseFloat(this.AgmtDetailsForm.value.cancelCharges),  // decimal
        ARAD: this.AgmtDetailsForm.value.paymentMode,
        RegisterOwner: this.AgmtDetailsForm.value.registerOwner,
        ForeClosureCharges: parseFloat(this.AgmtDetailsForm.value.forCloseCharges),  // decimal
        ForClosureInterest: this.AgmtDetailsForm.value.fixedValue,
        IsOnline: this.AgmtDetailsForm.value.isOnline,
        FixDiscount: parseFloat(this.AgmtDetailsForm.value.discRate),  // decimal
        StandardAccessory: this.AgmtDetailsForm.value.Stdaccessories,

        InsManage: this.ContinuationForm.value.insuranceManage,
        FirstYearDiscPerc: parseFloat(this.ContinuationForm.value.firstYDisc),  // decimal
        RestYearDiscPerc: parseFloat(this.ContinuationForm.value.restYDisc),  // decimal
        RtManage: this.ContinuationForm.value.roadTaxManage,
        InsType: this.ContinuationForm.value.insuranceType,
        InFavourReimbursed: this.ContinuationForm.value.inFavourOf,
        RtType: this.ContinuationForm.value.roadTaxType,
        MgmtFeeType: this.ContinuationForm.value.managementFeeType,
        MgmtFixCharge: parseFloat(this.ContinuationForm.value.managementFeeFixed), // decimal
        contractagreementsegment: this.segmentTableList,// table


        MaintenanceOpen: this.StandardTermsForm.value.openCalculation,
        ClientOption: this.StandardTermsForm.value.clientFirstOption,
        DownPayment: this.StandardTermsForm.value.downPayment,
        RmtbDeviation: parseFloat(this.StandardTermsForm.value.rmtbValue),  // decimal
        RvDeviation: parseFloat(this.StandardTermsForm.value.rvValue),  // decimal
        InterestDeviation: parseFloat(this.StandardTermsForm.value.interestValue),  // decimal
        VatInterest: parseFloat(this.StandardTermsForm.value.fixedInterestValue),  // decimal
        ClientRv: parseFloat(this.StandardTermsForm.value.clientSpRv),  // decimal
        OEMAmount: parseFloat(this.StandardTermsForm.value.monthlyPayToOEM),  // decimal
        MODeviation: parseFloat(this.StandardTermsForm.value.specMOValue),  // decimal
        Brokerage: parseFloat(this.StandardTermsForm.value.brokerage),  // decimal
        BrokeragePercentage: parseFloat(this.StandardTermsForm.value.brokerageValue),  // decimal
        RvType: this.StandardTermsForm.value.residualValue,
        CRVNetPrice: this.StandardTermsForm.value.CSNetPrice,
        CRVRoadTax: this.StandardTermsForm.value.CRVRoadTax,
        CRVAccessories: this.StandardTermsForm.value.CRVAccessories,
        Maintenance: this.StandardTermsForm.value.Maintenance,
        WithTyreBattery: this.StandardTermsForm.value.WithTyreBattery,
        dtlcontractagreement: modifiedservicesTableList, // table
        contractagrmntvardtl: modifiedParameterList,  // table


        IsAdminEmailId: this.addAsAdminForm.value.emailId,
        IsAdminUserId: this.addAsAdminForm.value.userId,
        IsAdminContNo: this.addAsAdminForm.value.contactNumber,
        IsAdminContPer: this.addAsAdminForm.value.IsAdminContPer,
        IsAdminDomName: this.addAsAdminForm.value.domainName,
        adminapproval: FilteredAdminTable != null ? FilteredAdminTable : [], // table

        NoServiceTaxOnRoadTax: this.OtherFeaturesForm.value.NServiceTaxRoadTax,
        NoServiceTaxOnInsurance: this.OtherFeaturesForm.value.NServiceTaxInsurance,
        PrintRVonOCF: this.OtherFeaturesForm.value.rvPrintOCF,
        BookValueChart: this.OtherFeaturesForm.value.bookValueChart,
        RTOKit: this.OtherFeaturesForm.value.RTOKit,
        quotationrvvalue: quotationrvvalue, // table


        // AgreementNo: "",

        AgreementDate1: "",
        FcInterestDev: 0.0,
        InsReimburseTo: 1,
        RtReimburseTo: 1,
        StdMgmtFee: 1,
        MgmtFee: 1,
        MgmtDevAllowed: 1,
        IsApproved: false,
        ApproveBy: "",
        ApprovedDate: "",
        Dormant: false,
        IsAdmin: false,
        IndvRoadTax: 1,
        DisplayRV: 1,
        InsOpted: 1,
        HeadingOnDO: "",

      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.addContract(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Contract agrrement Added Successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/contract-agreement"], {
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

  updateContract() {

    this.submitted = true;
    this.AgmtDetailsFormSubmitted = true;
    this.ContinuationFormSubmitted = true;
    this.StandardTermsFormSubmitted = true;
    this.addAsAdminFormSubmitted = true;
    this.OtherFeaturesFormSubmitted = true;

    console.log(this.AgmtDetailsForm);
    let modifiedservicesTableList = this.servicesTableList.map(({ ServiceDesc, ...rest }) => rest);
    let modifiedParameterList = this.parametersList.map(({ srNo, ...rest }) => rest);
    let quotationrvvalue = this.transformDataforUpdate(this.clientRVTableList);
    let moedifiedAdminTable = this.adminTableList.map((item, index) => {
      if (item.userName = `<form *ngIf="!element.selected" [formGroup]="adminForm">
      <div class="tagus-form-group without-icon">
        <ng-select dropdownPosition="bottom" formControlName="userName"
          placeholder="Select User" class="dropdown" bindLabel="FName"
          bindValue="Id" [items]="DriversUsersList" [appendTo]="'body'"
          [clearable]="false" (change)="selectAdmin($event,element)" #userNameDropdown (window:scroll)="userNameDropdown.close()" [ngClass]="userNameDropdown.hasValue || userNameDropdown.isOpen?'placeholder-padding':''">
        </ng-select>
      </div>
    </form>`
        || item.approvalStage == `<form *ngIf="!element.selected" [formGroup]="adminForm">
    <div class="tagus-form-group without-icon">
      <ng-select dropdownPosition="bottom" formControlName="apvlLevel"
        placeholder="Approval Stage" class="dropdown" bindLabel="apLevel"
        bindValue="apStage" [items]="approvalStageList" [appendTo]="'body'"
        [clearable]="false" (change)="selectStage($event,element)" #apvlLevelDropdown (window:scroll)="apvlLevelDropdown.close()" [ngClass]="apvlLevelDropdown.hasValue || apvlLevelDropdown.isOpen?'placeholder-padding':''">
      </ng-select>
    </div>
  </form>`) {
        this.adminTableList.splice(index, 1)
      }
    });

    let FilteredAdminTable = moedifiedAdminTable.filter(item => item !== undefined);

    if (this.AgmtDetailsForm.status == 'VALID' && this.ContinuationForm.status == 'VALID' && this.StandardTermsForm.status == 'VALID' && this.addAsAdminForm.status == 'VALID' && this.OtherFeaturesForm.status == 'VALID') {
      const data = {
        Id: this.contractId,
        ModifiedById: this.currentUser.UserId,

        ClientId: this.AgmtDetailsForm.value.clientName,
        ProspectId: this.AgmtDetailsForm.value.clientName,
        ProductId: this.AgmtDetailsForm.value.leaseType,
        ObjectId: this.AgmtDetailsForm.value.objectType,
        AccountManagerId: this.AgmtDetailsForm.value.relManager,
        AgreementDate: this.AgmtDetailsForm.value.agmtDate ? this.agmtDateChanged ? this.formatDateInISO(this.AgmtDetailsForm.value.agmtDate) : this.formatDateInISO(this.AgmtDetailsForm.value.agmtDate) : '',
        MasterAgreement: this.AgmtDetailsForm.value.masterAgreement,
        IsBouncingCharges: this.AgmtDetailsForm.value.isbounceCharge,
        BouncingCharges: parseFloat(this.AgmtDetailsForm.value.bounceChargeValue), // decimal
        MiscCost: parseFloat(this.AgmtDetailsForm.value.miscCost),  // decimal
        PenelInterest: parseFloat(this.AgmtDetailsForm.value.penalInterest),  // decimal
        AssetActivation: this.AgmtDetailsForm.value.aActDate,
        MasterAgreementId: this.AgmtDetailsForm.value.subscription,
        SourceLocation: this.AgmtDetailsForm.value.sourcingLoc,
        SalesManagerId: this.AgmtDetailsForm.value.bdmManager,
        Particular: this.AgmtDetailsForm.value.contRemark,
        PaymentType: this.AgmtDetailsForm.value.paymentType,
        CancelCharges: parseFloat(this.AgmtDetailsForm.value.cancelCharges),  // decimal
        ARAD: this.AgmtDetailsForm.value.paymentMode,
        RegisterOwner: this.AgmtDetailsForm.value.registerOwner,
        ForeClosureCharges: parseFloat(this.AgmtDetailsForm.value.forCloseCharges),  // decimal
        ForClosureInterest: this.AgmtDetailsForm.value.fixedValue,
        IsOnline: this.AgmtDetailsForm.value.isOnline,
        FixDiscount: parseFloat(this.AgmtDetailsForm.value.discRate),  // decimal
        StandardAccessory: this.AgmtDetailsForm.value.Stdaccessories,

        InsManage: this.ContinuationForm.value.insuranceManage,
        FirstYearDiscPerc: parseFloat(this.ContinuationForm.value.firstYDisc),  // decimal
        RestYearDiscPerc: parseFloat(this.ContinuationForm.value.restYDisc),  // decimal
        RtManage: this.ContinuationForm.value.roadTaxManage,
        InsType: this.ContinuationForm.value.insuranceType,
        InFavourReimbursed: this.ContinuationForm.value.inFavourOf,
        RtType: this.ContinuationForm.value.roadTaxType,
        MgmtFeeType: this.ContinuationForm.value.managementFeeType,
        MgmtFixCharge: parseFloat(this.ContinuationForm.value.managementFeeFixed), // decimal
        contractagreementsegment: this.segmentTableList,// table

        MaintenanceOpen: this.StandardTermsForm.value.openCalculation,
        ClientOption: this.StandardTermsForm.value.clientFirstOption,
        DownPayment: this.StandardTermsForm.value.downPayment,
        RmtbDeviation: parseFloat(this.StandardTermsForm.value.rmtbValue),  // decimal
        RvDeviation: parseFloat(this.StandardTermsForm.value.rvValue),  // decimal
        InterestDeviation: parseFloat(this.StandardTermsForm.value.interestValue),  // decimal
        VatInterest: parseFloat(this.StandardTermsForm.value.fixedInterestValue),  // decimal
        ClientRv: parseFloat(this.StandardTermsForm.value.clientSpRv),  // decimal
        OEMAmount: parseFloat(this.StandardTermsForm.value.monthlyPayToOEM),  // decimal
        MODeviation: parseFloat(this.StandardTermsForm.value.specMOValue),  // decimal
        Brokerage: parseFloat(this.StandardTermsForm.value.brokerage),  // decimal
        BrokeragePercentage: parseFloat(this.StandardTermsForm.value.brokerageValue),  // decimal
        RvType: this.StandardTermsForm.value.residualValue,
        CRVNetPrice: this.StandardTermsForm.value.CSNetPrice,
        CRVRoadTax: this.StandardTermsForm.value.CRVRoadTax,
        CRVAccessories: this.StandardTermsForm.value.CRVAccessories,
        Maintenance: this.StandardTermsForm.value.Maintenance,
        WithTyreBattery: this.StandardTermsForm.value.WithTyreBattery,
        dtlcontractagreement: modifiedservicesTableList, // table
        contractagrmntvardtl: modifiedParameterList,  // table

        IsAdminEmailId: this.addAsAdminForm.value.emailId,
        IsAdminUserId: this.addAsAdminForm.value.userId,
        IsAdminContNo: this.addAsAdminForm.value.contactNumber,
        IsAdminContPer: this.addAsAdminForm.value.IsAdminContPer,
        IsAdminDomName: this.addAsAdminForm.value.domainName,
        adminapproval: FilteredAdminTable != null ? FilteredAdminTable : [], // table

        NoServiceTaxOnRoadTax: this.OtherFeaturesForm.value.NServiceTaxRoadTax,
        NoServiceTaxOnInsurance: this.OtherFeaturesForm.value.NServiceTaxInsurance,
        PrintRVonOCF: this.OtherFeaturesForm.value.rvPrintOCF,
        BookValueChart: this.OtherFeaturesForm.value.bookValueChart,
        RTOKit: this.OtherFeaturesForm.value.RTOKit,
        quotationrvvalue: quotationrvvalue, // table


        AgreementNo: this.selectedContractAgmtData.AgreementNo,
        AgreementDate1: "",
        FcInterestDev: 0.0,
        InsReimburseTo: 1,
        RtReimburseTo: 1,
        StdMgmtFee: 1,
        MgmtFee: 1,
        MgmtDevAllowed: 1,

        IsApproved: false,
        ApproveBy: "",
        ApprovedDate: "",
        Dormant: false,
        IsAdmin: false,

        IndvRoadTax: 1,
        DisplayRV: 1,
        InsOpted: 1,
        HeadingOnDO: "",



      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.updateContract(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Contract agreement updated Successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/contract-agreement"], {
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
    this.agmtDateChanged = false;
    this.isServiceFormSubmitted = false;
    this.adminFormsubmitted = false;
    this.AgmtDetailsFormSubmitted = false;
    this.ContinuationFormSubmitted = false;
    this.StandardTermsFormSubmitted = false;
    this.addAsAdminFormSubmitted = false;
    this.OtherFeaturesFormSubmitted = false;
    this.isView = false;
    this.IsApproverView = false;

    this.AgmtDetailsForm.reset(CAgmtValues);
    this.AgmtDetailsForm.markAllAsTouched();
    this.ContinuationForm.reset(continuationValues);
    this.ContinuationForm.markAllAsTouched();
    this.StandardTermsForm.reset(standardValues);
    this.StandardTermsForm.markAllAsTouched();
    this.addAsAdminForm.reset(adminValues);
    this.addAsAdminForm.markAllAsTouched();
    this.OtherFeaturesForm.reset(otherFeaturesValues);
    this.OtherFeaturesForm.markAllAsTouched();

    this.addServiceForm.reset(serviceTableFormValues);
    this.addServiceForm.markAllAsTouched();
    this.addAsAdminForm.reset(adminTableFormValues);
    this.addAsAdminForm.markAllAsTouched();
    this.isView = false;
    this.insurTypSelected = false;
    this.residHRVSelected = false;
    this.StandardTermsForm.get('brokerageValue')?.setValue(0.00);
    this.AgmtDetailsForm.get('cAgCode')?.disable();
    this.AgmtDetailsForm.get('agmtNo')?.disable();

    this.servicesTableList = [];

    this.segmentTableList = [
      { SegmentId: 14, segType: 'Segment A', Standard: 400, Deviation: 0.0, Applied: 0.0 },
      { SegmentId: 15, segType: 'Segment B', Standard: 600, Deviation: 0.0, Applied: 0.0 },
      { SegmentId: 17, segType: 'Segment C', Standard: 600, Deviation: 0.0, Applied: 0.0 },
      { SegmentId: 18, segType: 'Segment C-Upper', Standard: 600, Deviation: 0.0, Applied: 0.0 },
      { SegmentId: 19, segType: 'Segment D', Standard: 1000, Deviation: 0.0, Applied: 0.0 },
      { SegmentId: 20, segType: 'Segment E', Standard: 2000, Deviation: 0.0, Applied: 0.0 },
    ];

    this.parametersList = [
      { srNo: '01', PrmName: 'Reimbursement Amount', VariableFactor: "0.0", },
      { srNo: '02', PrmName: 'Time period to trigger this clause', VariableFactor: "0.0" },
      { srNo: '03', PrmName: 'Accidental Case Coverage', VariableFactor: "0.0" },
      { srNo: '04', PrmName: 'Reimbursement to', VariableFactor: "0.0" },
      { srNo: '05', PrmName: 'Per day amount', VariableFactor: "0.0" },
    ];

    this.clientRVTableList = [
      {
        C1: { Month: 'Month', colId: 1, RvValue: 'RV Value' },
        C2: { Month: '12', colId: 2, RvValue: 0.0 },
        C3: { Month: '24', colId: 3, RvValue: 0.0 },
        C4: { Month: '36', colId: 4, RvValue: 0.0 },
        C5: { Month: '48', colId: 5, RvValue: 0.0 },
        C6: { Month: '60', colId: 6, RvValue: 0.0 }
      }];

    if (this.DropdownData.SegmentList) {
      this.segmentTableList.map(item => {
        this.DropdownData.SegmentList.map((element: any) => {
          if (item.segType == element.GeneralDescription) {
            item.SegmentId = element.Id;
          }
        });
      })
    }
    if (this.segmentTable) {
      this.segmentTable.renderRows();
    }
  }

  moveToNextTab() {
    this.submitted = true;
    if (this.selectedtab == 0) {
      this.AgmtDetailsFormSubmitted = true;
      if (this.AgmtDetailsForm.status == 'VALID') {
        this.selectedtab = 1;
      }
    }
    else if (this.selectedtab == 1) {
      this.ContinuationFormSubmitted = true;
      if (this.ContinuationForm.status == 'VALID') {
        this.selectedtab = 2;
      }
    }
    else if (this.selectedtab == 2) {
      this.StandardTermsFormSubmitted = true;
      if (this.StandardTermsForm.status == 'VALID') {
        this.selectedtab = 3;
      }
    }
    else if (this.selectedtab == 3) {
      this.addAsAdminFormSubmitted = true;
      if (this.addAsAdminForm.status == 'VALID') {
        this.selectedtab = 4;
      }
    }
  }

  onDateChange(event: any, field: any) {
    if (field == 'agmtDate') {
      this.agmtDateChanged = true;
    }
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.contractId, Name: this.selectedContractAgmtData.ClientName, moduleName: 'create-contract-agreement' }
    });
  }


  announceSortChange(sortState: Sort, tableName: any) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      if (tableName == 'segmentTable') {
        this.segmentTableList = this.commonService.customSort(this.segmentTableList, sortState.active, sortState.direction);
        this.segmentTable.renderRows();
      }
      else if (tableName == 'serviceTable') {
        this.servicesTableList = this.commonService.customSort(this.servicesTableList, sortState.active, sortState.direction);
        this.serviceTable.renderRows();
      }
      else if (tableName == 'parameterTable') {
        this.parametersList = this.commonService.customSort(this.parametersList, sortState.active, sortState.direction);
        this.parameterTable.renderRows();
      }
      else if (tableName == 'adminTable') {
        this.adminTableList = this.commonService.customSort(this.adminTableList, sortState.active, sortState.direction);
        this.adminTable.renderRows();
      }
      else if (tableName == 'clientRVTable') {
        this.clientRVTableList = this.commonService.customSort(this.clientRVTableList, sortState.active, sortState.direction);
        this.clientRVTable.renderRows();
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

let CAgmtValues = {

  masterAgreement: false,
  clientName: null,
  relManager: null,
  agmtDate: '',
  isbounceCharge: null,
  bounceChargeValue: '',
  cAgCode: '',
  miscCost: '',
  industryType: null,
  subscription: null,
  penalInterest: '',
  leaseType: null,
  sicCode: '',
  agmtNo: '',
  objectType: null,
  sourcingLoc: null,
  bdmManager: null,
  contRemark: '',
  paymentType: null,
  paymentMode: null,
  registerOwner: null,
  aActDate: null,
  cancelCharges: '',
  forCloseCharges: '',
  fixedValue: '',
  discRate: '',
  isOnline: false,
  Stdaccessories: [],
}
let continuationValues = {
  insuranceManage: false,
  firstYDisc: '',
  restYDisc: '',
  roadTaxManage: false,
  insuranceType: null,
  inFavourOf: null,
  roadTaxType: null,
  managementFeeType: null,
  managementFeeFixed: '',

}
let standardValues = {
  openCalculation: false,
  clientFirstOption: false,
  downPayment: false,
  rmtbValue: '',
  rvValue: '',
  interestValue: '',
  fixedInterestValue: null,
  clientSpRv: null,
  monthlyPayToOEM: '',
  specMOValue: '',
  brokerage: '',
  brokerageValue: null,
  residualValue: null,
  CSNetPrice: null,
  CRVRoadTax: false,
  CRVAccessories: false,
  Maintenance: false,
  WithTyreBattery: false,
}
let adminValues = {
  companyCode: '',
  emailId: '',
  userId: '',
  contactNumber: '',
  contactPerson: '',
  domainName: '',
  subDomainName: '',
}
let otherFeaturesValues = {
  eliteServices: false,
  maintRco: false,
  NServiceTaxInsurance: false,
  NServiceTaxRoadTax: false,
  rvPrintOCF: false,
  bookValueChart: false,
  TLR: false,
  RTOKit: false,
}

let serviceTableFormValues = {
  serviceOffered: null,
  deviationPerMonth: '',
  usedInNonMaint: false,
};

let adminTableFormValues = {
  userName: null,
  apvlLevel: null,
};