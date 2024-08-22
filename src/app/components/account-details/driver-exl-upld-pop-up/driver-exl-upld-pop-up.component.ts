import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { AddCompilanceComponent } from '../../compilance/add-compilance/add-compilance.component';
import { DataService } from '../../core/http/data.service';
import { Constant } from 'src/app/shared/model/constant';

@Component({
  selector: 'app-driver-exl-upld-pop-up',
  templateUrl: './driver-exl-upld-pop-up.component.html',
  styleUrls: ['./driver-exl-upld-pop-up.component.scss']
})
export class DriverExlUpldPopUpComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;

  uploadDriverExlForm!: FormGroup;
  submitted: boolean = false;
  media: string | Blob;
  fileUploaded: boolean = false;
  ClientId: number = 0;
  clientList: any;
  files: File[] = [];
  fileName: string = '';
  imageUrl: string = '';
  fileType: string = '';
  url: any = '';
  excelType = Constant.excelType;
  attachmentType: string = '';
  excelUploaded: boolean = false;

  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<AddCompilanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private dataService: DataService,
    private clientService: ClientService,
    protected commonService: CommonService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {

    if (history.state.level) {
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);

    if (this.localTheme == null || this.localTheme == '') {
      this.mainThemeClass = 'default-blue-colored-theme';
    }
    else {
      this.mainThemeClass = this.localTheme.themeClass;
    }

    this.commonService.updateTheme.subscribe(res => {
      if (res) {
        this.mainThemeClass = res;
      }

    });

    this.uploadDriverExlForm = new FormGroup({
      clientName: new FormControl(null, [Validators.required,]),
      // driverExcel: new FormControl('', [Validators.required]),

    });
    this.uploadDriverExlForm.markAllAsTouched();
    this.GetAllClients();
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

  get validators() {
    return this.uploadDriverExlForm.controls;
  }

  selectedClient(event: any) {
    if (event) {
      this.ClientId = event.ClientId;
    }
  }

  // //upload media
  // upload(event: any) {
  //   var files = event.target.files[0];
  //   if (this.commonService.validateExcelFile(files)) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(files);
  //     reader.onload = () => {
  //     };
  //     this.media = files;
  //   }
  //   else {
  //     this.uploadDriverExlForm.get('driverExcel')?.reset();
  //   }
  // }

  uploadFile() {
    console.log(this.uploadDriverExlForm);

    this.submitted = true;
    if (this.uploadDriverExlForm.status=='VALID' && this.files && this.files.length>0) {

      var data = {
        ClientId: this.uploadDriverExlForm.value.clientName,
        CreatedById: this.currentUser.UserId
      }
      let formData: FormData = new FormData();
      formData.append('RequestData', JSON.stringify(data));
      // formData.append('files', this.media);
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }
      this.spinner.show();
      this.clientService.importDriversUSers(formData).subscribe((res: any) => {
        if (!res.HasErrors) {
          this.spinner.hide();
          this.fileUploaded = true;
          this.submitted = false;
          this.toaster.success("File uploaded Successfully", undefined, {
            positionClass: 'toast-top-center'
          });
          this.uploadDriverExlForm.reset();
          this.dialogRef.close(true);

        } else {
          this.spinner.hide();
          this.toaster.error(res?.Errors[0]?.Message, undefined, {
            positionClass: 'toast-top-center'
          });
        }
      });
    }
  }

  getDriverExlFormat() {
    this.spinner.show();
    this.clientService.getDriverExlFormat().subscribe((res: any) => {
      if (!res.HasErrors) {
        this.downloadExlFile(res.ExcelBase64);
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    });
  }

  downloadExlFile(file: string): void {
    const sourceFile = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${file}`;
    const link = document.createElement('a');
    link.href = sourceFile;
    link.download = `Sample.xlsx`;
    link.click();
  }

  close() {
    this.dialogRef.close();
  }

  onSelect(event: any) {
    this.files = [];
    this.toaster.clear();
    this.files.push(...event.addedFiles);
    if (this.commonService.validateExcelFile(this.files[0])) {
      const reader = new FileReader();
      reader.readAsDataURL(this.files[0]);
      reader.onload = () => {
        this.url = reader.result as string;
      };
      this.fileName = this.files[0]?.name;
      this.fileType = this.files[0]?.type;
      // this.attachmentType = this.fileType.split('/')[1];
      // if (this.excelType.includes(this.attachmentType)) {
      //   this.excelUploaded = true;
      // }
      // else {
      //   this.excelUploaded = false;
      // }

    }
  }
}
