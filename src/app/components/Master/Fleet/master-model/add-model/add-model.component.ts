import { Component, ViewChild } from '@angular/core';
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
import { ClientService } from '../../../../client.service';
import { Location } from '@angular/common';
import { MatTable } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-model',
  templateUrl: './add-model.component.html',
  styleUrls: ['./add-model.component.scss']
})
export class AddModelComponent {
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

  addModelForm!: FormGroup;
  submitted: boolean = false;
  contractData: any;
  editMode: boolean = false;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  ModelId = 0;
  selectedModelData: any;
  files: File[] = [];
  fileName: string = '';
  imageUrl: string = '';
  media: string | Blob;
  fileType: string = '';
  url: any = '';
  imageType = Constant.imageType;
  attachmentType: string = '';
  imageUploaded: boolean = false;

  manufacturerList: any;
  rvMatrixCodeList: any;
  rmtbMatrixCodeList: any;
  rmtbMatrixMOList: any;
  modelCategoryList: any;
  masterRVMatrixCodeList: any;
  tyreMatrixCodeList: any;
  addOnPlanList: any;
  vehicleSegmentList: any;
  repVehicleSegmentList: any;
  serviceList: any;

  addServiceForm!: FormGroup;
  isServiceFormSubmitted: boolean = false;
  displayedColumns = ['serviceName', 'serviceOccurance', 'CorrectionFactor', 'InspectionRatio', 'Action'];
  servicesTableList: any[] = [];
  selectedService: any;
  @ViewChild('serviceTable') serviceTable!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  totalRecords: any;
  PageNumber: number = 1;
  PageSize: number = 10;
  selectedRowIndex: any;

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
    private localService: LocalStorageServiceService,
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
      this.ModelId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getModelById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getModelById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getModelById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.addModelForm = new FormGroup({
      modelCode: new FormControl(''),
      modelName: new FormControl('', [Validators.required]),
      manufacturer: new FormControl(null, [Validators.required]),
      rvMatrixCode: new FormControl(null, [Validators.required]),
      rmtbMatrixCode: new FormControl(null, [Validators.required]),
      rmtbMatrixMO: new FormControl(null, [Validators.required]),
      modelCategory: new FormControl(null, [Validators.required]),
      jatoModelName: new FormControl(''),
      masterRVMatrixCode: new FormControl(null),
      tyreMatrixCode: new FormControl(null),
      addOnPlan: new FormControl(null),
      brochure: new FormControl(''),
      IsOnline: new FormControl(false),
      vehicleSegment: new FormControl(null),
      repVehicleSegment: new FormControl(null),
      modelImage: new FormControl(''),
    });

    this.addServiceForm = new FormGroup({
      serviceName: new FormControl(null, [Validators.required]),
      serviceOccurance: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
      correctionFactor: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
      inspectionRatio: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
      // serviceIntervals: new FormControl(''),
    });

