import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-add-city',
  templateUrl: './add-city.component.html',
  styleUrls: ['./add-city.component.scss']
})
export class AddCityComponent {
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

  addCityForm!: FormGroup;
  submitted: boolean = false;
  isView: boolean = false;
  editMode: boolean = false;
  CityId = 0;
  CityAddressId = 0;
  selectedCityData: any;
  stateList: any;
  regionList: any;
  insZoneUpto6List: any;
  insZoneMoreThan6List: any;
  SMASCityApplList: any;
  cityDropdowns: any;
  emissionList = [1, 2, 3, 4, 5, 6];
  servicesList: any;
  IsApproverView: boolean = false;
  TransactionId: number = 0;

  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private clientService: ClientService,
    private toaster: ToastrService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    public location: Location,
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
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
      this.CityId = history.state.id;

      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getCityById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getCityById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getCityById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.addCityForm = new FormGroup({
      cityCode: new FormControl(''),
      cityName: new FormControl('', [Validators.required]),
      StateName: new FormControl(null, [Validators.required]),
      InsZoneSeatUpto: new FormControl(null, [Validators.required]),
      InsZoneSeatMorethan: new FormControl(null, [Validators.required]),
      regionName: new FormControl(null),
      pinCode: new FormControl('', [Validators.required, Validators.pattern(Constant.pinCode)]),
      octroi: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      oracleCode: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      contractedBoundry: new FormControl(''),
      EmissionLevel: new FormControl(null),
      IsCapital: new FormControl(false),
      RVDeviation: new FormControl(''),
      RMTDeviation: new FormControl(''),
      IsAddOnApplied: new FormControl(false),

      IsSMASCity: new FormControl(false),
      SMASServiceDPhone: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      SMASCityApplicable: new FormControl(null),
      address1: new FormControl(''),
      address2: new FormControl(''),
      phoneNo: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      contactPerson: new FormControl('', [Validators.required]),
      procurementEmail: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      fleetEmail: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      salesGMEMail: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      RCDays: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      pinCode2: new FormControl('', [Validators.required, Validators.pattern(Constant.pinCode)]),
      STDCode: new FormControl('', [Validators.required]),

      servicesList: new FormControl(null),

    });
    this.addCityForm.markAllAsTouched();

