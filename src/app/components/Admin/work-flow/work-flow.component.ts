import { Component, ViewChild } from '@angular/core';
import { userDetails } from '../../assign-role/assign-role.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { DataService } from '../../core/http/data.service';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-work-flow',
  templateUrl: './work-flow.component.html',
  styleUrls: ['./work-flow.component.scss']
})
export class WorkFlowComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;


  displayedColumns = ['Module Name', 'Level', 'Names', 'Action'];
  workflowList: any[] = [];
  @ViewChild('workflowTable') workflowTable!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  workFlowForm!: FormGroup;
  addedWorkFlowList: any[] = [];
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  moduleList: any[] = [];
  levelList: any;
  userLevels: any;
  userList: any;
  WFList: any[] = [];

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';

  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'ModuleName' },
    { filterName: 'Level' },
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

    this.workFlowForm = this.fb.group({
      moduleName: [null, [Validators.required]],
      level: [null, [Validators.required]],
      approver1: [null],
      approver2: [null],
      approver3: [null],
      approver4: [null],
      approver5: [null],
      approver6: [null],
      approver7: [null],
      approver8: [null],
      approver9: [null],
      approver10: [null],
    });

    this.workFlowForm.markAllAsTouched();

    this.levelList = [{ Id: 1, type: 'Level 1' }, { Id: 2, type: 'Level 2' }, { Id: 3, type: 'Level 3' }, { Id: 4, type: 'Level 4' }, { Id: 5, type: 'Level 5' }, { Id: 6, type: 'Level 6' }, { Id: 7, type: 'Level 7' }, { Id: 8, type: 'Level 8' }, { Id: 9, type: 'Level 9' }, { Id: 10, type: 'Level 10' }];
    this.getAllWorkFlowList();
    this.getWorkflowDropdowns();
    this.getusersList();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin';
      this.breadcrumbService.setBreadcrumbs(['Admin', breadcrumb]);
    });
  }

  getAllWorkFlowList() {

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

        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllWorkFlowList(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.workflowList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.workflowList.map((item, index) => {
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

  getWorkflowDropdowns() {
    this.spinner.show();
    this.clientService.getWorkflowDropdowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          // this.moduleList = res.Rows;

          this.moduleList = [
            // {
            //   "Id": 1,
            //   "Screen": "add-user",
            //   "Module": "Create User",
            //   "IsActive": false
            // },
            {
              "Id": 2,
              "Screen": "add-client-detail",
              "Module": "Clients",
              "IsActive": false
            },
            {
              "Id": 3,
              "Screen": "client-office",
              "Module": "Client's Office",
              "IsActive": false
            },
            {
              "Id": 4,
              "Screen": "create-usersAndDrivers",
              "Module": "User and Drivers",
              "IsActive": false
            },
            {
              "Id": 5,
              "Screen": "add-manufacturers",
              "Module": "Manufacturer",
              "IsActive": false
            },
            // {
            //   "Id": 6,
            //   "Screen": "add-masterDealer",
            //   "Module": "Dealer",
            //   "IsActive": false
            // },
            {
              "Id": 7,
              "Screen": "add-state",
              "Module": "States",
              "IsActive": false
            },
            {
              "Id": 8,
              "Screen": "add-city",
              "Module": "Cities",
              "IsActive": false
            },
            {
              "Id": 9,
              "Screen": "add-invoice-type",
              "Module": "Invoice Type",
              "IsActive": false
            },
            {
              "Id": 10,
              "Screen": "add-model",
              "Module": "Model",
              "IsActive": false
            },
            {
              "Id": 11,
              "Screen": "add-variant",
              "Module": "Variant",
              "IsActive": false
            },
            {
              "Id": 12,
              "Screen": "group-of-companies",
              "Module": "Group Of Companies",
              "IsActive": false
            },
            {
              "Id": 13,
              "Screen": "create-contract-agreement",
              "Module": "Contract Agreement",
              "IsActive": false
            },
            // {
            //   "Id": 14,
            //   "Screen": "create-role",
            //   "Module": "Create Role",
            //   "IsActive": false
            // },
            // {
            //   "Id": 15,
            //   "Screen": "assign-role",
            //   "Module": "Assign Role",
            //   "IsActive": false
            // },
            // {
            //   "Id": 16,
            //   "Screen": "credit-appraisal",
            //   "Module": "Credit Appraisal Maker",
            //   "IsActive": false
            // },
            // {
            //   "Id": 17,
            //   "Screen": "credit-appraisal-checker",
            //   "Module": "Credit Appraisal Checker",
            //   "IsActive": false
            // },
            // {
            //   "Id": 18,
            //   "Screen": "master-Objects",
            //   "Module": "Object",
            //   "IsActive": false
            // },
            // {
            //   "Id": 19,
            //   "Screen": "master-Products",
            //   "Module": "Product",
            //   "IsActive": false
            // },
            {
              "Id": 20,
              "Screen": "master-budget",
              "Module": "Budget",
              "IsActive": false
            },
            // {
            //   "Id": 21,
            //   "Screen": "master-region",
            //   "Module": "Region",
            //   "IsActive": false
            // },
            // {
            //   "Id": 22,
            //   "Screen": "dealer-manufacturer-relation",
            //   "Module": "Dealer Manufacturer Relation",
            //   "IsActive": false
            // },
            // {
            //   "Id": 23,
            //   "Screen": "insured-declared-value",
            //   "Module": "Insured Declared Value",
            //   "IsActive": false
            // },
            {
              "Id": 24,
              "Screen": "master-accessories",
              "Module": "Accessories",
              "IsActive": false
            },
            // {
            //   "Id": 25,
            //   "Screen": "master-spareParts",
            //   "Module": "Spare Parts",
            //   "IsActive": false
            // },
            // {
            //   "Id": 26,
            //   "Screen": "master-shades",
            //   "Module": "Shade Master",
            //   "IsActive": false
            // }
          ]
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

  // get users
  getusersList() {
    const data =
    {
      Page:
      {
        // PageNumber: this.PageNumber + 1,
        PageNumber: 0,
        PageSize: 0,
        Filter: {
          // // CreatedById: this.currentUser.UserId
          IsSearch: true,
          SearchValue: this.searchText,

          DeActivated: false,
          LockedUser: this.selectedFilter.filterName == "Locked User" ? true : null,
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getUser(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.userList = res.Records;
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
        this.getAllWorkFlowList();
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
      this.getAllWorkFlowList();
    }, 500);
  }

  get validators() {
    return this.workFlowForm.controls;
  }

  createWorkflow() {
    this.submitted = true;
    console.log(this.workFlowForm);

    if (this.workFlowForm.status == "VALID") {

      this.userLevels.map((item: any) => {
        let UserRecord = {

          UserId: this.workFlowForm.get('approver' + item.Id)?.value,
          Screen: this.workFlowForm.value.moduleName,
          Level: item.Id,
          IsActive: true,
          CreatedDate: null,
          CreatedById: null, //this.currentUser.UserId
          ModifiedDate: null,
          ModifiedById: null,
          ModifiedByUser: null,
          CreatedByUser: null,
          User: null,
          CreatedBy: null,
          ModifiedBy: null
        }
        this.addedWorkFlowList.push(UserRecord);
      });

      console.log(this.addedWorkFlowList);

      let data = {
        Data: this.addedWorkFlowList,
        // Level: this.workFlowForm.value.level,
        // CreatedById: this.currentUser.UserId,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addWorkFlowList(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Workflow created successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllWorkFlowList();

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

  updateWorkflow() {
    this.submitted = true;
    if (this.workFlowForm.status == "VALID") {
      this.userLevels.map((item: any) => {
        let UserRecord = {

          UserId: this.workFlowForm.get('approver' + item.Id)?.value,
          Screen: this.workFlowForm.value.moduleName,
          Level: item.Id,
          IsActive: true,
          CreatedDate: null,
          CreatedById: null, //this.currentUser.UserId
          ModifiedDate: null,
          ModifiedById: null,
          ModifiedByUser: null,
          CreatedByUser: null,
          User: null,
          CreatedBy: null,
          ModifiedBy: null
        }
        this.addedWorkFlowList.push(UserRecord);
      });

      this.addedWorkFlowList.map(element => {
        this.WFList.map(item => {
          if (item.Level == element.Level) {
            element.Id = item.Id;
          }
        });
      });

      let data = {
        Data: this.addedWorkFlowList,
      }

      console.log(data);

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.updateWorkFlowList(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Workflow updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllWorkFlowList();

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
    this.editMode = false;
    this.workFlowForm.reset();
    this.addedWorkFlowList = [];
    this.userLevels = [];
    this.WFList = [];
    this.selectedRowIndex = null;
    this.userList.map((user: any) => { user.disabled = false; });
    this.levelList.map((item: any) => { item.disabled = false; });
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.resetForm();
    this.editMode = true;
    // this.workFlowForm.reset();
    // this.submitted = false;
    // this.WFList = [];
    // this.addedWorkFlowList = [];

    this.levelList.map((item: any) => {
      if (item.Id < data.LevelCount) {
        item.disabled = true;
      }
    })
    this.workFlowForm.get('moduleName')?.setValue(data.Screen);
    this.workFlowForm.get('level')?.setValue(data.LevelCount);

    // this.levelSelection({ Id: data.LevelCount });//
    this.levelSelection(data.LevelCount);

    if (data.WFList) {
      this.WFList = data.WFList;
      this.WFList.map(item => {
        this.workFlowForm.get("approver" + item.Level)?.setValue(item.UserId);
      });
    }

    this.WFList.map(item => {
      const user = this.userList.find((user: any) => user.UserGuidId === item.UserId);
      user.disabled = true;

    });




  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.workflowList = this.commonService.customSort(this.workflowList, sortState.active, sortState.direction);
      this.workflowTable.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllWorkFlowList();
  }

  levelSelection(event: any) {
    this.submitted = false;
    this.userLevels = [];
    this.addedWorkFlowList = [];
    if (event) {
      this.levelList.map((item: any, index: number) => {
        this.workFlowForm.get("approver" + item.Id)?.setValidators(null);
        // if (index < event.Id) {
        //   this.userLevels.push(item);
        //   this.workFlowForm.get("approver" + item.Id)?.setValidators([Validators.required]);
        // }
        if (index < event) {
          this.userLevels.push(item);
          this.workFlowForm.get("approver" + item.Id)?.setValidators([Validators.required]);
        }
        else {
          this.workFlowForm.get("approver" + item.Id)?.setValue(null);
        }
        this.workFlowForm.get("approver" + item.Id)?.updateValueAndValidity();
      });
    }

  }

  checkUserExist(event: any) {

    let UserGuidId: any[] = [];

    this.userLevels.map((item: any) => {
      if (this.workFlowForm.get('approver' + item.Id)?.value) {
        UserGuidId.push(this.workFlowForm.get('approver' + item.Id)?.value);
      }
    })

    this.userList.map((user: any) => {
      if (UserGuidId.includes(user.UserGuidId)) {
        user.disabled = true;
      } else {
        user.disabled = false;
      }
    });

    // this.userList.map((user: any) => {
    //   this.userLevels.map((item: any) => {
    //     if (user.UserGuidId == this.workFlowForm.get('approver' + item.Id)?.value) {
    //       user.disabled = true;
    //     } else {
    //       user.disabled = false;
    //     }
    //   })
    // });
  }

}