import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { T } from '@fullcalendar/core/internal-common';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Location } from '@angular/common';
import { CreateRolePopUpComponent } from '../../assign-role/create-role-pop-up/create-role-pop-up.component';
import { MatDialog } from '@angular/material/dialog';

interface RouteData {
  breadcrumb?: string;
}

interface MenuItem {
  MenuId: number;
  Menu: string;
  SubmenuList?: MenuItem[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface FoodNode {
  name: string;
  SubmenuList?: FoodNode[];
}

interface MenuNode {
  MenuId: number;
  Menu: string;
  SubmenuList?: any[];
}

interface SubmenuNode {
  SubMenuId: number;
  SubMenuName: string;
  URL?: string | null;
  ChildMenuList?: ChildMenuNode[];
}

interface ChildMenuNode {
  Id: number;
  ChildMenuName: string;
  URL?: string | null;
  AccessLevelArray: number[];
}

@Component({
  selector: 'app-assign-menu-role',
  templateUrl: './assign-menu-role.component.html',
  styleUrls: ['./assign-menu-role.component.scss']
})
export class AssignMenuRoleComponent {
  @ViewChild('targetDiv', { static: true }) targetDiv!: ElementRef<HTMLDivElement>;
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  displayedColumns: string[] = ['subMenus', 'add', 'edit', 'view', 'delete', 'approve', 'selectAll'];
  dataSource = new MatTableDataSource<menuOptionsLits>();
  optionsList: menuOptionsLits[] = [];
  accessLevelList!: any[];
  menuList: any;
  userList: any;
  roleList: any[] = [];
  roles: any[] = [];
  rolewiseUserList: any;
  selectedMenu: any;
  selectedMenuId: any;
  selctedUser: any;
  selectedRole: any;
  menuForm!: FormGroup;
  verticalList: any[] = [];
  accessTableList: any;
  selectedRoleIdList: any;
  submitted: boolean = false;
  isUserSelected: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  RoleId: any;
  isRoleSelected: boolean = false;
  AspNetRoleId: boolean = false;
  IsMenuSelected: boolean = false;
  panelOpenState = false;

  ParentMenuCtrl = new FormControl<string[]>([], Validators.required);
  selectedParentMenu: any;

  constructor(
    private clientService: ClientService,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
    private router: Router,
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

    this.menuForm = this.fb.group({
      // menu: [null, [Validators.required,]],
      // userName: [null, [Validators.required,]],
      role: [null, [Validators.required,]],
    });


    this.getParenMenu();
    this.getAllRoles();
    this.accessTableList = [];
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin / User and Roles';
      this.breadcrumbService.setBreadcrumbs(['Admin / User and Roles', breadcrumb]);
    });
  }

  get validators() {
    return this.menuForm.controls;
  }

  // hasChild = (_: number, node: FoodNode) => !!node.SubmenuList && node.SubmenuList.length > 0;
  hasSubmenu = (_: number, node: MenuNode) => !!node.SubmenuList && node.SubmenuList.length > 0;
  hasChildMenu = (_: number, node: SubmenuNode) => !!node.ChildMenuList && node.ChildMenuList.length > 0;