    this.addModelForm.markAllAsTouched();
    this.addServiceForm.markAllAsTouched();
    this.getModelDropdowns();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Fleet / Model';
      this.breadcrumbService.setBreadcrumbs(['Master / Fleet / Model', breadcrumb]);
    });
  }

  get validators() {
    return this.addModelForm.controls;
  }

  get serviceValidators() {
    return this.addServiceForm.controls;
  }

  getModelById() {
    this.spinner.show();
    this.clientService.getModelById(this.ModelId).subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedModelData = res;
          if (this.selectedModelData.Model.ImageData != null && this.selectedModelData.Model.ImageData != undefined) {
            let temp: any = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + this.selectedModelData.Model.ImageData);
            this.url = temp.changingThisBreaksApplicationSecurity;
            // this.imageUrl = temp.changingThisBreaksApplicationSecurity;

            this.fileName = this.selectedModelData.Model.ImageName;
            this.convertBase64ToBinary(this.selectedModelData.Model.ImageData);
            this.imageUploaded = true;
          }
          if (this.isView || this.IsApproverView) {
            this.addModelForm.disable();
            this.addServiceForm.disable();

          }
          if (this.editMode) { // to set validation of * in update mode
          } else {
          }
          // To apply the new validators, you need to update the form control's value
          this.addModelForm.updateValueAndValidity();

          if (this.selectedModelData.Model) {
            this.addModelForm.patchValue({

              modelCode: this.selectedModelData.Model.Id,
              modelName: this.selectedModelData.Model.ModelName,
              manufacturer: this.selectedModelData.Model.ManufacturerId,
              rvMatrixCode: this.selectedModelData.Model.RvMatrixId,
              rmtbMatrixCode: this.selectedModelData.Model.RmtbMatrixId,
              rmtbMatrixMO: this.selectedModelData.Model.RmtbMatrixMOId,
              modelCategory: this.selectedModelData.Model.ModelCategory,
              jatoModelName: this.selectedModelData.Model.JatoModelName,
              masterRVMatrixCode: this.selectedModelData.Model.MasterRvMatrixId,
              tyreMatrixCode: this.selectedModelData.Model.TyreMatrixId,
              addOnPlan: this.selectedModelData.Model.AddOnPlanId,
              brochure: this.selectedModelData.Model.Brochure,
              IsOnline: this.selectedModelData.Model.IsOnline,
              vehicleSegment: this.selectedModelData.Model.VehicleSegmentId,
              repVehicleSegment: this.selectedModelData.Model.RepVehicleSegmentId,
            });
          }
          if (this.selectedModelData.ModelService) {
            this.servicesTableList = [];
            this.selectedModelData.ModelService.map((element: any) => {
              let data = {
                ServiceId: element.ServiceId,
                ServiceDesc: element.ServiceDesc,
                Occurance: element.Occurance,
                CorrectionFactor: element.CorrectionFactor,
                InspectionRatio: element.InspectionRatio,
                Id: element.Id,
                ModelId: element.ModelId,
              }
              this.servicesTableList.push(data);
            });
          }
          this.serviceTable.renderRows();

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

  getModelDropdowns() {
    this.spinner.show();
    this.clientService.getModelDropdowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.manufacturerList = res.ManufacturerList;
          this.rvMatrixCodeList = res.RvList;
          this.rmtbMatrixCodeList = res.RmtbList;
          this.rmtbMatrixMOList = res.RmtbList;
          this.modelCategoryList = res.ModelCategoryList;
          this.masterRVMatrixCodeList = res.RvMatrixList;
          this.tyreMatrixCodeList = res.TyreList;
          this.addOnPlanList = res.AddOnPlanList;
          this.vehicleSegmentList = res.VehicleSegmentList;
          this.repVehicleSegmentList = res.VehicleSegmentList;
          this.serviceList = res.ServiceList;

          // to delete <!-- Select !--> from response
          (this.rvMatrixCodeList && this.rvMatrixCodeList[0] && this.rvMatrixCodeList[0].Particular.includes('Select')) ? this.rvMatrixCodeList.shift() : '';
          (this.rmtbMatrixCodeList && this.rmtbMatrixCodeList[0] && this.rmtbMatrixCodeList[0].Particular.includes('Select')) ? this.rmtbMatrixCodeList.shift() : '';
          (this.rmtbMatrixMOList && this.rmtbMatrixMOList[0] && this.rmtbMatrixMOList[0].Particular.includes('Select')) ? this.rmtbMatrixMOList.shift() : '';
          (this.masterRVMatrixCodeList && this.masterRVMatrixCodeList[0] && this.masterRVMatrixCodeList[0].Particular.includes('Select')) ? this.masterRVMatrixCodeList.shift() : '';
          (this.tyreMatrixCodeList && this.tyreMatrixCodeList[0] && this.tyreMatrixCodeList[0].Particular.includes('Select')) ? this.tyreMatrixCodeList.shift() : '';
          (this.addOnPlanList && this.addOnPlanList[0] && this.addOnPlanList[0].Particular.includes('Select')) ? this.addOnPlanList.shift() : '';
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

    })
  }

  addModel() {
    console.log(this.addModelForm);
    this.submitted = true;

    let modifiedservicesTableList = this.servicesTableList.map(({ ServiceDesc, ...rest }) => rest);

    if (this.addModelForm.status == 'VALID') {
      const data = {
        CreatedById: this.currentUser.UserId,

        ModelName: this.addModelForm.value.modelName,
        ManufacturerId: this.addModelForm.value.manufacturer,
        RvMatrixId: this.addModelForm.value.rvMatrixCode,
        RmtbMatrixId: this.addModelForm.value.rmtbMatrixCode,
        RmtbMatrixMOId: this.addModelForm.value.rmtbMatrixMO,
        ModelCategory: this.addModelForm.value.modelCategory,
        JatoModelName: this.addModelForm.value.jatoModelName,
        MasterRvMatrixId: this.addModelForm.value.masterRVMatrixCode,
        TyreMatrixId: this.addModelForm.value.tyreMatrixCode,
        AddOnPlanId: this.addModelForm.value.addOnPlan,
        Brochure: this.addModelForm.value.brochure,
        IsOnline: this.addModelForm.value.IsOnline,
        VehicleSegmentId: this.addModelForm.value.vehicleSegment,
        RepVehicleSegmentId: this.addModelForm.value.repVehicleSegment,
        M_ModelServiceOccurance: modifiedservicesTableList,

        ImageName: this.fileName,

        Dormant: false,
        OldManCode: "",
        OldRV: "",
        OldRMT: "",
        OldTyre: "",
        OldModelCode: "",
        ContentType: "",
        Image: null,

      }

      this.files.length === 1 ? data.ImageName = this.files[0].name : data.ImageName = ''; // to save image name

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      // if (this.media && this.media != '') {
      //   formData.append('file', this.media);
      // }
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }
      this.spinner.show();
      this.clientService.addModel(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Model added successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/master-model"], {
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

  updateModel() {
    console.log(this.addModelForm.status);
    this.submitted = true;
    let modifiedservicesTableList = this.servicesTableList.map(({ ServiceDesc, ...rest }) => rest);

    if (this.addModelForm.status == 'VALID') {
      // const data = {
      //   Id: this.ModelId,
      //   ModifiedById: this.currentUser.UserId,

      //   ModelName: this.addModelForm.value.modelName,
      //   ManufacturerId: this.addModelForm.value.manufacturer,
      //   RvMatrixId: this.addModelForm.value.rvMatrixCode,
      //   RmtbMatrixId: this.addModelForm.value.rmtbMatrixCode,
      //   RmtbMatrixMOId: this.addModelForm.value.rmtbMatrixMO,
      //   ModelCategory: this.addModelForm.value.modelCategory,
      //   JatoModelName: this.addModelForm.value.jatoModelName,
      //   MasterRvMatrixId: this.addModelForm.value.masterRVMatrixCode,
      //   TyreMatrixId: this.addModelForm.value.tyreMatrixCode,
      //   AddOnPlanId: this.addModelForm.value.addOnPlan,
      //   Brochure: this.addModelForm.value.brochure,
      //   IsOnline: this.addModelForm.value.IsOnline,
      //   VehicleSegmentId: this.addModelForm.value.vehicleSegment,
      //   RepVehicleSegmentId: this.addModelForm.value.repVehicleSegment,
      //   M_ModelServiceOccurance: modifiedservicesTableList,

      //   ImageName: this.fileName,

      //   Dormant: false,
      //   OldManCode: "",
      //   OldRV: "",
      //   OldRMT: "",
      //   OldTyre: "",
      //   OldModelCode: "",
      //   ContentType: "",
      //   Image: null,
      // }

      this.selectedModelData.Model.ModifiedById = this.currentUser.UserId;

      this.selectedModelData.Model.ModelName = this.addModelForm.value.modelName;
      this.selectedModelData.Model.ManufacturerId = this.addModelForm.value.manufacturer;
      this.selectedModelData.Model.RvMatrixId = this.addModelForm.value.rmtbMatrixCode;
      this.selectedModelData.Model.RmtbMatrixId = this.addModelForm.value.rmtbMatrixCode;
      this.selectedModelData.Model.RmtbMatrixMOId = this.addModelForm.value.rmtbMatrixMO;
      this.selectedModelData.Model.ModelCategory = this.addModelForm.value.modelCategory;
      this.selectedModelData.Model.JatoModelName = this.addModelForm.value.jatoModelName;
      this.selectedModelData.Model.MasterRvMatrixId = this.addModelForm.value.masterRVMatrixCode;
      this.selectedModelData.Model.TyreMatrixId = this.addModelForm.value.tyreMatrixCode;
      this.selectedModelData.Model.AddOnPlanId = this.addModelForm.value.addOnPlan;
      this.selectedModelData.Model.Brochure = this.addModelForm.value.brochure;
      this.selectedModelData.Model.IsOnline = this.addModelForm.value.IsOnline;
      this.selectedModelData.Model.VehicleSegmentId = this.addModelForm.value.vehicleSegment;
      this.selectedModelData.Model.RepVehicleSegmentId = this.addModelForm.value.repVehicleSegment;
      this.selectedModelData.Model.ImageName = this.fileName;

      this.selectedModelData.ModelService = modifiedservicesTableList;

      this.files.length === 1 ? this.selectedModelData.Model.ImageName = this.files[0].name : this.selectedModelData.Model.ImageName = ''; // to save image name

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedModelData));
      // if (this.media && this.media != '') {
      //   formData.append('file', this.media);
      // }
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }

      this.spinner.show();
      this.clientService.updateModel(formData).subscribe((res) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Model Updated Successfully.", undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/master-model"], {
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
    this.isServiceFormSubmitted = false;
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.fileName = '';
    this.files = [];
    this.imageUrl = '';
    this.media = '';
    this.addModelForm.reset(defaultValues);
    this.addModelForm.markAllAsTouched();
    this.addServiceForm.reset(serviceDefaultValues);
    this.addServiceForm.markAllAsTouched();
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

  //upload media
  upload(event: any) {
    this.toaster.clear();
    this.files = [];
    this.files = event.target;
    var files = event.target.files[0];
    if (files) {
      if (this.commonService.validateImageFile(files)) {
        const reader = new FileReader();
        reader.readAsDataURL(files);
        reader.onload = () => {
          this.imageUrl = reader.result as string;
        };
        this.media = files;
        this.fileName = files.name;
      }
      else {
        this.clearImageInput();
      }
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
  clearImageInput() {
    this.imageUrl = '';
    this.addModelForm.get('modelImage')?.reset();
    this.media = '';
    this.files = [];
  }

  ServiceChange(event: any) {
    if (event) {
      this.selectedService = [];
      let data = {
        ServiceDesc: event.ServiceDesc,
        Id: event.Id,
      }
      this.selectedService.push(data);
    }

  }

  AddServiceData() {
    this.isServiceFormSubmitted = true;
    if (this.addServiceForm.status == 'VALID') {
      let serviceData: any = {
        ServiceId: this.selectedService[0].Id,
        ServiceDesc: this.selectedService[0].ServiceDesc,
        Occurance: this.addServiceForm.value.serviceOccurance,
        CorrectionFactor: this.addServiceForm.value.correctionFactor,
        InspectionRatio: this.addServiceForm.value.inspectionRatio,
      }
      if (this.servicesTableList.length == 0) {
        this.servicesTableList.push(serviceData);
        this.serviceTable.renderRows();
      }
      else {
        let isServiceDataExist = this.servicesTableList.some(item =>
          item.ServiceId == serviceData.ServiceId &&
          item.ServiceDesc == serviceData.ServiceDesc &&
          item.Occurance == serviceData.Occurance &&
          item.CorrectionFactor == serviceData.CorrectionFactor &&
          item.InspectionRatio == serviceData.InspectionRatio
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
      if (this.servicesTableList) {
        this.servicesTableList.map((item: any) => {
          if (item.Id == element.Id) {
            this.deleteModelService(item.Id);
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

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.ModelId, Name: this.selectedModelData.Model.ModelName, moduleName: 'add-model' }
    });
  }

  deleteModelService(id: any) {
    this.spinner.show();
    this.clientService.deleteModelService(id).subscribe((res) => {
      if (res) {
        if (!res.HasErrors) {
          this.toaster.success("Service Deleted Successfully.", undefined, {
            positionClass: 'toast-top-center'
          });

          this.getModelById();
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

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.servicesTableList = this.commonService.customSort(this.servicesTableList, sortState.active, sortState.direction);
      this.serviceTable.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    // this.getAllManufacturers();
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
  modelCode: '',
  modelName: '',
  manufacturer: null,
  rvMatrixCode: null,
  rmtbMatrixCode: null,
  rmtbMatrixMO: null,
  modelCategory: null,
  jatoModelName: '',
  masterRVMatrixCode: null,
  tyreMatrixCode: null,
  addOnPlan: null,
  brochure: '',
  IsOnline: false,
  vehicleSegment: null,
  repVehicleSegment: null,
}

let serviceDefaultValues = {
  serviceName: null,
  serviceOccurance: '',
  correctionFactor: '',
  inspectionRatio: '',
  // serviceIntervals: '',
}