import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../../client.service';
import { Constant } from 'src/app/shared/model/constant';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-insured-value',
  templateUrl: './insured-value.component.html',
  styleUrls: ['./insured-value.component.scss']
})

export class InsuredValueComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  @ViewChild('insuredVTableList') insuredVTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns = ['Age From', 'Age To', 'Percentage', 'Bonus', 'Action'];
  InsuredValueList: any[] = [];

  insuredValueForm!: FormGroup;
  submitted: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  editMode: boolean = false;
  selectedInsValueData: any;
  InsuredId: number = 0;

  timer: any;
  selectedRowIndex: any;
  IsSearch: boolean = false;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Age From' },
    { filterName: 'Age To' },
    { filterName: 'Percentage' },
    { filterName: 'Bonus' },
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
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {

    if (history.state.level) {
      this.IsAuditTrail = history.state.IsAuditTrail;
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

    this.insuredValueForm = new FormGroup({
      ageFrom: new FormControl('', [Validators.required, Validators.pattern(Constant.IntNo)]),
      ageTo: new FormControl('', [Validators.required, Validators.pattern(Constant.IntNo)]),
      percentage: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
      bonusValue: new FormControl('', [Validators.required, Validators.pattern(Constant.decimalNo)]),
    });
    this.insuredValueForm.markAllAsTouched();

    this.insuredValueForm.markAllAsTouched();

    this.getAllInsuredValue();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Insurance';
      this.breadcrumbService.setBreadcrumbs(['Master / Insurance', breadcrumb]);
    });
  }

  getAllInsuredValue() {

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
          // AgeFrom: this.selectedFilter.filterName == "Age From" ? parseFloat(this.searchText) : "",
          // AgeTo: this.selectedFilter.filterName == "Age To" ? parseFloat(this.searchText) : "",
          // Percentage: this.selectedFilter.filterName == "Percentage" ? parseFloat(this.searchText) : "",
          // Bonus: this.selectedFilter.filterName == "Bonus" ? parseFloat(this.searchText) : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));
    this.spinner.show();
    this.clientService.getAllInsuredValue(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.InsuredValueList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.InsuredValueList.map((item, index) => {
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

  get validators() {
    return this.insuredValueForm.controls;
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllInsuredValue();
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
      this.getAllInsuredValue();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.InsuredValueList = this.commonService.customSort(this.InsuredValueList, sortState.active, sortState.direction);
      this.insuredVTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllInsuredValue();
  }


  addInsuredValue() {
    this.submitted = true;
    if (this.insuredValueForm.status == "VALID") {
      let data = {
        CreatedById: this.currentUser.UserId,
        Dormant: false,
        AgeFrom: this.insuredValueForm.value.ageFrom,
        AgeTo: this.insuredValueForm.value.ageTo,
        Percentage: this.insuredValueForm.value.percentage,
        Bonus: this.insuredValueForm.value.bonusValue,

        // "ModifiedById": null,
        // "CreatedDate": "2012-11-16T18:22:44.173",
        // "ModifiedDate": null,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addInsuredValue(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Insured Value added successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllInsuredValue();

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

  updateInsuredValue() {
    this.submitted = true;
    if (this.insuredValueForm.status == "VALID") {
      // let data = {
      //   Id: this.InsuredId,
      //   ModifiedById: this.currentUser.UserId,
      //   Dormant: false,
      //   AgeFrom: this.insuredValueForm.value.ageFrom,
      //   AgeTo: this.insuredValueForm.value.ageTo,
      //   Percentage: this.insuredValueForm.value.percentage,
      //   Bonus: this.insuredValueForm.value.bonusValue,

      //   // "ModifiedById": null,
      //   // "CreatedDate": "2012-11-16T18:22:44.173",
      //   // "ModifiedDate": null,
      // }

      this.selectedInsValueData.ModifiedById = this.currentUser.UserId;
      this.selectedInsValueData.AgeFrom = this.insuredValueForm.value.ageFrom;
      this.selectedInsValueData.AgeTo = this.insuredValueForm.value.ageTo;
      this.selectedInsValueData.Percentage = this.insuredValueForm.value.percentage;
      this.selectedInsValueData.Bonus = this.insuredValueForm.value.bonusValue;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedInsValueData));

      this.spinner.show();
      this.clientService.updateInsuredValue(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Insured Value updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.getAllInsuredValue();

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
    this.getAllInsuredValue();
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
    this.getAllInsuredValue();
  }

  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.selectedRowIndex = null;
    this.insuredValueForm.reset(defaultValues);
  }

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.insuredValueForm.reset(defaultValues);
    this.submitted = false;
    this.InsuredId = data.Id;
    this.selectedInsValueData = data;

    this.insuredValueForm.get('ageFrom')?.setValue(data.AgeFrom);
    this.insuredValueForm.get('ageTo')?.setValue(data.AgeTo);
    this.insuredValueForm.get('percentage')?.setValue(data.Percentage);
    this.insuredValueForm.get('bonusValue')?.setValue(data.Bonus);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {
    // let slot = "Age slot - " + this.selectedInsValueData.AgeFrom + " to " + this.selectedInsValueData.AgeTo;
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.InsuredId, Name: '', moduleName: 'insured-declared-value' }
    });
  }

}


let defaultValues = {
  ageFrom: '',
  ageTo: '',
  percentage: '',
  bonusValue: '',
}