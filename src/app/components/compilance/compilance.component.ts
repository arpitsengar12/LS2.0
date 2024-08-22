import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AddCompilanceComponent } from './add-compilance/add-compilance.component';
import { DeleteConfirmationDialogComponent } from 'src/app/shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ClientService } from '../client.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/shared/Services/common.service';
import { DatePipe, Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Constant } from 'src/app/shared/model/constant';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Sort } from '@angular/material/sort';

export interface PeriodicElement {
  TableName: string;
  ColumnName: string;
  CompilanceType: any;
  ColumnType: string;
  FieldLabel: string;
  CreatedBy: string;
  Action: any;
  CompilanceArray: any;

}

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-compilance',
  templateUrl: './compilance.component.html',
  styleUrls: ['./compilance.component.scss']
})
export class CompilanceComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  displayedColumns: string[] = ['TableName', 'ColumnName', 'ColumnType', 'FieldLabel', 'CreatedBy', 'Action'];
  @ViewChild('complianceTableList') complianceTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  ConfigurationList: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  AllComplianceList: any;
  ComplianceTypeList = [
    { name: 'HIPPA', complianceId: 1, selected: false },
    { name: 'GDPR', complianceId: 2, selected: false },
    { name: 'PCI', complianceId: 3, selected: false },
    { name: 'CCPA', complianceId: 4, selected: false },
    { name: 'COPPA', complianceId: 5, selected: false },
    { name: 'Audit', complianceId: 6, selected: false }
  ];

  ComplianceTypeArray: any[] = [];
  complianceType: any[] = [];
  pending = true;
  outOfStock = true;
  delivered = true;
  complianceId: number = 0;
  addComplianceForm!: FormGroup;
  submitted: boolean = false;
  editMode: boolean = false;
  selectedTable: any;
  tableNameList: any;
  columnNameList: any;
  columnTypeList: any;
  complianceTypeIdArray: number[] = [];
  selectedComplianceData: any;

  fieldLabelList: any;
  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Table Name' },
    { filterName: 'Column Name' },
    // { filterName: 'Compliance Type' },
    // { filterName: 'Column Type' },
    { filterName: 'Field Label' },
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
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    protected commonService: CommonService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
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

    this.addComplianceForm = new FormGroup({
      tableName: new FormControl(null, [Validators.required]),
      columnName: new FormControl(null, [Validators.required]),
      columnType: new FormControl(null, [Validators.required]),
      fieldLabel: new FormControl(null, [Validators.required]),
      PII: new FormControl(true, [Validators.required])
    });
    // this.addComplianceForm.get('PII')?.disable();
    this.addComplianceForm.markAllAsTouched();
    this.getTableNames();
    this.getAllDataConfiguration();
    this.getComplianceList();
    this.fieldLabelList = ['Name', 'Email', 'Phone', "PAN"];
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Admin';
      this.breadcrumbService.setBreadcrumbs(['Admin', breadcrumb]);
    });
  }

  get validators() {
    return this.addComplianceForm.controls;
  }

  getComplianceList() {
    this.spinner.show();
    this.clientService.getComplianceList().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.AllComplianceList = res.Rows;
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

  getAllDataConfiguration() {
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
          // TableName: this.selectedFilter.filterName == "Table Name" ? this.searchText : "",
          // ColumnName: this.selectedFilter.filterName == "Column Name" ? this.searchText : "",
          // ComplianceType: this.selectedFilter.filterName == "Compliance Type" ? this.searchText : "",
          // ColumnType: this.selectedFilter.filterName == "Column Type" ? this.searchText : "",
          // FieldLabel: this.selectedFilter.filterName == "Field Label" ? this.searchText : "",
          // // CreatedDate: this.selectedFilter.filterName == "Created Date" ? this.searchText : "",
          // CreatedDate: this.selectedFilter.filterName == "Created Date" ? Constant.dateFormatDDMMYYYY.test(this.searchText) ? this.formatDateInISO(this.searchText) : "" : "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllDataConfiguration(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.ConfigurationList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.ConfigurationList.map((item, index) => {
            item.position = index;
          });

          // this.ConfigurationList.map((item => {
          //   item.CompilanceType = [];
          //   // this.ComplianceTypeArray.push(item.CompilanceArray);
          //   this.ComplianceTypeArray = item.CompilanceArray;
          // }))

          // for (let i = 0; i < this.ComplianceTypeList.length; i++) {
          //   for (let j = 0; j < this.ComplianceTypeArray.length; j++) {
          //     if (this.ComplianceTypeList[i].complianceId == this.ComplianceTypeArray[j]) {
          //       this.complianceType.push(this.ComplianceTypeArray[j]);
          //     }
          //   }
          // }

          // for (let i = 0; i < this.ComplianceTypeList.length; i++) {
          //   for (let j = 0; j < this.ComplianceTypeArray.length; j++) {
          //     if (this.ComplianceTypeList[i].complianceId == this.ComplianceTypeArray[j]) {
          //       this.ConfigurationList.map((item => {
          //         item.CompilanceType.push(this.ComplianceTypeList[i].name);
          //       }))
          //     }
          //   }
          // }
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

  getTableNames() {
    const data =
      { Page: { PageNumber: 0, PageSize: 0 } }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getTableNames(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.tableNameList = res.Records;
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

  getColumnNames() {
    const data =
    {
      Page: {
        PageNumber: 0, PageSize: 0,
        Filter: {
          Search: this.selectedTable,
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getColumnNames(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.columnNameList = res.Records;
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

  getColumnType(event: any) {
    if (event) {
      this.columnTypeList = [];
      this.columnTypeList.push(event);
      this.addComplianceForm.get('columnType')?.setValue(this.columnTypeList[0].ColumnType);
    }
  }

  addCompliance() {
    this.submitted = true;
    if (this.addComplianceForm.status == "VALID") {
      this.complianceTypeIdArray = [1];
      let data = {
        CompilanceTypeArray: this.complianceTypeIdArray,
        TableName: this.addComplianceForm.value.tableName,
        ColumnName: this.addComplianceForm.value.columnName,
        Description: "",
        LabelName: this.addComplianceForm.value.fieldLabel,
        CreatedById: this.currentUser.UserId
      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.AddComplianceconfig(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Compliance added successfully!", undefined, {
              positionClass: 'toast-top-center'
            });
            this.addComplianceForm.reset();
            this.submitted = false;
            this.addComplianceForm.get('PII')?.setValue(true);
            this.getAllDataConfiguration();
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

  updateCompliance() {
    this.submitted = true;
    if (this.complianceTypeIdArray.length !== 0) {
      let data = {
        CompilanceTypeArray: this.complianceTypeIdArray,
        GetTableName: this.selectedComplianceData.TableName,
        GetColumnName: this.selectedComplianceData.ColumnName,
        Description: "",
        LabelName: this.addComplianceForm.value.fieldLabel,
        CreatedById: this.currentUser.UserId,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.UpdateComplianceconfig(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Compliance updated successfully!", undefined, {
              positionClass: 'toast-top-center'
            });
            this.addComplianceForm.reset();
            this.submitted = false;
            this.addComplianceForm.get('PII')?.setValue(true);
            this.spinner.hide();
          }
          else {
            this.toaster.error(res?.Errors[0]?.Message, undefined, {
              positionClass: 'toast-top-center'
            });
          }
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
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllDataConfiguration();
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
      this.getAllDataConfiguration();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.ConfigurationList = this.commonService.customSort(this.ConfigurationList, sortState.active, sortState.direction);
      this.complianceTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllDataConfiguration();
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllDataConfiguration();
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
    this.getAllDataConfiguration();
  }

  TableNameSelected(event: any) {
    this.addComplianceForm.get('columnName')?.setValue(null);
    this.addComplianceForm.get('fieldLabel')?.setValue(null);
    this.selectedTable = event.TableName;
    this.getColumnNames();
  }

  openDialogAddCompliance() {
    let dialogRef = this.dialog.open(AddCompilanceComponent, {
      width: '700px',
      height: '500px',
      disableClose: true,
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllDataConfiguration();
      }
    });
  }

  openDialogUpdateCompliance(data: any) {
    let dialogRef = this.dialog.open(AddCompilanceComponent, {
      width: '700px',
      height: '500px',
      disableClose: true,
      data: { mode: 'edit', element: data, ComplianceList: this.AllComplianceList }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllDataConfiguration();
      }
    });
  }

  openDialogDeleteCompliance(element: any): void {
    let dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '700px',
      height: '200px',
      disableClose: true,
      data: { moduleName: 'Compliance', mode: 'delete', Id: element.id, complianceArray: this.complianceType, AccessLevel: this.AccessLevel }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteCompliance(element);
      }
    });
  }

  deleteCompliance(item: any) {
    let data = {
      TableName: item.TableName,
      ColumnName: item.ColumnName,
      CreatedById: this.currentUser.UserId,
    }
    this.spinner.show();
    this.clientService.deleteComplianceRec(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.toaster.success("Compliance deleted successfully!", undefined, {
            positionClass: 'toast-top-center'
          });
          this.getAllDataConfiguration();
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

  resetForm() {
    this.submitted = false;
    this.selectedRowIndex = null;
    this.addComplianceForm.reset();
    this.addComplianceForm.get('PII')?.setValue(true);
  }

  onToggleChange(event: any): void {
    // If the user tries to turn off the toggle, reset its value to true (enabled)
    if (!event.checked) {
      this.addComplianceForm.get('PII')?.setValue(true);
    }
  }


  formatDateInISO(isoDate: string): string {
    const formattedDate = this.datePipe.transform(isoDate, 'yyyy-dd-MM HH:mm:ss.SSS');
    return formattedDate ? formattedDate : '';
  }

  // //set data
  // setData(data: any) {
  // this.scrollToTop();
  //   this.editMode = true;
  //   this.addComplianceForm.reset();
  //   this.submitted = false;
  //   this.complianceId = data.Id;
  //   this.selectedComplianceData = data;

  //   if (this.editMode) {
  //     this.addComplianceForm.get('userName')?.setValidators([Validators.required, Validators.pattern(Constant.textInputWSpCharWS)]);
  //     this.addComplianceForm.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExpwSpChar)]);
  //     this.addComplianceForm.get('email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXPSpChar)]);

  //   } else {
  //     this.addComplianceForm.get('userName')?.setValidators([Validators.required, Validators.pattern(Constant.userNameInput)]);
  //     this.addComplianceForm.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(Constant.phoneRegExp)]);
  //     this.addComplianceForm.get('email')?.setValidators([Validators.required, Validators.pattern(Constant.EMAIL_REGEXP)]);
  //   }
  //   // To apply the new validators, you need to update the form control's value
  //   this.addComplianceForm.updateValueAndValidity();

  //   this.addComplianceForm.get('userName')?.setValue(data.UserName);
  //   this.addComplianceForm.get('userId')?.setValue(data.LastName);
  //   this.addComplianceForm.get('mobileNo')?.setValue(data.PhoneNumber);
  //   this.addComplianceForm.get('email')?.setValue(data.Email);
  //   this.addComplianceForm.get('securityAnswer')?.setValue(data.SecurityAnswer);
  //   this.addComplianceForm.get('securityQuestion')?.setValue(data.SecurityQuestion);

  //   console.log(this.addComplianceForm.value)

  // }

  // // Scroll to the top-left corner of the page
  // scrollToTop() {
  //   window.scrollTo(0, 0);
  // }

  //pagination

  //custom sorting

}
