import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { DataService } from '../../core/http/data.service';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Location } from '@angular/common';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('role') public ngSelectComponent: NgSelectComponent;

  displayedColumns = ['Department', 'Role', 'Level', 'CreatedBy', 'CreatedDate', 'Action'];
  rolesList: any[] = [];
  @ViewChild('rolesTableList') rolesTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  createRoleForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  levelList: any;
  roleId: number = 0;
  selectedRoleData: any;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  departmentList: any;
  departmentId: number = 0;
  departmentName: any;
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Department' },
    { filterName: 'Roles' },
    // { filterName: 'Level' },
    { filterName: 'Created By' },
    // { filterName: 'Created Date' },
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
    private clientService: ClientService,
    protected commonService: CommonService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
  ) {

    if (history.state.level) {
      this.AccessLevel = history.state.level;
      this.TransactionId = history.state.TransactionId;
      this.roleId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        // this.getAllRolesList();
      }
      else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        // this.getAllRolesList();
      }
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

    this.createRoleForm = this.fb.group({
      roleName: ['', [Validators.required]],
      department: [null, Validators.required],
      remarks: ['', [Validators.required]],
      level: [null, [Validators.required]]
    });

    this.createRoleForm.markAllAsTouched();

    this.levelList = [{ Id: 1, type: 'L1' }, { Id: 2, type: 'L2' }, { Id: 3, type: 'L3' }, { Id: 4, type: 'L4' }, { Id: 5, type: 'L5' }, { Id: 6, type: 'L6' }, { Id: 7, type: 'L7' }];
    this.getDepartment();
    this.getAllRolesList();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin / User and Roles';
      this.breadcrumbService.setBreadcrumbs(['Admin / User and Roles', breadcrumb]);
    });
  }

  getAllRolesList() {

    const data =
    {
      Page:
      {
        // PageNumber: this.PageNumber + 1,
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.IsSearch,
          SearchValue: this.searchText,
          // Department: this.selectedFilter.filterName == "Department" ? this.searchText : "",
          // RoleName: this.selectedFilter.filterName == "Roles" ? this.searchText : "",
          // Level: this.selectedFilter.filterName == "Level" ? this.searchText : "",
          // CreatedBy: this.selectedFilter.filterName == "Created By" ? this.searchText : "",
          // CreatedDate: this.selectedFilter.filterName == "Created Date" ? this.searchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllRoles(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.rolesList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.rolesList.map((item, index) => {
            item.position = index;
          });
          if (this.rolesList && this.rolesList.length > 0) {
            this.rolesList.map((item) => {
              if (item.BudgetID == this.roleId) {
                if (this.IsApproverView) {
                  this.setDataApprover(item);
                }
                if (this.isView) {
                  this.setDataView(item);
                }
              }
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

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllRolesList();
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
      this.getAllRolesList();
    }, 500);
  }

  get validators() {
    return this.createRoleForm.controls;
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
            this.resetForm();
            this.getAllRolesList();

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

  updateRole() {
    this.submitted = true;
    if (this.createRoleForm.status == "VALID") {
      let data = {
        Id: this.roleId,
        DepartmentId: this.createRoleForm.value.department,
        RoleName: this.createRoleForm.value.roleName,
        Remarks: this.createRoleForm.value.remarks,
        Level: this.createRoleForm.value.level,
        ModifiedById: this.currentUser.UserId,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateRole(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Role updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllRolesList();

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

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllRolesList();
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
    this.getAllRolesList();
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
    this.selectedRowIndex = null;
    this.createRoleForm.reset();
    this.createRoleForm.get('level')?.setValue(null);
    this.createRoleForm.get('department')?.setValue(null);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.createRoleForm.reset(defaultValues);
    this.submitted = false;
    this.roleId = data.Id;
    this.selectedRoleData = data;
    this.isView = false;
    this.IsApproverView = false;

    this.createRoleForm.get('department')?.setValue(Number(data.DepartmentId));
    this.createRoleForm.get('roleName')?.setValue(data.RoleName);
    this.createRoleForm.get('level')?.setValue(data.Level);
    this.createRoleForm.get('remarks')?.setValue(data.Remarks);
  }

  setDataView(data: any) {
    this.scrollToTop();
    this.createRoleForm.reset(defaultValues);
    this.submitted = false;
    this.roleId = data.Id;
    this.selectedRoleData = data;
    this.isView = true;
    this.editMode = false;
    this.IsApproverView = false;

    this.createRoleForm.get('department')?.setValue(Number(data.DepartmentId));
    this.createRoleForm.get('roleName')?.setValue(data.RoleName);
    this.createRoleForm.get('level')?.setValue(data.Level);
    this.createRoleForm.get('remarks')?.setValue(data.Remarks);
    this.createRoleForm.disable();
  }

  setDataApprover(data: any) {
    this.scrollToTop();
    this.createRoleForm.reset(defaultValues);
    this.submitted = false;
    this.roleId = data.Id;
    this.selectedRoleData = data;
    this.editMode = false;
    this.isView = false;
    this.IsApproverView = true;

    this.createRoleForm.get('department')?.setValue(Number(data.DepartmentId));
    this.createRoleForm.get('roleName')?.setValue(data.RoleName);
    this.createRoleForm.get('level')?.setValue(data.Level);
    this.createRoleForm.get('remarks')?.setValue(data.Remarks);
    this.createRoleForm.disable();

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.rolesList = this.commonService.customSort(this.rolesList, sortState.active, sortState.direction);
      this.rolesTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllRolesList();
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
  roleName: '',
  department: null,
  remarks: '',
  level: null
}