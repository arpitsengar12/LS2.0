import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { AddCompilanceComponent } from '../../compilance/add-compilance/add-compilance.component';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { DataService } from '../../core/http/data.service';
import { Constant } from 'src/app/shared/model/constant';

@Component({
  selector: 'app-create-role-pop-up',
  templateUrl: './create-role-pop-up.component.html',
  styleUrls: ['./create-role-pop-up.component.scss']
})
export class CreateRolePopUpComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  createRoleForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  levelList: any;
  roleId: number = 0;
  selectedRoleData: any;

  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  departmentList: any;
  departmentId: number = 0;
  departmentName: any;

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

    dialogRef.disableClose = true;

    this.createRoleForm = this.fb.group({
      roleName: ['', [Validators.required, Validators.pattern(Constant.textInputWtNum)]],
      department: [null, Validators.required],
      remarks: ['', [Validators.required]],
      level: [null, [Validators.required]]
    });
    this.createRoleForm.markAllAsTouched();

    this.levelList = [{ Id: 1, type: 'L1' }, { Id: 2, type: 'L2' }, { Id: 3, type: 'L3' }, { Id: 4, type: 'L4' }, { Id: 5, type: 'L5' }, { Id: 6, type: 'L6' }, { Id: 7, type: 'L7' }];
    this.getDepartment();
  }


  get validators() {
    return this.createRoleForm.controls;
  }

  //get department
  getDepartment() {
    this.spinner.show();
    this.clientService.getDepartment().subscribe((res: any) => {
      if (!res.HasErrors) {
        this.departmentList = res.Departments;
        this.spinner.hide();
      }
      else {
        this.toaster.error(res?.Errors[0]?.Message, undefined, {
          positionClass: 'toast-top-center'
        });
        this.spinner.hide();
      }
      (err: any) => {
        this.toaster.error(err, undefined, {
          positionClass: 'toast-top-center'
        });
        this.spinner.hide();
      }
    });
  }

  createRole() {
    this.submitted = true;
    if (this.createRoleForm.status == "VALID") {
      let data = {
        ApplicationId: this.currentUser.ApplicationId,
        DepartmentId: this.createRoleForm.value.department,
        RoleName: this.createRoleForm.value.roleName,
        Level: this.createRoleForm.value.level,
        Remarks: this.createRoleForm.value.remarks,
        CreatedById: this.currentUser.UserId,
      }
      this.spinner.show();
      this.clientService.addNewRole(data).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('New role created successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.createRoleForm.reset();
            this.submitted = false;
            this.dialogRef.close(true);
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

  onSelectDepartment(event: any) {
    if (event) {
      this.departmentId = event.Id;
      this.departmentName = event.DepartmentName;
    }
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.createRoleForm.reset();
    this.createRoleForm.get('level')?.setValue(null);
    this.createRoleForm.get('department')?.setValue(null);
  }

  close() {
    this.dialogRef.close();
  }
}
