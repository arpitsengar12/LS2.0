import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../../client.service';
import { DataService } from '../../../core/http/data.service';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Location } from '@angular/common';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-master-accessories',
  templateUrl: './master-accessories.component.html',
  styleUrls: ['./master-accessories.component.scss']
})

export class MasterAccessoriesComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('accessoryTableList') accessoryTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  displayedColumns = ['Accessories Name', 'Is Insurance', 'WFStatus', 'Action'];
  accessoriesList: any[] = [];

  accessoriesForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  selectedAccData: any;
  accId: number = 0;
  accessoryTypeList: any;
  variantNameList: any;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Accessories Name' },
    // { filterName: 'Is Insurance' },
  ];
  filterBtnClicked: boolean = false;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    private clientService: ClientService,
    protected commonService: CommonService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public dialog: MatDialog,
    public location: Location,
  ) {

    if (history.state.level) {
      this.IsAuditTrail = history.state.IsAuditTrail;
      this.TransactionId = history.state.TransactionId;
      this.accId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getAccessoryById();
      }
      else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getAccessoryById();
      }

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

    this.accessoriesForm = this.fb.group({
      accCode: [''],
      accessoryName: ['', [Validators.required]],
      accessoryType: [null],
      variantName: [null],
      IsInsurance: [false]
    });

    this.accessoriesForm.markAllAsTouched();

    this.getAllAccessoriesDropDowns();
    this.getAllaccessoriesList();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Fleet';
      this.breadcrumbService.setBreadcrumbs(['Master / Fleet', breadcrumb]);
    });
  }

  getAllaccessoriesList() {

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
          // AccessoryName: this.selectedFilter.filterName == "Accessories Name" ? this.searchText : "",
          // IsInsurance: this.selectedFilter.filterName == "Is Insurance" ? (this.searchText == 'Yes' || this.searchText == 'yes' ? true : false) : null,
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllAccessories(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.accessoriesList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.accessoriesList.map((item, index) => {
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

  getAllAccessoriesDropDowns() {
    this.spinner.show();
    this.clientService.getAccessoriesDropdowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.variantNameList = res.VariantList;
          this.accessoryTypeList = res.AccessoryTypeList;

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
        this.getAllaccessoriesList();
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
      this.getAllaccessoriesList();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.accessoriesList = this.commonService.customSort(this.accessoriesList, sortState.active, sortState.direction);
      this.accessoryTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllaccessoriesList();
  }


  get validators() {
    return this.accessoriesForm.controls;
  }

  addAccessory() {
    this.submitted = true;
    if (this.accessoriesForm.status == "VALID") {
      let data = {
        CreatedById: this.currentUser.UserId,
        AccessoriesName: this.accessoriesForm.value.accessoryName,
        AccessoriesTypeId: this.accessoriesForm.value.accessoryType,
        VariantId: this.accessoriesForm.value.variantName,
        IsInsurance: this.accessoriesForm.value.IsInsurance == true ? 1 : 0,
        Dormant: false,

        // AntiTheftArai: false,
        // ModelId: 1,
        // OldAccCode: "sfs",
        // OldTypeCode: "efw",
        // IsInvestment: 0,
      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addAccessories(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            // this.toaster.success('Accessories added successfully', undefined, {
            //   positionClass: 'toast-top-center'
            // });
            this.toaster.success(res.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllaccessoriesList();

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

  getAccessoryById() {
    // this.accId = element.Id;
    this.spinner.show();
    this.clientService.getAccessoryById(this.accId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedAccData = res;
          this.accId = res.Id;
          // this.editMode = true;
          // this.accessoriesForm.reset(defaultValues);
          // this.submitted = false;

          if (this.isView || this.IsApproverView) {
            this.accessoriesForm.disable();
          }

          this.accessoriesForm.patchValue({
            accCode: this.selectedAccData.Id,
            accessoryName: this.selectedAccData.AccessoriesName,
            accessoryType: this.selectedAccData.AccessoriesTypeId,
            variantName: this.selectedAccData.VariantId,
            IsInsurance: this.selectedAccData.IsInsurance == 1 ? true : false,
          });
          this.accessoriesForm.markAllAsTouched();
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

  updateAccessory() {
    this.submitted = true;
    if (this.accessoriesForm.status == "VALID") {
      // let data = {
      //   Id: this.accId,
      //   ModifiedById: this.currentUser.UserId,
      //   AccessoriesName: this.accessoriesForm.value.accessoryName,
      //   AccessoriesTypeId: this.accessoriesForm.value.accessoryType,
      //   VariantId: this.accessoriesForm.value.variantName,
      //   IsInsurance: this.accessoriesForm.value.IsInsurance == true ? 1 : 0,
      //   Dormant: false,

      //   // AntiTheftArai: false,
      //   // ModelId: 1,
      //   // OldAccCode: "sfs",
      //   // OldTypeCode: "efw",
      //   // IsInvestment: 0,
      // }

      this.selectedAccData.ModifiedById = this.currentUser.UserId;
      this.selectedAccData.AccessoriesName = this.accessoriesForm.value.accessoryName;
      this.selectedAccData.AccessoriesTypeId = this.accessoriesForm.value.accessoryType;
      this.selectedAccData.VariantId = this.accessoriesForm.value.variantName;
      this.selectedAccData.IsInsurance = this.accessoriesForm.value.IsInsurance == true ? 1 : 0;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedAccData));

      this.spinner.show();
      this.clientService.updateAccessories(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            // this.toaster.success('Accessories updated successfully', undefined, {
            //   positionClass: 'toast-top-center'
            // });
            this.toaster.success(res.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllaccessoriesList();

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

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllaccessoriesList();
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
    this.getAllaccessoriesList();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.selectedRowIndex = null;
    this.accessoriesForm.reset(defaultValues);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.IsApproverView = false;
    this.isView = false;
    this.accessoriesForm.reset(defaultValues);
    this.submitted = false;
    this.accId = data.Id;
    this.selectedAccData = data;

    // this.accessoriesForm.get('accCode')?.setValue(data.Id);
    // this.accessoriesForm.get('accessoryName')?.setValue(data.AccessoriesName);
    // this.accessoriesForm.get('accessoryType')?.setValue(data.AccessoriesTypeId);
    // this.accessoriesForm.get('variantName')?.setValue(data.VariantId);
    // data.IsInsurance == 1 ? this.accessoriesForm.get('IsInsurance')?.setValue(true) : this.accessoriesForm.get('IsInsurance')?.setValue(false);

    this.getAccessoryById()
  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.accId, Name: this.selectedAccData.AccessoriesName, moduleName: 'master-accessories' }
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
  accCode: '',
  accessoryName: '',
  accessoryType: null,
  variantName: null,
  IsInsurance: false
}