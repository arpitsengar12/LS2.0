import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../client.service';
import { DataService } from '../core/http/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Constant } from 'src/app/shared/model/constant';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CreateRolePopUpComponent } from './create-role-pop-up/create-role-pop-up.component';
import { DatePipe } from '@angular/common';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-assign-role',
  templateUrl: './assign-role.component.html',
  styleUrls: ['./assign-role.component.scss'],
})
export class AssignRoleComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('role') public ngSelectComponent: NgSelectComponent;
  @ViewChild('rolesTableList') rolesTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  displayedColumns = ['UserName', 'Department', 'ReportTo', 'RoleName', 'CreatedDate', 'Action'];
  //dataSource = new MatTableDataSource<userDetails>();
  userDetailsList: any[] = [];
  panelOpenState = false;

  assignRoleForm!: FormGroup;
  submitted: boolean = false;
  editMode: boolean = false;
  userNameList: any;
  userRoleList: any;
  roleIntId: number = 0;
  selectedRoleData: any;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  userSelected: any;
  roleSelected: any;
  roleSelectedList: any[] = [];
  selectedUserIntId: any;
  selectedUserRoleId: any[] = [];
  isUserSelected: boolean = false;
  isRoleSelected: boolean = false;
  searchText = '';
  unAssignUsers: any;
  departmentList: any;
  departmentId: number = 0;
  departmentName: any;
  userListDropdown: any;
  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  selectedUser: any;
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'User Name' },
    { filterName: 'Department' },
    { filterName: 'Report To' },
    { filterName: 'Roles' },
    { filterName: 'Created Date' },
  ];
  filterBtnClicked: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
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
    private datePipe: DatePipe,
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
    this.assignRoleForm = this.fb.group({
      userName: [null, [Validators.required,]],
      roleId: [null, [Validators.required,]],
      department: [null, [Validators.required,]],
      reportTo: [null,],
    });

    this.getAssignedUserList();
    this.getUnassignUsers();
    this.getDepartment();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin / User and Roles';
      this.breadcrumbService.setBreadcrumbs(['Admin / User and Roles', breadcrumb]);
    });
  }

  getAssignedUserList() {

    const data =
    {
      Page:
      {
        // PageNumber: this.PageNumber + 1,
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          SearchValue: this.searchText,
          IsSearch: this.IsSearch,
          // UserName: this.selectedFilter.filterName == "User Name" ? this.searchText : "",
          // RoleName: this.selectedFilter.filterName == "Roles" ? this.searchText : "",
          // Department: this.selectedFilter.filterName == "Department" ? this.searchText : "",
          // ReportTo: this.selectedFilter.filterName == "Report To" ? this.searchText : "",
          // // CreatedDate: this.selectedFilter.filterName == "Created Date" ? this.searchText : "",
          // CreatedDate: this.selectedFilter.filterName == "Created Date" ? Constant.dateFormatDDMMYYYY.test(this.searchText) ? this.formatDateInISO(this.searchText) : "" : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAssignedRole(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.userDetailsList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.userDetailsList.map((item, index) => {
            item.position = index;
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

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAssignedUserList();
      }
    }
    else {
      this.selectedFilter = { filterName: '' };
    }
  }


  // to search on the text input
  SearchFilterApplied() {
    this.IsSearch = this.searchText && this.searchText != '' ? true : false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.getAssignedUserList();
    }, 500);
  }

  get validators() {
    return this.assignRoleForm.controls;
  }

  getRolesByDepartment() {
    this.spinner.show();
    this.clientService.getRolesByDepartment(this.departmentId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.userRoleList = res.Rows;
          // this.userRoleList.map((item: any) => {
          //   item.selected = false;
          // });
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

  getUserList() {
    const data =
    {
      Page: {
        PageNumber: 0, PageSize: 0,
        Filter: { Search: this.searchText }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getUser(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.userNameList = res.Records;
          this.totalRecords = res.TotalCount;
          // this.userNameList.map((item: any) => {
          //   item.selected = false;
          // });
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

  getRoleSelected(event: Event, item: any) {

    this.userRoleList.map((value: any) => {
      if (value == item) {
        value.selected = true;
        item.selected = true;
      }
      else {
        value.selected = false;
      }
    });
    if (item.selected) {
      this.roleSelected = item.RoleName;
    }

    if (this.roleSelected) {
      this.isRoleSelected = true;
    }
    else {
      this.isRoleSelected = false;
    }
  }

  userSelection(event: any) {
    if (event) {
      this.selectedUser = event;
      this.selectedUserIntId = event.Id;
    }
  }

  assignRole() {
    this.selectedUserRoleId = [];
    this.submitted = true;
    // if (this.assignRoleForm.status == "VALID") {
    // if (this.isUserSelected && this.isRoleSelected) {
    // let nameList: any[] = this.roleSelectedList;
    // nameList.map(item => {
    //   this.userRoleList.map((value: any) => {
    //     if (item == value) {
    //       this.selectedUserRoleId.push(value.Id);
    //     }
    //   })
    // });

    // this.userRoleList.map((value: any) => {
    //   if (value.RoleName == this.roleSelected) {
    //     this.selectedUserRoleId = value.Id;
    //   }
    // });   

    if (this.assignRoleForm.valid) {

      let data = {
        RoleId: this.assignRoleForm.value.roleId,
        AspnetUserId: this.selectedUserIntId,
        CreatedById: this.currentUser.UserId,
        UserId: this.assignRoleForm.value.userName,
        DepartmentId: this.assignRoleForm.value.department,
        ReportToId: this.assignRoleForm.value.reportTo,
        Remarks: ""
      }

      this.spinner.show();
      this.clientService.assignRole(data).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Assigned role successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.assignRoleForm.reset();
            this.submitted = false;
            this.getAssignedUserList();
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
      // }
    }
  }

  UpdateAssignedRole() {
    this.selectedUserRoleId = [];
    this.submitted = true;

    if (this.assignRoleForm.valid) {

      // let data = {
      //   Id: this.roleIntId,
      //   RoleId: this.assignRoleForm.value.roleId,
      //   AspnetUserId: this.selectedUserIntId,
      //   ModifiedById: this.currentUser.UserId,
      //   UserId: this.assignRoleForm.value.userName,
      //   DepartmentId: this.assignRoleForm.value.department,
      //   ReportToId: this.assignRoleForm.value.reportTo,
      //   Remarks: "",
      //   IsActive: this.selectedRoleData.IsActive,
      // }

      this.selectedRoleData.RoleId = this.assignRoleForm.value.roleId,
        // this.selectedRoleData.AspnetUserId = this.selectedUserIntId,
        this.selectedRoleData.ModifiedById = this.currentUser.UserId,
        this.selectedRoleData.UserId = this.assignRoleForm.value.userName,
        this.selectedRoleData.DepartmentId = this.assignRoleForm.value.department,
        this.selectedRoleData.ReportToId = this.assignRoleForm.value.reportTo,

        this.spinner.show();
      this.clientService.UpdateAssignedRole(this.selectedRoleData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Assigned role updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
            this.assignRoleForm.reset();
            this.submitted = false;
            this.getAssignedUserList();
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
      // }
    }
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.selectedRowIndex = null;
    this.assignRoleForm.reset();
    this.assignRoleForm.get('userName')?.setValue(null);
    this.assignRoleForm.get('roleId')?.setValue(null);
    this.assignRoleForm.get('department')?.setValue(null);
    this.assignRoleForm.get('reportTo')?.setValue(null);
  }


  //get unassign users 
  getUnassignUsers() {
    this.spinner.show();
    this.clientService.getUnassignUsers().subscribe((res: any) => {
      if (!res.HasErrors) {
        this.unAssignUsers = res.UnAssignedUser;
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

  getAssignedRoleById(element: any) {
    this.roleIntId = element.Id;
    this.spinner.show();
    this.clientService.getAssignedRoleById(this.roleIntId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedRoleData = res;
          this.roleIntId = res.Id;
          this.editMode = true;
          this.assignRoleForm.reset();
          this.submitted = false;
          this.selectedUserIntId = res.UserId;
          this.unAssignUsers = [];
          let userData = {
            UserName: res.UserName,
            UserId: res.UserId
          };

          this.unAssignUsers.push(userData);

          if (res.DepartmentId) {
            this.departmentId = res.DepartmentId;
            this.onSelectDepartment({ Id: res.DepartmentId, DepartmentName: res.Department });
          }

          this.assignRoleForm.patchValue({
            userName: this.selectedRoleData.UserId,
            roleId: this.selectedRoleData.RoleId,
            department: this.selectedRoleData.DepartmentId,
            reportTo: this.selectedRoleData.ReportToId,
          });
          this.assignRoleForm.markAllAsTouched();
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

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAssignedUserList();
  }


  getPages(): (number | string)[] {
    const totalPages = this.totalPages();
    let startPage = Math.max(1, this.PageNumber - 1);
    let endPage = Math.min(totalPages, startPage + 1);

    // If near the end, adjust the startPage
    if (totalPages - this.PageNumber <= 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    // If near the start, adjust the endPage
    if (this.PageNumber <= 3) {
      startPage = 1;
      endPage = Math.min(5, totalPages);
    }

    const pages: (number | string)[] = [];

    // Add first page
    pages.push(1);

    // // Add ellipsis if startPage is greater than 2
    // if (startPage > 2) {
    //   pages.push('...');
    // }

    // Add pages between startPage and endPage
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis if endPage is less than totalPages - 1
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Add last page
    if (totalPages !== 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / 10);
  }

  pageClick(event: any) {
    this.PageNumber = event;
    this.getAssignedUserList();
  }

  onSelectDepartment(event: any) {
    if (event) {
      this.departmentId = event.Id;
      this.departmentName = event.DepartmentName;
      this.getUsersByDepartment();
      this.getRolesByDepartment();
    }

  }

  getUsersByDepartment() {
    // const data =
    // {
    //   Page: {
    //     PageNumber: 0, PageSize:0,
    //     Filter: { Search: this.searchText }
    //   }
    // }
    // let formData: FormData = new FormData();
    // formData.append("RequestData", JSON.stringify(data));
    this.userListDropdown = [];
    this.spinner.show();
    this.clientService.getUsersByDepartment(this.departmentId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.userListDropdown = res.AssignedUsers;
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

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.assignRoleForm.reset();
    this.submitted = false;
    this.roleIntId = data.Id;
    this.selectedRoleData = data;
    this.selectedUserIntId = data.UserId;
    this.unAssignUsers = [];
    let userData = {
      UserName: data.UserName,
      UserId: data.UserGuid
    };

    this.unAssignUsers.push(userData);

    if (data.DepartmentId) {
      this.departmentId = data.DepartmentId;
      this.onSelectDepartment({ Id: data.DepartmentId, DepartmentName: data.Department });
    }

    setTimeout(() => {
      this.assignRoleForm.get('userName')?.setValue(data.UserGuid);
      this.assignRoleForm.get('department')?.setValue(data.DepartmentId);
      this.assignRoleForm.get('roleId')?.setValue(data.RoleId);
      this.assignRoleForm.get('reportTo')?.setValue(data.ReportToId);
    }, 500)

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
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
        this.getRolesByDepartment();
      }
    });
  }

  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-dd-MM HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }


  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.userDetailsList = this.commonService.customSort(this.userDetailsList, sortState.active, sortState.direction);
      this.rolesTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAssignedUserList();
  }
}


let defaultValues = {
  userName: null,
  roleId: null,
  department: null,
  reportTo: null,
}

export interface userDetails {
  userName: string;
  RoleName: string;
  CreatedDate: string;
  //test:string;

}