  getParenMenu() {
    this.spinner.show();
    this.clientService.getParentMenu().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.menuList = res.Rows;
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

  selectedSubMenu(event: any) {
    // let item: any = event.value;
    if (event) {
      this.selectedMenu = event.MenuName;
      this.selectedMenuId = event.Id;

      this.getMenuAccessLevelArray();
    }
  }

  getMenuAccessLevelArray() {
    // let data = { menuId: this.selectedMenuId, AspNetRoleId: this.selectedRoleIdList.AspNetRoleId };

    let data = { menuId: this.selectedMenuId, roleId: this.RoleId }

    this.spinner.show();
    this.clientService.getMenuAccessLevel(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          // this.optionsList= res;
          this.verticalList = res.VerticallyAllArray;
          this.accessTableList = res.AccessList;
          // this.accessLevelList = res.Rows;
          this.accessTableList.map((item: any) => {
            for (let i = 0; i < item.AccessLevelArray.length; i++) {

              if (item.AccessLevelArray[i] == 1) {
                this.verticalList[i] = 1;
              }
            }
          });

          this.accessTableList.map((item: any) => {
            for (let i = 0; i < item.AccessLevelArray.length; i++) {
              if (item.AccessLevelArray[i] == 0) {
                this.verticalList[i] = 0;
              }
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

  UserSelection(event: any) {
    if (event) {
      // this.submitted = false;
      this.isUserSelected = true;
      this.selctedUser = event.UserName;
      this.selectedRole = event.RoleName;
      this.menuForm.get('menu')?.reset();
      this.verticalList = [];
      this.accessTableList = [];
      this.menuForm.get('role')?.setValue(event.RoleName);

      this.selectedRoleIdList = [];
      this.roleList.map(item => {
        if (item.RoleName == this.selectedRole) {
          this.selectedRoleIdList = { RoleId: item.RoleId, AspNetRoleId: item.Id };
        }
      });
      this.getRolewiseUsers();
    }
  }

  getRolewiseUsers() {
    // this.selectedRoleIdList = [];
    // this.roleList.map(item => {
    //   if (item.RoleName == this.selectedRole) {
    //     this.selectedRoleIdList = { RoleId: item.RoleId, AspNetRoleId: item.Id };
    //   }
    // });

    this.spinner.show();
    let data = this.RoleId;
    this.clientService.getUsersByRoleId(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.rolewiseUserList = res.Rows;
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

    let data1 = this.selectedRole;
    this.clientService.getRolewiseUsers(data1).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {

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

  getAllRoles() {
    let data = {
      Page: {
        PageNumber: 0,
        PageSize: 0,
        Filter: {
          RoleName: "",
          Department: "",
          CreatedbyUser: "",
          IsSearch: true,
          CreatedById: this.currentUser.UserId
        }
      }
    };

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllRoles(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.roleList = res.Records;
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

  onToggle(event: boolean, accessLevel: any, element?: any) {

    // to slide toggle as per horizontal select all option
    if (accessLevel == 'HorizontallyAll') {
      this.accessTableList.map((item: any) => {
        if (item.SubMenuName == element.SubMenuName && event) {
          item.HorizontallyAll = 1;
          item.AccessLevelArray = [1, 1, 1, 1, 1];
        }
        else if (item.SubMenuName == element.SubMenuName && event == false) {
          item.HorizontallyAll = 0;
          item.AccessLevelArray = [0, 0, 0, 0, 0];
        }
      })
    }
    else if (accessLevel == 'addVerticalAll') {
      this.accessTableList.map((item: any) => {
        if (event) {
          item.AccessLevelArray[0] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (!event) {
          item.AccessLevelArray[0] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'editVerticalAll') {
      this.accessTableList.map((item: any) => {
        if (event) {
          item.AccessLevelArray[1] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (!event) {
          item.AccessLevelArray[1] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'viewVerticalAll') {
      this.accessTableList.map((item: any) => {
        if (event) {
          item.AccessLevelArray[2] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (!event) {
          item.AccessLevelArray[2] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'deleteVerticalAll') {
      this.accessTableList.map((item: any) => {
        if (event) {
          item.AccessLevelArray[3] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (!event) {
          item.AccessLevelArray[3] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'approveVerticalAll') {
      this.accessTableList.map((item: any) => {
        if (event) {
          item.AccessLevelArray[4] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (!event) {
          item.AccessLevelArray[4] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'ElementAdd') { // to slide toggle as per columnRow of add
      this.accessTableList.map((item: any) => {
        if (item.SubMenuName == element.SubMenuName && event) {
          item.AccessLevelArray[0] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (item.SubMenuName == element.SubMenuName && event == false) {
          item.AccessLevelArray[0] = 0;
          item.HorizontallyAll = 0;
        }

      });

    }
    else if (accessLevel == 'ElementEdit') { // to slide toggle as per columnRow of Edit
      this.accessTableList.map((item: any) => {
        if (item.SubMenuName == element.SubMenuName && event) {
          item.AccessLevelArray[1] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (item.SubMenuName == element.SubMenuName && event == false) {
          item.AccessLevelArray[1] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'ElementView') { // to slide toggle as per columnRow of View
      this.accessTableList.map((item: any) => {
        if (item.SubMenuName == element.SubMenuName && event) {
          item.AccessLevelArray[2] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (item.SubMenuName == element.SubMenuName && event == false) {
          item.AccessLevelArray[2] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'ElementDelete') { // to slide toggle as per columnRow of Delete
      this.accessTableList.map((item: any) => {
        if (item.SubMenuName == element.SubMenuName && event) {
          item.AccessLevelArray[3] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (item.SubMenuName == element.SubMenuName && event == false) {
          item.AccessLevelArray[3] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }
    else if (accessLevel == 'ElementApprove') { // to slide toggle as per columnRow of add
      this.accessTableList.map((item: any) => {
        if (item.SubMenuName == element.SubMenuName && event) {
          item.AccessLevelArray[4] = 1;

          if (item.AccessLevelArray[0] == 1 && item.AccessLevelArray[1] == 1 && item.AccessLevelArray[2] == 1 && item.AccessLevelArray[3] == 1 && item.AccessLevelArray[4] == 1) {
            item.HorizontallyAll = 1;
          }
        }
        else if (item.SubMenuName == element.SubMenuName && event == false) {
          item.AccessLevelArray[4] = 0;
          item.HorizontallyAll = 0;
        }
      })
    }


    this.accessTableList.map((item: any) => {
      for (let i = 0; i < item.AccessLevelArray.length; i++) {

        if (item.AccessLevelArray[i] == 1) {
          this.verticalList[i] = 1;
        }
      }
    });

    this.accessTableList.map((item: any) => {
      for (let i = 0; i < item.AccessLevelArray.length; i++) {
        if (item.AccessLevelArray[i] == 0) {
          this.verticalList[i] = 0;
        }
      }
    });


  }

  mouseOver() {
    this.checkIfDivIsOutsideViewport();
  }

  checkIfDivIsOutsideViewport() {
    const divRect = this.targetDiv.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (
      divRect.bottom < 0 ||
      (divRect.top + divRect.height) > viewportHeight ||
      divRect.right < 0 ||
      (divRect.left + divRect.width) > viewportWidth
    ) {

      this.targetDiv.nativeElement.classList.remove('tooltiptext');
      this.targetDiv.nativeElement.classList.add('tooltiptextDiv');
    }
  }

  saveClicked() {
    this.submitted = true;
    if (this.menuForm.status == 'VALID' && this.selectedMenuId) {

      let data = {
        RoleId: this.RoleId,
        AspNetRoleId: this.AspNetRoleId,
        MenuId: this.selectedMenuId,
        VerticallyAllArray: this.verticalList,
        SubMenusAccess: this.accessTableList,
        Remarks: "menu assigned",
        IsActive: true,
        CreatedById: this.currentUser.UserId
      };

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.assignMenuAccessLevel(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('assigned menu for role successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.getMenuAccessLevelArray();
            this.commonService.sidebarDynamicMenu.next(true);
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

  resetForm() {
    this.submitted = false;
    this.isRoleSelected = false;
    this.menuForm.reset();
  }

  roleSelected(event: any) {
    this.isRoleSelected = true;
    this.selectedRole = event.RoleName;
    this.AspNetRoleId = event.Id;
    this.RoleId = event.RoleId;
    this.getRolewiseUsers();
    this.accessTableList = [];
  }

  menuSelection(event: any) {
    if (this.isRoleSelected) {
      this.selectedMenuId = event.options[0]._selectionList._value[0].Id;
      this.getMenuAccessLevelArray();
    }
  }

  createRolePopUp() {
    let dialogRef = this.dialog.open(CreateRolePopUpComponent, {
      width: '700px',
      height: '340px',
      // disableClose: true,
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllRoles();
      }
    });
  }

  trackMenu(index: number, Menu: string): string {
    return Menu;
  }

  parentMenuSelection(event: any) {
    let ParentMenuValue: any = this.ParentMenuCtrl.value;
    this.selectedParentMenu = ParentMenuValue[0];

    if (this.selectedParentMenu && this.isRoleSelected) {
      this.selectedMenuId = this.selectedParentMenu.Id
      this.getMenuAccessLevelArray();
    }
  }

  addMenuClick() {
    this.router.navigate(["/add-menu"], { state: { level: this.AccessLevel } })
  }


}

export interface menuOptionsLits {
  SubMenuName: string;
  add: string;
  edit: string;
  view: string;
  delete: string;
  approve: string;
  HorizontallyAll: string;
  AccessLevelArray: Array<T>;
}