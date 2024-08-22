import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../client.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { AddMenuPopUpComponent } from './add-menu-pop-up/add-menu-pop-up.component';
import { DeleteConfirmationDialogComponent } from 'src/app/shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.scss']
})
export class AddMenuComponent {

  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  parentMenuList: any;
  subMenuList: any;
  childMenuList: any;
  panelOpenState = false;
  selectedParentMenu: any;
  selectedSubMenu: any;
  selectedChildMenu: any;
  CreatedDate = new Date();
  ModifiedDate = new Date();
  isSubMenuVisible: boolean = false;
  isChildMenuVisible: boolean = false;
  IsAuditTrail: boolean = false;
  getOtherMenu: boolean = false;
  IseditClicked: boolean = false;

  invalidParent: Observable<boolean>;
  invalidSubMenu: Observable<boolean>;

  ParentMenuCtrl = new FormControl<string[]>([], Validators.required);
  SubMenuCtrl = new FormControl<string[]>([], Validators.required);
  ChildMenuCtrl = new FormControl<string[]>([], Validators.required);
  auditForm!: FormGroup;

  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private toaster: ToastrService,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
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



    this.auditForm = new FormGroup({
      auditTrailToggle: new FormControl(false)
    });

    this.getParenMenu();

    this.invalidParent = this.ParentMenuCtrl.valueChanges.pipe(
      map(() => this.ParentMenuCtrl.touched && !this.ParentMenuCtrl.valid),
    );

    this.invalidSubMenu = this.SubMenuCtrl.valueChanges.pipe(
      map(() => this.SubMenuCtrl.touched && !this.SubMenuCtrl.valid),
    );