    this.GetCityDropdowns();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Cities';
      this.breadcrumbService.setBreadcrumbs(['Master / Cities', breadcrumb]);
    });
  }

  get validators() {
    return this.addCityForm.controls;
  }

  getCityById() {
    let Id = this.CityId;
    this.spinner.show();
    this.clientService.getCitiesById(Id).subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedCityData = res;
          this.CityAddressId = this.selectedCityData.CityAddress.Id;
          if (this.isView || this.IsApproverView) {
            this.addCityForm.disable();

          }
          if (this.editMode) { // to set validation of * in update mode
            this.addCityForm.get('pinCode')?.setValidators([Validators.required, Validators.pattern(Constant.pinCodeSpChar)]);
            this.addCityForm.get('SMASServiceDPhone')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addCityForm.get('phoneNo')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addCityForm.get('procurementEmail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addCityForm.get('fleetEmail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addCityForm.get('salesGMEMail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addCityForm.get('pinCode2')?.setValidators([Validators.required, Validators.pattern(Constant.pinCodeSpChar)]);
            this.addCityForm.get('RCDays')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
          } else {
            this.addCityForm.get('pinCode')?.setValidators([Validators.required, Validators.pattern(Constant.pinCode)]);
            this.addCityForm.get('SMASServiceDPhone')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.addCityForm.get('phoneNo')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.addCityForm.get('procurementEmail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addCityForm.get('fleetEmail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addCityForm.get('salesGMEMail')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addCityForm.get('pinCode2')?.setValidators([Validators.required, Validators.pattern(Constant.pinCode)]);
            this.addCityForm.get('RCDays')?.setValidators([Validators.pattern(Constant.IntNo)]);
          }
          // To apply the new validators, you need to update the form control's value
          this.addCityForm.updateValueAndValidity();


          if (this.selectedCityData.City != null && this.selectedCityData.City != undefined) {
            this.addCityForm.patchValue({

              cityCode: this.selectedCityData.City.Id,
              cityName: this.selectedCityData.City.CityName,
              StateName: this.selectedCityData.City.State,
              InsZoneSeatUpto: this.selectedCityData.City.InsZonePrivate,
              InsZoneSeatMorethan: this.selectedCityData.City.InsZoneTaxi,
              regionName: this.selectedCityData.City.Region,
              pinCode: this.selectedCityData.City.PIN,
              octroi: this.selectedCityData.City.Octroi,
              oracleCode: this.selectedCityData.City.OraCityCode,
              contractedBoundry: this.selectedCityData.City.ContractedBoundry,
              EmissionLevel: this.selectedCityData.City.EmissionLevel,
              IsCapital: this.selectedCityData.City.IsCapital,
              RVDeviation: this.selectedCityData.City.RVDeviation,
              RMTDeviation: this.selectedCityData.City.RMTDeviation,
              IsAddOnApplied: this.selectedCityData.City.IsAddonApplied == 1 ? true : false,
              IsSMASCity: this.selectedCityData.City.CIPLCity,
              SMASServiceDPhone: this.selectedCityData.City.Phone,
              contactPerson: this.selectedCityData.City.ContactPerson,
              salesGMEMail: this.selectedCityData.City.SalesGMEmail,
              RCDays: this.selectedCityData.City.RCRecieveDays,
              SMASCityApplicable: this.selectedCityData.City.CityNameAlias,
              servicesList: this.selectedCityData.City.ServiceList != null && this.selectedCityData.City.ServiceList != undefined ? this.selectedCityData.City.ServiceList : [],

            });
          }

          if (this.selectedCityData.CityAddress != null && this.selectedCityData.CityAddress != undefined) {
            this.addCityForm.patchValue({
              address1: this.selectedCityData.CityAddress.Address1,
              address2: this.selectedCityData.CityAddress.Address2,
              pinCode2: this.selectedCityData.CityAddress.Pin,
              STDCode: this.selectedCityData.CityAddress.STDCode,
              procurementEmail: this.selectedCityData.CityAddress.Email,
              fleetEmail: this.selectedCityData.CityAddress.ServiceEmailId,
              phoneNo: this.selectedCityData.CityAddress.Phone,
            });
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

  GetCityDropdowns() {
    this.spinner.show();
    this.clientService.getCitiesDropdowns().subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {

          this.stateList = res.StateList;
          this.insZoneUpto6List = res.InsZoneUpto;
          this.insZoneMoreThan6List = res.InsZoneMoreThan6;
          this.regionList = res.RegionList;
          this.servicesList = res.ServiceList;
          this.SMASCityApplList = res.SMASCityApplicable;

          // to delete <!-- Select !--> from response
          (this.insZoneUpto6List && this.insZoneUpto6List[0] && this.insZoneUpto6List[0].GeneralDescription.includes('Select')) ? this.insZoneUpto6List.shift() : '';
          (this.insZoneMoreThan6List && this.insZoneMoreThan6List[0] && this.insZoneMoreThan6List[0].GeneralDescription.includes('Select')) ? this.insZoneMoreThan6List.shift() : '';
          // to delete <!-- Select !--> from response

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

  addCities() {
    console.log(this.addCityForm);
    this.submitted = true;
    if (this.addCityForm.status == 'VALID') {
      const data = {
        CreatedById: this.currentUser.UserId,
        Created_by: this.currentUser.UserName,

        CityName: this.addCityForm.value.cityName,
        State: this.addCityForm.value.StateName,
        InsZonePrivate: this.addCityForm.value.InsZoneSeatUpto,
        InsZoneTaxi: this.addCityForm.value.InsZoneSeatMorethan,
        Region: this.addCityForm.value.regionName,
        Pin: this.addCityForm.value.pinCode,
        Octroi: this.addCityForm.value.octroi != null && this.addCityForm.value.octroi != '' ? this.addCityForm.value.octroi : 0,
        OraCityCode: this.addCityForm.value.oracleCode != null && this.addCityForm.value.oracleCode != '' ? this.addCityForm.value.oracleCode : 0,
        ContractedBoundry: this.addCityForm.value.contractedBoundry,
        EmissionLevel: this.addCityForm.value.EmissionLevel,
        IsCapital: this.addCityForm.value.IsCapital,
        RVDeviation: this.addCityForm.value.RVDeviation,
        RMTDeviation: this.addCityForm.value.RMTDeviation,
        IsAddonApplied: this.addCityForm.value.IsAddOnApplied == true ? 1 : 0,
        CIPLCity: this.addCityForm.value.IsSMASCity,
        Phone: this.addCityForm.value.SMASServiceDPhone,
        ContactPerson: this.addCityForm.value.contactPerson,
        SalesGMEmail: this.addCityForm.value.salesGMEMail,
        RCRecieveDays: this.addCityForm.value.RCDays != null && this.addCityForm.value.RCDays != '' ? this.addCityForm.value.RCDays : 0,
        PIN: this.addCityForm.value.pinCode2,
        STDCode: this.addCityForm.value.STDCode,
        CityNameAlias: this.addCityForm.value.SMASCityApplicable,
        ServicesArray: this.addCityForm.value.servicesList,
        CityAddress: {
          Address1: this.addCityForm.value.address1,
          Address2: this.addCityForm.value.address2,
          Phone: this.addCityForm.value.phoneNo,
          Email: this.addCityForm.value.procurementEmail,
          Pin: this.addCityForm.value.pinCode2,
          STDCode: this.addCityForm.value.STDCode,
          ServiceEmailId: this.addCityForm.value.fleetEmail,
        },

        BranchId: 1,
        Dormant: false,
        OldCityCode: "",
        OldInsZone: "",
        OldInsZoneT: "",
        OldCityApp: "",
        SalesContactNo: "",
        IsActive: true,


      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addCities(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("City details added successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/master-city"], {
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

  updateCities() {
    this.submitted = true;
    console.log(this.addCityForm);

    if (this.addCityForm.status == 'VALID') {
      const data = {
        CItyID: this.CityId,
        ModifiedById: this.currentUser.UserId,
        Modified_by: this.currentUser.UserName,

        CityName: this.addCityForm.value.cityName,
        State: this.addCityForm.value.StateName,
        InsZonePrivate: this.addCityForm.value.InsZoneSeatUpto,
        InsZoneTaxi: this.addCityForm.value.InsZoneSeatMorethan,
        Region: this.addCityForm.value.regionName,
        Pin: this.addCityForm.value.pinCode,
        Octroi: this.addCityForm.value.octroi != null && this.addCityForm.value.octroi != '' ? this.addCityForm.value.octroi : 0,
        OraCityCode: this.addCityForm.value.oracleCode != null && this.addCityForm.value.oracleCode != '' ? this.addCityForm.value.oracleCode : 0,
        ContractedBoundry: this.addCityForm.value.contractedBoundry,
        EmissionLevel: this.addCityForm.value.EmissionLevel,
        IsCapital: this.addCityForm.value.IsCapital,
        RVDeviation: this.addCityForm.value.RVDeviation != null && this.addCityForm.value.RVDeviation != '' ? this.addCityForm.value.RVDeviation : 0,
        RMTDeviation: this.addCityForm.value.RMTDeviation != null && this.addCityForm.value.RMTDeviation != '' ? this.addCityForm.value.RMTDeviation : 0,
        IsAddonApplied: this.addCityForm.value.IsAddOnApplied == true ? 1 : 0,
        CIPLCity: this.addCityForm.value.IsSMASCity,
        Phone: this.addCityForm.value.SMASServiceDPhone,
        ContactPerson: this.addCityForm.value.contactPerson,
        SalesGMEmail: this.addCityForm.value.salesGMEMail,
        RCRecieveDays: this.addCityForm.value.RCDays != null && this.addCityForm.value.RCDays != '' ? this.addCityForm.value.RCDays : 0,
        PIN: this.addCityForm.value.pinCode2,
        STDCode: this.addCityForm.value.STDCode,
        CityNameAlias: this.addCityForm.value.SMASCityApplicable,
        ServicesArray: this.addCityForm.value.servicesList,
        CityAddress: {
          CityId: this.CityAddressId,
          Address1: this.addCityForm.value.address1,
          Address2: this.addCityForm.value.address2,
          Phone: this.addCityForm.value.phoneNo,
          Email: this.addCityForm.value.procurementEmail,
          Pin: this.addCityForm.value.pinCode2,
          STDCode: this.addCityForm.value.STDCode,
          ServiceEmailId: this.addCityForm.value.fleetEmail,
        },

        BranchId: 1,
        Dormant: false,
        OldCityCode: "",
        OldInsZone: "",
        OldInsZoneT: "",
        OldCityApp: "",
        SalesContactNo: "",
        IsActive: true,
      }


      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateCities(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("City details updated successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/master-city"], {
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
    this.IsApproverView = false;
    this.isView = false;
    this.addCityForm.reset();
    this.addCityForm.setValue(defaultValues);
    this.addCityForm.markAllAsTouched();
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.CityId, Name: this.selectedCityData.City.CityName, moduleName: 'add-city' }
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
  cityCode: '',
  cityName: '',
  StateName: null,
  InsZoneSeatUpto: null,
  InsZoneSeatMorethan: null,
  regionName: null,
  pinCode: '',
  octroi: '',
  oracleCode: '',
  contractedBoundry: '',
  EmissionLevel: null,
  IsCapital: false,
  RVDeviation: '',
  RMTDeviation: '',
  IsAddOnApplied: false,

  IsSMASCity: false,
  SMASServiceDPhone: '',
  SMASCityApplicable: null,
  address1: '',
  address2: '',
  phoneNo: '',
  contactPerson: '',
  procurementEmail: '',
  fleetEmail: '',
  salesGMEMail: '',
  RCDays: '',
  pinCode2: '',
  STDCode: '',

  servicesList: null,
}
