import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreateRolePopUpComponent } from '../../assign-role/create-role-pop-up/create-role-pop-up.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { DataService } from '../../core/http/data.service';

@Component({
  selector: 'app-add-menu-pop-up',
  templateUrl: './add-menu-pop-up.component.html',
  styleUrls: ['./add-menu-pop-up.component.scss']
})
export class AddMenuPopUpComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  submitted: boolean = false;
  editMode: boolean = false;
  selectedData: any;

  addMenuForm!: FormGroup;

  IsParentMenu: boolean = false;
  IsSubMenu: boolean = false;
  IsChildMenu: boolean = false;
  selectedmenuType: string = " Menu";
  selectedParentMenuId: number = 0;
  selectedSubMenuId: number = 0;
  editMenuId: number = 0;
  IsAuditTrail: boolean = false;
  selectedParentMenuData: any;
  selectedSubMenuData: any;
  selectedChildMenuData: any;

  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CreateRolePopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private dataService: DataService,
    private clientService: ClientService,
    protected commonService: CommonService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
  ) {

    this.dialogRef.disableClose = true;
    if (history.state.level) {
      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }

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

    this.commonService.updateTheme.subscribe(res => {
      if (res) {
        this.mainThemeClass = res;
      }

    });

    this.addMenuForm = this.fb.group({
      menuName: ['', [Validators.required]],
      menuUrl: [''],
      remarks: ['', [Validators.required]],
      IsAuditTrail: [false],
    });

    this.addMenuForm.markAllAsTouched();
    if (data) {
      this.selectedmenuType = data.menuType;
      if (data.menuType == 'parentMenu') {
        this.selectedmenuType = "Main Menu";
        this.IsParentMenu = true;
        this.IsSubMenu = false;
        this.IsChildMenu = false;
        if (data.mode == 'edit' && data.selectedMenuData) {
          this.editMode = true;
          this.addMenuForm.get('menuName')?.setValue(data.selectedMenuData.MenuName);
          this.addMenuForm.get('remarks')?.setValue(data.selectedMenuData.Remarks);
          this.editMenuId = data.selectedMenuData.Id;
          this.selectedParentMenuData = data.selectedMenuData;
        }
        this.addMenuForm.get('menuUrl')?.removeValidators([Validators.required]);
        this.addMenuForm.updateValueAndValidity();
        this.addMenuForm.markAllAsTouched();
      }
      else if (data.menuType == 'subMenu') {
        this.selectedParentMenuId = data.selectedParentMenu.Id;

        this.selectedmenuType = "Sub Menu"
        this.IsSubMenu = true;
        this.IsParentMenu = false;
        this.IsChildMenu = false;
        if (data.mode == 'edit' && data.selectedMenuData) {
          this.editMode = true;
          this.addMenuForm.get('menuName')?.setValue(data.selectedMenuData.MenuName);
          this.addMenuForm.get('menuUrl')?.setValue(data.selectedMenuData.URL);
          this.addMenuForm.get('remarks')?.setValue(data.selectedMenuData.Remarks);
          this.addMenuForm.get('IsAuditTrail')?.setValue(data.selectedMenuData.IsAuditTrail);
          this.editMenuId = data.selectedMenuData.Id;
          this.selectedSubMenuData = data.selectedMenuData;
        }
        this.addMenuForm.get('menuUrl')?.removeValidators([Validators.required]);
        this.addMenuForm.updateValueAndValidity();
        this.addMenuForm.markAllAsTouched();
      }
      else if (data.menuType == 'childMenu') {
        this.selectedSubMenuId = data.selectedSubMenu.Id;

        this.selectedmenuType = "Child Menu"
        this.IsChildMenu = true;
        this.IsParentMenu = false;
        this.IsSubMenu = false;
        if (data.mode == 'edit' && data.selectedMenuData) {
          this.editMode = true;
          this.addMenuForm.get('menuName')?.setValue(data.selectedMenuData.ChildMenuName);
          this.addMenuForm.get('menuUrl')?.setValue(data.selectedMenuData.URL);
          this.addMenuForm.get('remarks')?.setValue(data.selectedMenuData.Remarks);
          this.addMenuForm.get('IsAuditTrail')?.setValue(data.selectedMenuData.IsAuditTrail);
          this.editMenuId = data.selectedMenuData.Id;
          this.selectedChildMenuData = data.selectedMenuData;
        }
        this.addMenuForm.get('menuUrl')?.setValidators([Validators.required]);
        this.addMenuForm.updateValueAndValidity();
        this.addMenuForm.markAllAsTouched();

      }

    }

  }

  get validators() {
    return this.addMenuForm.controls;
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.addMenuForm.reset();
  }

  close() {
    this.dialogRef.close();
  }

  addParentMenu() {
    this.submitted = true;

    if (this.addMenuForm.status == "VALID") {
      let data = {
        SubMenuId: null,
        MenuName: this.addMenuForm.value.menuName,
        URL: this.addMenuForm.value.menuUrl,
        Dormant: false,
        OrderBy: 1,
        ShortCut: "",
        Description: "",
        Remarks: this.addMenuForm.value.remarks,
        IsMobile: 0,
        IsAuditTrail: this.addMenuForm.value.IsAuditTrail,
        CreatedById: this.currentUser.UserId,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.addParentMenu(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.submitted = false;
            this.dialogRef.close(true);
            this.toaster.success('Parent menu added successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.addMenuForm.reset();
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

  addSubMenu() {
    this.submitted = true;

    if (this.addMenuForm.status == "VALID") {
      let data = {
        SubMenuId: this.selectedParentMenuId,
        MenuName: this.addMenuForm.value.menuName,
        URL: this.addMenuForm.value.menuUrl,
        Dormant: false,
        OrderBy: 1,
        ShortCut: "",
        Description: "",
        Remarks: this.addMenuForm.value.remarks,
        IsMobile: 0,
        IsAuditTrail: this.addMenuForm.value.IsAuditTrail,
        CreatedById: this.currentUser.UserId,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.addSubMenu(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.submitted = false;
            this.dialogRef.close(true);
            this.toaster.success('Sub menu added successfully', undefined, {
              positionClass: 'toast-top-center'
            });

            this.spinner.hide();
            this.addMenuForm.reset();
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

  addChildMenu() {
    this.submitted = true;

    if (this.addMenuForm.status == "VALID") {
      let data = {
        SubMenuId: this.selectedSubMenuId,
        ChildMenuName: this.addMenuForm.value.menuName,
        URL: this.addMenuForm.value.menuUrl,
        Dormant: false,
        IsAuditTrail: this.addMenuForm.value.IsAuditTrail,
        Remarks: this.addMenuForm.value.remarks,
        CreatedById: this.currentUser.UserId,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));
      this.spinner.show();
      this.clientService.addChildMenu(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.submitted = false;
            this.dialogRef.close(true);
            this.toaster.success('Child menu added successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.addMenuForm.reset();
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

  updateParentMenu() {
    this.submitted = true;

    if (this.addMenuForm.status == "VALID") {
      // let data = {
      //   Id: this.editMenuId,
      //   ModifiedById: this.currentUser.UserId,

      //   SubMenuId: null,
      //   MenuName: this.addMenuForm.value.menuName,
      //   URL: this.addMenuForm.value.menuUrl,
      //   Dormant: false,
      //   OrderBy: 1,
      //   ShortCut: "",
      //   Description: "",
      //   Remarks: this.addMenuForm.value.remarks,
      //   IsMobile: 0,
      //   IsAuditTrail: this.addMenuForm.value.IsAuditTrail,
      // }

      this.selectedParentMenuData.ModifiedById = this.currentUser.UserId;
      this.selectedParentMenuData.MenuName = this.addMenuForm.value.menuName;
      this.selectedParentMenuData.URL = this.addMenuForm.value.menuUrl;
      this.selectedParentMenuData.Remarks = this.addMenuForm.value.remarks;
      this.selectedParentMenuData.IsAuditTrail = this.addMenuForm.value.IsAuditTrail;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedParentMenuData));
      this.spinner.show();
      this.clientService.updateParentMenu(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.submitted = false;
            this.dialogRef.close(true);
            this.toaster.success('Parent menu updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.addMenuForm.reset();
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

  updateSubMenu() {
    this.submitted = true;

    if (this.addMenuForm.status == "VALID") {
      // let data = {
      //   Id: this.editMenuId,
      //   ModifiedById: this.currentUser.UserId,

      //   SubMenuId: this.selectedParentMenuId,
      //   MenuName: this.addMenuForm.value.menuName,
      //   URL: this.addMenuForm.value.menuUrl,
      //   Dormant: false,
      //   OrderBy: 1,
      //   ShortCut: "",
      //   Description: "",
      //   Remarks: this.addMenuForm.value.remarks,
      //   IsMobile: 0,
      //   IsAuditTrail: this.addMenuForm.value.IsAuditTrail,
      // }

      this.selectedSubMenuData.ModifiedById = this.currentUser.UserId;
      // this.selectedSubMenuData.SubMenuId = this.selectedParentMenuId;
      this.selectedSubMenuData.MenuName = this.addMenuForm.value.menuName;
      this.selectedSubMenuData.URL = this.addMenuForm.value.menuUrl;
      this.selectedSubMenuData.Remarks = this.addMenuForm.value.remarks;
      this.selectedSubMenuData.IsAuditTrail = this.addMenuForm.value.IsAuditTrail;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedSubMenuData));
      this.spinner.show();
      this.clientService.updateSubMenu(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.submitted = false;
            this.dialogRef.close(true);
            this.toaster.success('Sub menu updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });

            this.spinner.hide();
            this.addMenuForm.reset();
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

  updateChildMenu() {
    this.submitted = true;

    if (this.addMenuForm.status == "VALID") {
      // let data = {
      //   Id: this.editMenuId,
      //   ModifiedById: this.currentUser.UserId,

      //   SubMenuId: this.selectedSubMenuId,
      //   ChildMenuName: this.addMenuForm.value.menuName,
      //   URL: this.addMenuForm.value.menuUrl,
      //   Dormant: false,
      //   Remarks: this.addMenuForm.value.remarks,
      //   IsAuditTrail: this.addMenuForm.value.IsAuditTrail,
      // }

      this.selectedChildMenuData.ModifiedById = this.currentUser.UserId;
      // this.selectedChildMenuData.SubMenuId = this.selectedSubMenuId;
      this.selectedChildMenuData.ChildMenuName = this.addMenuForm.value.menuName;
      this.selectedChildMenuData.URL = this.addMenuForm.value.menuUrl;
      this.selectedChildMenuData.Remarks = this.addMenuForm.value.remarks;
      this.selectedChildMenuData.IsAuditTrail = this.addMenuForm.value.IsAuditTrail;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedChildMenuData));
      this.spinner.show();
      this.clientService.updateChildMenu(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.submitted = false;
            this.dialogRef.close(true);
            this.toaster.success('Child menu updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.addMenuForm.reset();
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

  onTogglechange(checked: boolean) {
    if (checked) {
      this.IsAuditTrail = true;
    }
    else {
      this.IsAuditTrail = false;
    }
  }
}
