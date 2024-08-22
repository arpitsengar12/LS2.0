import { DatePipe } from '@angular/common';
import { Component, Sanitizer, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { LocalStorageServiceService } from 'src/app/shared/Services/local-storage-service.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../../client.service';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-manufacturers',
  templateUrl: './add-manufacturers.component.html',
  styleUrls: ['./add-manufacturers.component.scss']
})

export class AddManufacturersComponent {
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

  addmanufacturerForm!: FormGroup;
  submitted: boolean = false;
  editMode: boolean = false;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  contractData: any;
  cityList: any;
  manufacturerId = 0;
  selectedMAnufacturerData: any;
  files: File[] = [];
  fileName: string = '';
  fileType: string = '';
  url: any = '';
  imageType = Constant.imageType;
  attachmentType: string = '';
  imageUploaded: boolean = false;
  attachmentId: number = 0;


  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  imageUrl: string = '';

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
      this.manufacturerId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getmanufacturerById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getmanufacturerById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getmanufacturerById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.addmanufacturerForm = new FormGroup({
      manufacturerName: new FormControl('', [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      address1: new FormControl(''),
      address2: new FormControl(''),
      address3: new FormControl(''),
      email1: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      email2: new FormControl('', [Validators.pattern(Constant.EMAIL_REGEXP)]),
      mobile1: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      mobile2: new FormControl('', [Validators.pattern(Constant.phoneRegExp)]),
      ContactPerson1: new FormControl(''),
      ContactPerson2: new FormControl(''),
      faxNumber: new FormControl('', [Validators.pattern(Constant.faxNumber)]),
    });
    this.addmanufacturerForm.markAllAsTouched();
    this.getAllCity();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Manufacturer';
      this.breadcrumbService.setBreadcrumbs(['Master / Manufacturer', breadcrumb]);
    });
  }

  get validators() {
    return this.addmanufacturerForm.controls;
  }

  getmanufacturerById() {
    this.spinner.show();
    this.clientService.getManufacturerById(this.manufacturerId).subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedMAnufacturerData = res;
          if (res.ImageData != null && res.ImageData != undefined) {
            let temp: any = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + res.ImageData);
            this.url = temp.changingThisBreaksApplicationSecurity;
            this.fileName = res.ImageName;
            this.convertBase64ToBinary(this.selectedMAnufacturerData.ImageData);
            this.imageUploaded = true;
          }
          if (this.isView || this.IsApproverView) {
            this.addmanufacturerForm.disable();

          }
          if (this.editMode) { // to set validation of * in update mode
            this.addmanufacturerForm.get('email1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addmanufacturerForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);
            this.addmanufacturerForm.get('mobile1')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);
            this.addmanufacturerForm.get('mobile1')?.setValidators([Validators.pattern(Constant.phoneRegExpwSpChar)]);

          } else {
            this.addmanufacturerForm.get('email1')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addmanufacturerForm.get('email2')?.setValidators([Validators.pattern(Constant.EMAIL_REGEXP)]);
            this.addmanufacturerForm.get('mobile1')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);
            this.addmanufacturerForm.get('mobile1')?.setValidators([Validators.pattern(Constant.phoneRegExp)]);

          }
          // To apply the new validators, you need to update the form control's value
          this.addmanufacturerForm.updateValueAndValidity();

          this.addmanufacturerForm.patchValue({

            manufacturerName: this.selectedMAnufacturerData.ManufacturerName,
            city: this.selectedMAnufacturerData.CityId,
            address1: this.selectedMAnufacturerData.Address1,
            address2: this.selectedMAnufacturerData.Address2,
            address3: this.selectedMAnufacturerData.Address3,
            email1: this.selectedMAnufacturerData.EmailId1,
            email2: this.selectedMAnufacturerData.EmailId2,
            mobile1: this.selectedMAnufacturerData.Mobile1,
            mobile2: this.selectedMAnufacturerData.Mobile2,
            ContactPerson1: this.selectedMAnufacturerData.ContactPerson1,
            ContactPerson2: this.selectedMAnufacturerData.ContactPerson2,
            faxNumber: this.selectedMAnufacturerData.Fax,
          });

          // let decodeUrl = atob(this.selectedMAnufacturerData.ImageData);
          // this.url = this.sanitizer.bypassSecurityTrustUrl(decodeUrl);
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
    });
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

  cancel(formGroup: FormGroup) {
    formGroup.reset(defaultValues);
    this.submitted = false;
    this.addmanufacturerForm.reset(defaultValues);
  }

  addManufacturer() {
    console.log(this.addmanufacturerForm);
    this.submitted = true;
    if (this.addmanufacturerForm.status == 'VALID') {
      const data = {
        CreatedById: this.currentUser.UserId,

        ManufacturerName: this.addmanufacturerForm.value.manufacturerName,
        Address1: this.addmanufacturerForm.value.address1,
        Address2: this.addmanufacturerForm.value.address2,
        Address3: this.addmanufacturerForm.value.address3,
        CityId: this.addmanufacturerForm.value.city,
        Mobile1: this.addmanufacturerForm.value.mobile1,
        Fax: this.addmanufacturerForm.value.faxNumber,
        ContactPerson1: this.addmanufacturerForm.value.ContactPerson1,
        EmailId1: this.addmanufacturerForm.value.email1,
        ContactPerson2: this.addmanufacturerForm.value.ContactPerson2,
        EmailId2: this.addmanufacturerForm.value.email2,
        Mobile2: this.addmanufacturerForm.value.mobile2,


        AccountId: 1,
        ParentId: 1,
        AccName: "",
        Contact: "",
        Dormant: false,
        Approved: false,
        OldManCode: "",
        OldCityCode: "",
        ImageName: "",
        ContentType: "",
        Image: null,
        ImageData: null,
        IsOnline: false,
        Popular: 1,
      }

      this.files.length === 1 ? data.ImageName = this.files[0].name : data.ImageName = ''; // to save image name

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }
      this.spinner.show();
      this.clientService.addManufacturer(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Manufacturer added successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/manufacturers"], {
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

  updateManufacturer() {
    this.submitted = true;
    console.log(this.addmanufacturerForm);

    if (this.addmanufacturerForm.status == 'VALID') {
      // const data = {
      //   Id: this.manufacturerId,
      //   ModifiedById: this.currentUser.UserId,

      //   ManufacturerName: this.addmanufacturerForm.value.manufacturerName,
      //   Address1: this.addmanufacturerForm.value.address1,
      //   Address2: this.addmanufacturerForm.value.address2,
      //   Address3: this.addmanufacturerForm.value.address3,
      //   CityId: this.addmanufacturerForm.value.city,
      //   Mobile1: this.addmanufacturerForm.value.mobile1,
      //   Fax: this.addmanufacturerForm.value.faxNumber,
      //   ContactPerson1: this.addmanufacturerForm.value.ContactPerson1,
      //   EmailId1: this.addmanufacturerForm.value.email1,
      //   ContactPerson2: this.addmanufacturerForm.value.ContactPerson2,
      //   EmailId2: this.addmanufacturerForm.value.email2,
      //   Mobile2: this.addmanufacturerForm.value.mobile2,


      //   AccountId: 1,
      //   ParentId: 1,
      //   AccName: "",
      //   Contact: "",
      //   Dormant: false,
      //   Approved: false,
      //   OldManCode: "",
      //   OldCityCode: "",
      //   ImageName: "",
      //   ContentType: "",
      //   Image: null,
      //   ImageData: null,
      //   IsOnline: false,
      //   Popular: 1,
      // }

      this.selectedMAnufacturerData.ModifiedById = this.currentUser.UserId;

      this.selectedMAnufacturerData.ManufacturerName = this.addmanufacturerForm.value.manufacturerName;
      this.selectedMAnufacturerData.Address1 = this.addmanufacturerForm.value.address1;
      this.selectedMAnufacturerData.Address2 = this.addmanufacturerForm.value.address2;
      this.selectedMAnufacturerData.Address3 = this.addmanufacturerForm.value.address3;
      this.selectedMAnufacturerData.CityId = this.addmanufacturerForm.value.city;
      this.selectedMAnufacturerData.Mobile1 = this.addmanufacturerForm.value.mobile1;
      this.selectedMAnufacturerData.Fax = this.addmanufacturerForm.value.faxNumber;
      this.selectedMAnufacturerData.ContactPerson1 = this.addmanufacturerForm.value.ContactPerson1;
      this.selectedMAnufacturerData.EmailId1 = this.addmanufacturerForm.value.email1;
      this.selectedMAnufacturerData.ContactPerson2 = this.addmanufacturerForm.value.ContactPerson2;
      this.selectedMAnufacturerData.EmailId2 = this.addmanufacturerForm.value.email2;
      this.selectedMAnufacturerData.Mobile2 = this.addmanufacturerForm.value.mobile2;

      this.files.length === 1 ? this.selectedMAnufacturerData.ImageName = this.files[0].name : this.selectedMAnufacturerData.ImageName = ''; // to save image name

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedMAnufacturerData));
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }
      this.spinner.show();
      this.clientService.updateManufacturer(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Manufacturer Updated Successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/manufacturers"], {
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

  convertBase64ToBinary(base64String: any) {
    // Decode Base64 string to binary string
    const binaryString = atob(base64String);

    // Convert binary string to ArrayBuffer
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Create Blob from ArrayBuffer
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
    const file = new File([blob], this.fileName, { type: 'image/png', lastModified: Date.now() });
    this.files.push(file)
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.fileName = '';
    this.fileType = '';
    this.files = [];
    this.url = '';
    this.addmanufacturerForm.reset(defaultValues);
    this.addmanufacturerForm.markAllAsTouched();
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.manufacturerId, Name: this.selectedMAnufacturerData.ManufacturerName, moduleName: 'add-manufacturers' }
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
  manufacturerName: '',
  city: null,
  address1: '',
  address2: '',
  address3: '',
  email1: '',
  email2: '',
  mobile1: '',
  mobile2: '',
  ContactPerson1: '',
  ContactPerson2: '',
  faxNumber: '',
}