    this.ParentMenuCtrl.reset();
    this.SubMenuCtrl.reset();
    this.ChildMenuCtrl.reset();
    this.ParentMenuCtrl.markAsTouched();
    this.SubMenuCtrl.markAsTouched();
    this.ChildMenuCtrl.markAsTouched();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin / User and Roles';
      this.breadcrumbService.setBreadcrumbs(['Admin / User and Roles', breadcrumb]);
    });
  }

  getParentMenuErrors() {
    const errors = [];
    if (this.ParentMenuCtrl.hasError('required')) {
      errors.push('Select at least one menu');
    }
    if (this.ParentMenuCtrl.hasError('cdkListboxUnexpectedMultipleValues')) {
      errors.push('You can only select one menu');
    }
    if (this.ParentMenuCtrl.hasError('cdkListboxUnexpectedOptionValues')) {
      const invalidOptions = this.ParentMenuCtrl.getError('cdkListboxUnexpectedOptionValues').values;
      errors.push(`You selected an invalid menu: ${invalidOptions[0]}`);
    }
    return errors.length ? errors : null;
  }

  getSubMenuErrors() {
    const errors = [];
    if (this.SubMenuCtrl.hasError('required')) {
      errors.push('Select at least one menu');
    }
    if (this.SubMenuCtrl.hasError('cdkListboxUnexpectedMultipleValues')) {
      errors.push('You can only select one menu');
    }
    if (this.SubMenuCtrl.hasError('cdkListboxUnexpectedOptionValues')) {
      const invalidOptions = this.SubMenuCtrl.getError('cdkListboxUnexpectedOptionValues').values;
      errors.push(`You selected an invalid menu: ${invalidOptions[0]}`);
    }
    return errors.length ? errors : null;
  }

  subMenuFocused(event: any) {
    if (!this.isSubMenuVisible) {
      this.ParentMenuCtrl.setValue([]);
    }
  }

  childMenuFocused(event: any) {
    if (!this.isChildMenuVisible && this.selectedParentMenu != null && this.selectedParentMenu != undefined) {
      this.SubMenuCtrl.setValue([]);
    }
  }

  trackMenu(index: number, Menu: string): string {
    return Menu;
  }

  getParenMenu() {
    this.spinner.show();
    this.clientService.getParentMenu().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.parentMenuList = res.Rows;
          this.spinner.hide();
        }
      }
      else {
        this.spinner.hide();
      }
    });
  }

  getsubMenu() {
    this.subMenuList = [];
    this.spinner.show();
    let data = this.selectedParentMenu.Id;
    this.clientService.getSubMenuById(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.subMenuList = res.Rows;
          this.spinner.hide();
        }
      }
      else {
        this.spinner.hide();
      }
    })
  }

  getChildMenu() {
    this.childMenuList = [];
    this.spinner.show();
    let data = this.selectedSubMenu.Id;
    this.clientService.getChildMenuBySubMenuId(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.childMenuList = res.Rows;
          this.spinner.hide();
        }
      }
      else {
        this.spinner.hide();
      }
    })
  }

  disableParentMenu(item: any) {
    let Id = item.Id;
    this.spinner.show();
    this.clientService.disableParentMenu(Id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.commonService.sidebarDynamicMenu.next(true);
          this.toaster.success(res.Message, undefined, {
            positionClass: 'toast-top-center'
          });
          this.getParenMenu();
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

  disableSubMenu(item: any) {
    let Id = item.Id;
    this.spinner.show();
    this.clientService.disableSubMenu(Id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.commonService.sidebarDynamicMenu.next(true);
          this.toaster.success(res.Message, undefined, {
            positionClass: 'toast-top-center'
          });
          this.getsubMenu();
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

  disableChildMenu(item: any) {
    let Id = item.Id;
    this.spinner.show();
    this.clientService.disableChildMenu(Id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.commonService.sidebarDynamicMenu.next(true);
          this.toaster.success(res.Message, undefined, {
            positionClass: 'toast-top-center'
          });
          this.getChildMenu();
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

  parentMenuSelection(event: any) {
    // this.selectedParentMenu = event.options[0]._selectionList._value[0];
    this.subMenuList = [];
    this.childMenuList = [];
    this.selectedSubMenu = [];
    this.selectedChildMenu = [];
    this.isSubMenuVisible = true;
    this.isChildMenuVisible = false;
    let ParentMenuValue: any = this.ParentMenuCtrl.value;
    this.selectedParentMenu = ParentMenuValue[0];

    if (this.selectedParentMenu && this.getOtherMenu && !this.IseditClicked) {
      this.CreatedDate = new Date(this.selectedParentMenu.CreatedDate);
      this.ModifiedDate = new Date(this.selectedParentMenu.ModifiedDate);
      this.getsubMenu();
    }
  }

  subMenuSelection(event: any) {
    this.childMenuList = [];
    this.selectedChildMenu = [];
    this.isChildMenuVisible = true;
    let SubMenuValue: any = this.SubMenuCtrl.value;
    this.selectedSubMenu = SubMenuValue[0];

    if (this.selectedSubMenu && this.getOtherMenu && !this.IseditClicked) {
      if (this.selectedSubMenu.CreatedDate) {
        this.CreatedDate = new Date(this.selectedSubMenu.CreatedDate);
        this.ModifiedDate = new Date(this.selectedSubMenu.ModifiedDate);
      }

      this.getChildMenu();
    }
  }

  childMenuSelection(event: any) {
    let ChildMenuValue: any = this.ChildMenuCtrl.value;
    this.selectedChildMenu = ChildMenuValue[0];

    if (this.selectedChildMenu.CreatedDate) {
      this.CreatedDate = new Date(this.selectedChildMenu.CreatedDate);
      this.ModifiedDate = new Date(this.selectedChildMenu.ModifiedDate);
    }

  }

  resetForm() {
    this.isChildMenuVisible = false;
    this.isSubMenuVisible = false;
    this.selectedParentMenu = null;
    this.selectedSubMenu = null;
    this.selectedChildMenu = null;
    this.subMenuList = [];
    this.childMenuList = [];
    this.CreatedDate = new Date();
    this.ModifiedDate = new Date();
    this.ParentMenuCtrl.reset();
    this.SubMenuCtrl.reset();
    this.ChildMenuCtrl.reset();
    this.ParentMenuCtrl.markAsTouched();
    this.SubMenuCtrl.markAsTouched();
    this.ChildMenuCtrl.markAsTouched();

    this.auditForm.get('auditTrailToggle')?.setValue(false);
  }

  addMenuPopUp(value: any, mode?: any, Menu?: any) {

    if (value == 'parentMenu') {
      let dialogRef = this.dialog.open(AddMenuPopUpComponent, {
        width: '700px',
        height: '250px',
        data: { menuType: 'parentMenu', mode: mode ? mode : '', selectedMenuData: Menu ? Menu : '' }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getParenMenu();
        }
      });
    }
    else if (value == 'subMenu') {
      let dialogRef = this.dialog.open(AddMenuPopUpComponent, {
        width: '760px',
        height: '280px',
        data: { menuType: 'subMenu', selectedParentMenu: this.selectedParentMenu, mode: mode ? mode : '', selectedMenuData: Menu ? Menu : '' }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getsubMenu();
        }
      });
    }
    else if (value == 'childMenu') {
      let dialogRef = this.dialog.open(AddMenuPopUpComponent, {
        width: '760px',
        height: '280px',
        data: { menuType: 'childMenu', selectedSubMenu: this.selectedSubMenu, mode: mode ? mode : '', selectedMenuData: Menu ? Menu : '' }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getChildMenu();
        }
      });
    }
  }

  openDialogDisableMenu(value: any, element: any, mode: any): void {
    let dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '500px',
      height: '200px',
      disableClose: true,
      data: { moduleName: 'Menu', mode: mode, selectedMenuData: element ? element : '', AccessLevel: this.AccessLevel }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (value == 'parentMenu') {
          this.disableParentMenu(element);
        }
        else if (value == 'subMenu') {
          this.disableSubMenu(element);
        }
        else if (value == 'childMenu') {
          this.disableChildMenu(element);
        }

        // this.commonService.sidebarDynamicMenu.next(true);
      }
    });
  }

  onTogglechange(event: any) {
    if (event.checked) {
      this.IsAuditTrail = false;
      this.auditForm.get('auditTrailToggle')?.setValue(false);
    }
    else if (!event.checked) {
      this.auditForm.get('auditTrailToggle')?.setValue(true);
    }
  }
}
