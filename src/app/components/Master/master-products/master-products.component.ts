import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { Location } from '@angular/common';
import { Sort } from '@angular/material/sort';


export interface PeriodicElement {
  ClientName: string,
  PreFix: string,
  FirstName: string,
  LastName: string,
  City: string,
  MobileNo: string,
}

interface RouteData {
  breadcrumb?: string;
}


@Component({
  selector: 'app-master-products',
  templateUrl: './master-products.component.html',
  styleUrls: ['./master-products.component.scss']
})

export class MasterProductsComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }
  @ViewChild('productTableList') productTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  displayedColumns: string[] = ['Product Name', 'Created By', 'Created Date', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  ProductsList: any[] = [];
  addProductForm!: FormGroup;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  totalRecords: any;
  submitted: boolean = false;
  editMode: boolean = false;
  PageNumber: number = 1;
  PageSize: number = 10;
  ProductId: number = 0;
  ProductName: any;
  selectedProductData: any;

  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Product Name' },
  ];
  filterBtnClicked: boolean = false;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  selectedRowIndex: any;
  IsSearch: boolean = false;

  constructor(
    public dialog: MatDialog,
    private clientService: ClientService,
    private toaster: ToastrService,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
    private router: Router,
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

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);

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

    this.addProductForm = new FormGroup({
      ProductName: new FormControl('', [Validators.required])
    });
    this.addProductForm.markAllAsTouched();

    this.getAllProducts();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master';
      this.breadcrumbService.setBreadcrumbs(['Master', breadcrumb]);
    });
  }

  getAllProducts() {
    const data =
    {
      Page:
      {
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.IsSearch,
          SearchValue: this.searchText,
          // ProductName: this.selectedFilter.filterName == "Product Name" ? this.searchText : "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllProducts(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.ProductsList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.ProductsList.map((item, index) => {
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
    return this.addProductForm.controls;
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllProducts();
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
      this.getAllProducts();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.ProductsList = this.commonService.customSort(this.ProductsList, sortState.active, sortState.direction);
      this.productTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getAllProducts();
  }


  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getAllProducts();
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
    this.getAllProducts();
  }

  cancelClick() {
    this.editMode = false;
    this.addProductForm.reset();
    this.submitted = false;
    this.addProductForm.markAllAsTouched();
    this.selectedRowIndex = null;
  }

  addClick() {
    this.submitted = true;
    console.log(this.addProductForm);
    if (this.addProductForm.status == 'VALID') {
      const data =
      {
        ProductName: this.addProductForm.value.ProductName,
        Dormant: false,
        CreatedById: this.currentUser.UserId
      }
      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addProduct(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Product added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.getAllProducts();

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

  updateProduct() {
    this.submitted = true;
    console.log(this.addProductForm);
    if (this.addProductForm.status == 'VALID') {
      // const data =
      // {
      //   ModifiedById: this.currentUser.UserId,
      //   Id: this.ProductId,
      //   ProductName: this.addProductForm.value.ProductName,
      //   Dormant: false,
      // }

      this.selectedProductData.ModifiedById = this.currentUser.UserId;
      this.selectedProductData.ProductName = this.addProductForm.value.ProductName;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedProductData));

      this.spinner.show();
      this.clientService.updateProduct(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Product updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.cancelClick();
            this.spinner.hide();
            this.getAllProducts();
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

  //set data
  setData(data: any) {
    this.scrollToTop();
    this.editMode = true;
    this.addProductForm.reset();
    this.submitted = false;
    this.ProductId = data.Id;
    this.ProductName = data.ProductName;
    this.selectedProductData = data;

    this.addProductForm.markAllAsTouched();
    this.addProductForm.get('ProductName')?.setValue(data.ProductName);

  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.ProductId, Name: this.ProductName, moduleName: 'master-Products' }
    });
  }
}
