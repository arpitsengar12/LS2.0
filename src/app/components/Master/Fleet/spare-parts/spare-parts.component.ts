import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../../client.service';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Location } from '@angular/common';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';
import { MatDialog } from '@angular/material/dialog';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-spare-parts',
  templateUrl: './spare-parts.component.html',
  styleUrls: ['./spare-parts.component.scss']
})

export class SparePartsComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('sparePartTableList') sparePartTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  displayedColumns = ['Part Name', 'Part Categories', 'Services', 'Periodical', 'Running Repair', 'Additional Info', 'Action'];
  sparePartsList: any[] = [];

  sparePartsForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  isView: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  selectedPartData: any;
  partId: number = 0;
  partCategoryList: any;
  serviceType: number = 1;
  servicesList = [{ Id: 1, name: 'Service' }, { Id: 2, name: 'Part' }, { Id: 3, name: 'Labour' }];

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Part Name' },
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
      this.partId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        // this.getAllsparePartsList();
      }
      else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        // this.getAllsparePartsList();
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

    this.sparePartsForm = this.fb.group({
      partName: ['', [Validators.required]],
      partCategory: [null],
      serviceType: [0],
      Isperiodical: [false],
      IsrunningRepair: [false],
      IsAddInfo: [false],
    });

    this.sparePartsForm.markAllAsTouched();

    this.getAllsparePartsList();
    this.getPartDropDowns();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Fleet';
      this.breadcrumbService.setBreadcrumbs(['Master / Fleet', breadcrumb]);
    });
  }

  getAllsparePartsList() {

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
          // PartDescription: this.selectedFilter.filterName == "Part Name" ? this.searchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllSpareParts(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.sparePartsList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.sparePartsList.map((item, index) => {
            item.position = index;
          });
          if (this.sparePartsList && this.sparePartsList.length > 0) {
            this.sparePartsList.map((item) => {
              if (item.BudgetID == this.partId) {
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

  getPartDropDowns() {
    this.spinner.show();
    this.clientService.getPartDropDowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.partCategoryList = res.CategoriesList;
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

  onToggleChange(event: any, element: any, key: any): void {
    if (key == 'Periodical') {
      event.source.checked = element.Periodical;
    } else if (key == 'RunningR') {
      event.source.checked = element.RunningR;
    } else if (key == 'AdditionalInfo') {
      event.source.checked = element.AdditionalInfo;
    }
  }


  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllsparePartsList();
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
      this.getAllsparePartsList();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.sparePartsList = this.commonService.customSort(this.sparePartsList, sortState.active, sortState.direction);
      this.sparePartTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllsparePartsList();
  }


  get validators() {
    return this.sparePartsForm.controls;
  }

  addSparePart() {
    this.submitted = true;
    if (this.sparePartsForm.status == "VALID") {
      let data = {
        CreatedById: this.currentUser.UserId,
        Dormant: false,

        PartDescription: this.sparePartsForm.value.partName,
        PartsCategoriesID: this.sparePartsForm.value.partCategory,
        ServiceType: this.sparePartsForm.value.serviceType,
        Periodical: this.sparePartsForm.value.Isperiodical == true ? 1 : 0,
        RunningR: this.sparePartsForm.value.IsrunningRepair == true ? 1 : 0,
        AdditionalInfo: this.sparePartsForm.value.IsAddInfo == true ? 1 : 0,
        // OldPartCode: "005",
        // HSNCode: null,
        // SCNCode: null,
        // ExpenseGLCode: 36100,
        // IsPlan: null,
        // ExpenseGLCodeFL: 36651,
        // ModifiedById: "0b85a0e5-d116-4470-8a24-00a9df25ac52",
        // CreatedDate: null,
        // ModifiedDate: null,
        // CreatedByUser: "varun.shukla",
        // ModifiedByUser: "varun.shukla",
        // PartsCategory: "Not Specified",
        // CreatedBy: null,
        // ModifiedBy: null,
        // Categories: null,

      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addSpareParts(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Spare part added successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllsparePartsList();

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

  updateSparePart() {
    this.submitted = true;
    if (this.sparePartsForm.status == "VALID") {
      // let data = {
      //   PartID: this.partId,
      //   ModifiedById: this.currentUser.UserId,
      //   Dormant: false,

      //   PartDescription: this.sparePartsForm.value.partName,
      //   PartsCategoriesID: this.sparePartsForm.value.partCategory,
      //   ServiceType: this.sparePartsForm.value.serviceType,
      //   Periodical: this.sparePartsForm.value.Isperiodical == true ? 1 : 0,
      //   RunningR: this.sparePartsForm.value.IsrunningRepair == true ? 1 : 0,
      //   AdditionalInfo: this.sparePartsForm.value.IsAddInfo == true ? 1 : 0,
      //   // OldPartCode: "005",
      //   // HSNCode: null,
      //   // SCNCode: null,
      //   // ExpenseGLCode: 36100,
      //   // IsPlan: null,
      //   // ExpenseGLCodeFL: 36651,
      //   // CreatedDate: null,
      //   // ModifiedDate: null,
      //   // CreatedByUser: "varun.shukla",
      //   // ModifiedByUser: "varun.shukla",
      //   // PartsCategory: "Not Specified",
      //   // CreatedBy: null,
      //   // ModifiedBy: null,
      //   // Categories: null,
      // }

      this.selectedPartData.ModifiedById = this.currentUser.UserId;
      this.selectedPartData.PartDescription = this.sparePartsForm.value.partName;
      this.selectedPartData.PartsCategoriesID = this.sparePartsForm.value.partCategory;
      this.selectedPartData.ServiceType = this.sparePartsForm.value.serviceType;
      this.selectedPartData.Periodical = this.sparePartsForm.value.Isperiodical == true ? 1 : 0;
      this.selectedPartData.RunningR = this.sparePartsForm.value.IsrunningRepair == true ? 1 : 0;
      this.selectedPartData.AdditionalInfo = this.sparePartsForm.value.IsAddInfo == true ? 1 : 0;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedPartData));

      this.spinner.show();
      this.clientService.updateSpareParts(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Spare part updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllsparePartsList();

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
    this.getAllsparePartsList();
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
    this.getAllsparePartsList();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.selectedRowIndex = null;
    this.sparePartsForm.reset(defaultValues);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.sparePartsForm.reset(defaultValues);
    this.submitted = false;
    this.isView = false;
    this.IsApproverView = false;
    this.partId = data.PartID;
    this.selectedPartData = data;

    this.sparePartsForm.get('partName')?.setValue(data.PartDescription);
    this.sparePartsForm.get('partCategory')?.setValue(data.PartsCategoriesID);
    this.sparePartsForm.get('serviceType')?.setValue(data.ServiceType);
    data.Periodical == 1 ? this.sparePartsForm.get('Isperiodical')?.setValue(true) : this.sparePartsForm.get('Isperiodical')?.setValue(false);
    data.RunningR == 1 ? this.sparePartsForm.get('IsrunningRepair')?.setValue(true) : this.sparePartsForm.get('IsrunningRepair')?.setValue(false);
    data.AdditionalInfo == 1 ? this.sparePartsForm.get('IsAddInfo')?.setValue(true) : this.sparePartsForm.get('IsAddInfo')?.setValue(false);
  }

  setDataView(data: any) {
    this.scrollToTop();
    this.sparePartsForm.reset(defaultValues);
    this.submitted = false;
    this.partId = data.PartID;
    this.selectedPartData = data;
    this.isView = true;
    this.editMode = false;
    this.IsApproverView = false;

    this.sparePartsForm.get('partName')?.setValue(data.PartDescription);
    this.sparePartsForm.get('partCategory')?.setValue(data.PartsCategoriesID);
    this.sparePartsForm.get('serviceType')?.setValue(data.ServiceType);
    data.Periodical == 1 ? this.sparePartsForm.get('Isperiodical')?.setValue(true) : this.sparePartsForm.get('Isperiodical')?.setValue(false);
    data.RunningR == 1 ? this.sparePartsForm.get('IsrunningRepair')?.setValue(true) : this.sparePartsForm.get('IsrunningRepair')?.setValue(false);
    data.AdditionalInfo == 1 ? this.sparePartsForm.get('IsAddInfo')?.setValue(true) : this.sparePartsForm.get('IsAddInfo')?.setValue(false);
    this.sparePartsForm.disable();
  }

  setDataApprover(data: any) {
    this.scrollToTop();
    this.sparePartsForm.reset(defaultValues);
    this.submitted = false;
    this.partId = data.PartID;
    this.selectedPartData = data;
    this.editMode = false;
    this.isView = false;
    this.IsApproverView = true;

    this.sparePartsForm.get('partName')?.setValue(data.PartDescription);
    this.sparePartsForm.get('partCategory')?.setValue(data.PartsCategoriesID);
    this.sparePartsForm.get('serviceType')?.setValue(data.ServiceType);
    data.Periodical == 1 ? this.sparePartsForm.get('Isperiodical')?.setValue(true) : this.sparePartsForm.get('Isperiodical')?.setValue(false);
    data.RunningR == 1 ? this.sparePartsForm.get('IsrunningRepair')?.setValue(true) : this.sparePartsForm.get('IsrunningRepair')?.setValue(false);
    data.AdditionalInfo == 1 ? this.sparePartsForm.get('IsAddInfo')?.setValue(true) : this.sparePartsForm.get('IsAddInfo')?.setValue(false);
    this.sparePartsForm.disable();

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.partId, Name: this.selectedPartData.PartDescription, moduleName: 'master-spareParts' }
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