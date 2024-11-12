import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Location } from '@angular/common';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';
import { MatDialog } from '@angular/material/dialog';

export interface PeriodicElement {
  GroupName: string;
  CityName: string;
  CreatedBy: string;
  CreatedDate: string;
}

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-group-of-companies',
  templateUrl: './group-of-companies.component.html',
  styleUrls: ['./group-of-companies.component.scss']
})
export class GroupOfCompaniesComponent {
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

  addGroupCompanyForm!: FormGroup;

  totalRecords: number;
  submitted: boolean = false;
  cityList: any;
  GOCId: number = 0;
  selectedGOCData: any;
  isView: boolean = false;
  editMode: boolean = false;
  IsAuditTrail: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
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
      this.GOCId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getGOCById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getGOCById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getGOCById();
      }
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.addGroupCompanyForm = new FormGroup({
      // groupName: new FormControl('', [Validators.required, Validators.pattern(Constant.textInput)]),
      groupName: new FormControl('', [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      email1: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      email2: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      mobile1: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      mobile2: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      officeAddress1: new FormControl(''),
      officeAddress2: new FormControl(''),
      ContactPerson1: new FormControl(''),
      ContactPerson2: new FormControl(''),
    });

    this.getCity();
    this.addGroupCompanyForm.markAllAsTouched();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Clients / Group Of Companies';
      this.breadcrumbService.setBreadcrumbs(['Master / Clients / Group Of Companies', breadcrumb]);
    });
  }

  getGOCById() {
    this.spinner.show();
    this.clientService.getGOCById(this.GOCId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedGOCData = res;
          this.addGroupCompanyForm.reset();
          if (this.isView || this.IsApproverView) {
            this.addGroupCompanyForm.disable();
          }
          if (this.editMode) {
            // this.addGroupCompanyForm.get('groupName')?.setValidators([Validators.required, Validators.pattern(Constant.textInput)]);
            this.addGroupCompanyForm.get('email1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addGroupCompanyForm.get('mobile1')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addGroupCompanyForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addGroupCompanyForm.get('mobile2')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
          } else {
            // this.addGroupCompanyForm.get('groupName')?.setValidators([Validators.pattern(Constant.userNameInput)]);
            this.addGroupCompanyForm.get('email1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addGroupCompanyForm.get('mobile1')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.addGroupCompanyForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addGroupCompanyForm.get('mobile2')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
          }
          // To apply the new validators, you need to update the form control's value
          this.addGroupCompanyForm.updateValueAndValidity();

          this.addGroupCompanyForm.patchValue({
            groupName: this.selectedGOCData.GOCName,
            city: this.selectedGOCData.CityId,
            email1: this.selectedGOCData.EmailId1,
            email2: this.selectedGOCData.EmailId2,
            mobile1: this.selectedGOCData.Mobile1,
            mobile2: this.selectedGOCData.Mobile2,
            officeAddress1: this.selectedGOCData.Address1,
            officeAddress2: this.selectedGOCData.Address2,
            ContactPerson1: this.selectedGOCData.ConPerson1,
            ContactPerson2: this.selectedGOCData.ConPerson2,
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

  get validators() {
    return this.addGroupCompanyForm.controls;
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

  AddGroupOfCompany() {
    this.submitted = true;
    console.log(this.addGroupCompanyForm);
    if (this.addGroupCompanyForm.status == 'VALID') {
      const data =
      {
        GOCName: this.addGroupCompanyForm.value.groupName,
        CityId: this.addGroupCompanyForm.value.city,
        EmailId1: this.addGroupCompanyForm.value.email1,
        EmailId2: this.addGroupCompanyForm.value.email2,
        Address1: this.addGroupCompanyForm.value.officeAddress1,
        Address2: this.addGroupCompanyForm.value.officeAddress2,
        Mobile1: this.addGroupCompanyForm.value.mobile1,
        Mobile2: this.addGroupCompanyForm.value.mobile2,
        ConPerson1: this.addGroupCompanyForm.value.ContactPerson1,
        ConPerson2: this.addGroupCompanyForm.value.ContactPerson2,
        Address3: "",
        CreatedById: this.currentUser.UserId,
      }

      // let formData: FormData = new FormData();
      // formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addGroupOfCompany(data).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Group Of Company added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.spinner.hide();
            this.router.navigate(["/GocListView"], {
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

  updateGroupOfCompany() {
    this.submitted = true;
    console.log(this.addGroupCompanyForm);
    if (this.addGroupCompanyForm.status == 'VALID') {
      // const data =
      // {
      //   Id: this.GOCId,
      //   GOCName: this.addGroupCompanyForm.value.groupName,
      //   CityId: this.addGroupCompanyForm.value.city,
      //   EmailId1: this.addGroupCompanyForm.value.email1,
      //   EmailId2: this.addGroupCompanyForm.value.email2,
      //   Address1: this.addGroupCompanyForm.value.officeAddress1,
      //   Address2: this.addGroupCompanyForm.value.officeAddress2,
      //   Mobile1: this.addGroupCompanyForm.value.mobile1,
      //   Mobile2: this.addGroupCompanyForm.value.mobile2,
      //   ConPerson1: this.addGroupCompanyForm.value.ContactPerson1,
      //   ConPerson2: this.addGroupCompanyForm.value.ContactPerson2,
      //   Address3: "",
      //   ModifiedById: this.currentUser.UserId,
      // }

      this.selectedGOCData.ModifiedById = this.currentUser.UserId;

      this.selectedGOCData.GOCName = this.addGroupCompanyForm.value.groupName;
      this.selectedGOCData.CityId = this.addGroupCompanyForm.value.city;
      this.selectedGOCData.EmailId1 = this.addGroupCompanyForm.value.email1;
      this.selectedGOCData.EmailId2 = this.addGroupCompanyForm.value.email2;
      this.selectedGOCData.Address1 = this.addGroupCompanyForm.value.officeAddress1;
      this.selectedGOCData.Address2 = this.addGroupCompanyForm.value.officeAddress2;
      this.selectedGOCData.Mobile1 = this.addGroupCompanyForm.value.mobile1;
      this.selectedGOCData.Mobile2 = this.addGroupCompanyForm.value.mobile2;
      this.selectedGOCData.ConPerson1 = this.addGroupCompanyForm.value.ContactPerson1;
      this.selectedGOCData.ConPerson2 = this.addGroupCompanyForm.value.ContactPerson2;

      // let formData: FormData = new FormData();
      // formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateGroupOfCompany(this.selectedGOCData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Group Of Company updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.spinner.hide();
            this.router.navigate(["/GocListView"], {
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
    this.addGroupCompanyForm.reset();
    this.submitted = false;
    this.IsApproverView = false;
    this.isView = false;
    this.addGroupCompanyForm.markAllAsTouched();
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.GOCId, Name: this.selectedGOCData.GOCName, moduleName: 'group-of-companies' }
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
