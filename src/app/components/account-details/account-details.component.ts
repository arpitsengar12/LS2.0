import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { userDetails } from '../assign-role/assign-role.component';
import { ClientService } from '../client.service';
import { DataService } from '../core/http/data.service';
import { Location } from '@angular/common';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DriverExlUpldPopUpComponent } from './driver-exl-upld-pop-up/driver-exl-upld-pop-up.component';
import { Sort } from '@angular/material/sort';

export interface PeriodicElement {
  GroupName: string;
  CityName: string;
  CreatedBy: string;
  CreatedDate: string;
}

interface RouteData {
  breadcrumb?: string;
}

// interface ClientDetails {
//   ClientName: string,
//   Mobile1: string,
//   Email: string,
//   Address: string,
//   QuotnDate: string,
//   FMS: number,
//   LR: number,
//   CreditScore: number,
//   TotalCredit: number,
//   RV: number,
//   Status: string,
//   Profit: number,
// }

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})

export class AccountDetailsComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;

  GOCdisplayedColumns: string[] = ['GroupName', 'CityName', 'OfficeAddress', 'CP1', 'CP2', 'Mobile1', 'Mobile2', 'Email1', 'Email2', 'CreatedBy', 'CreatedDate', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  groupNameList: any[] = [];
  // PageNumber: number = 1;
  GOCPageNumber: number = 1;
  COfficePageNumber: number = 1;
  DriverPageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  GOCtotalRecords: number;
  COfficetotalRecords: number;
  DrivertotalRecords: number;
  clientId: number = 0;
  selectedClientData = {
    ClientName: "",
    Mobile1: "",
    EmailId1: "",
    AccountAddress: "",
    QuotnDate: "",
    Profit: 0,
    RV: 0,
    Status: "",

  };
  ClientOtherData = {
    FMS: 6888.88,
    LR: 29636.52,
    CreditScore: 7,
    TotalCredit: "5,00,000",
    Tax: "State Tax"
  }
  isView: boolean = false;
  editMode: boolean = false;
  panelOpenState = false;
  selectedtab: number = 0;

  @ViewChild('COfficeTableList') COfficeTableList!: MatTable<any>;
  @ViewChild('driverTableList') driverTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';

  clientOfficeList: any[] = [];
  ClientOfficedisplayedColumns: string[] = ['ClientId', 'ClientOfficeCode', 'ClientName', 'CityName', 'PinCode', 'ContactPerson', 'OracleCustId', 'OracleCustSiteId', 'Status', 'GSTNO', 'WFStatus', 'Action'];

  UserDriverdisplayedColumns: string[] = ['Client Name', 'PreFix', 'First Name', 'Last Name', 'City', 'Mobile No', 'WFStatus', 'Action'];
  DriversUsersList: any[] = [];

  GOCTabSelected: boolean = false;
  clientOfficeTabSelected: boolean = false;
  UserDriverTabSelected: boolean = false;

  selectedRowIndex1: any;
  selectedRowIndex2: any;
  selectedRowIndex3: any;
  IsSearch: boolean = false;
  GOCIsSearch: boolean = false;
  GOCfilterBtnClicked: boolean = false;
  COfficeIsSearch: boolean = false;
  COfficefilterBtnClicked: boolean = false;
  DriverIsSearch: boolean = false;
  DriverfilterBtnClicked: boolean = false;
  timer: any;
  searchText = '';
  GOCsearchText = '';
  COfficesearchText = '';
  DriversearchText = '';
  departmentList: any;
  departmentId: number = 0;
  departmentName: any;
  selectedFilter = { filterName: '' };
  GOCfilterList = [
    { filterName: 'Group Name' },
    { filterName: 'City' },
    { filterName: 'Created By' },
  ];
  COfficefilterList = [
    { filterName: 'Client Name' },
    { filterName: 'City' },
    { filterName: 'Contact Person' },
    { filterName: 'Pin Code' },
  ];
  DriverfilterList = [
    { filterName: 'Client Name' },
    { filterName: 'Prefix' },
    { filterName: 'First Name' },
    { filterName: 'Last Name' },
    { filterName: 'City' },
  ];
  filterAllBtnClicked: boolean = false;
  OtherFilterList = [
    { filterName: 'Oracle Code Not Update' },
    { filterName: 'Error' },
    { filterName: 'Not Stagged' },
  ];
  filterBtnClicked: boolean = false;
  GOCIsAuditTrail: boolean = false;
  CofficeIsAuditTrail: boolean = false;
  DriverIsAuditTrail: boolean = false;
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
    private router: Router,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
  ) {

    if (history.state.level) {
      this.GOCIsAuditTrail = history.state.IsAuditTrail;
      this.CofficeIsAuditTrail = history.state.IsAuditTrail;
      this.DriverIsAuditTrail = history.state.IsAuditTrail;

      this.clientId = history.state.id;
      if (history.state.IsAccountDetails) {
        this.getClientById();
      }

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
    this.clientOfficeTabSelected = true;
    this.GetAllGroupOfCompanies();
    this.GetAllClientsOffices();
    this.getAllUserAndDrivers();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Clients';
      this.breadcrumbService.setBreadcrumbs(['Master / Clients', breadcrumb]);
    });
  }

  getClientById() {
    this.spinner.show();
    this.clientService.getClientById(this.clientId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedClientData = res;
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

  GetAllGroupOfCompanies() {
    const data =
    {
      Page:
      {
        // GOCPageNumber: this.GOCPageNumber + 1,
        PageNumber: this.GOCPageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.GOCIsSearch,
          // GOCName: this.selectedFilter.filterName == "Group Name" ? this.GOCsearchText : "",
          // CityName: this.selectedFilter.filterName == "City" ? this.GOCsearchText : "",
          // CreatedBy: this.selectedFilter.filterName == "Created By" ? this.GOCsearchText : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.GetAllGroupOfCompanies(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.groupNameList = res.Records;
          this.GOCtotalRecords = res.TotalCount;
          this.selectedRowIndex1 = null;
          this.groupNameList.map((item, index) => {
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

  GetAllClientsOffices() {
    const data =
    {
      Page:
      {
        // COfficePageNumber: this.COfficePageNumber + 1,
        PageNumber: this.COfficePageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.COfficeIsSearch,
          SearchValue: this.COfficesearchText,
          // ClientName: this.selectedFilter.filterName == "Client Name" ? this.COfficesearchText : "",
          // CityName: this.selectedFilter.filterName == "City" ? this.COfficesearchText : "",
          // ContactPerson: this.selectedFilter.filterName == "Contact Person" ? this.COfficesearchText : "",
          // PinCode: this.selectedFilter.filterName == "Pin Code" ? this.COfficesearchText : "",
          // ClientId: "",
          oracleCodeNotUpdate: this.selectedFilter.filterName == "Oracle Code Not Update" ? "Oracle Code Not Update" : "",
          IsError: this.selectedFilter.filterName == "Error" ? "Error" : "",
          NotStagged: this.selectedFilter.filterName == "Not Stagged" ? "Not Stagged" : "",
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllClientOffices(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.clientOfficeList = res.Records;
          this.COfficetotalRecords = res.TotalCount;
          this.selectedRowIndex2 = null;
          this.clientOfficeList.map((item, index) => {
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

  getAllUserAndDrivers() {
    const data =
    {
      Page:
      {
        // DriverPageNumber: this.DriverPageNumber + 1,
        PageNumber: this.DriverPageNumber,
        PageSize: this.PageSize,
        Filter: {
          // CreatedById: this.currentUser.UserId,
          IsSearch: this.DriverIsSearch,
          SearchValue: this.DriversearchText,
          // ClientName: this.selectedFilter.filterName == "Client Name" ? this.DriversearchText : "",
          // Prefix: this.selectedFilter.filterName == "Prefix" ? this.DriversearchText : "",
          // FirstName: this.selectedFilter.filterName == "First Name" ? this.DriversearchText : "",
          // LastName: this.selectedFilter.filterName == "Last Name" ? this.DriversearchText : "",
          // CityName: this.selectedFilter.filterName == "City" ? this.DriversearchText : "",
          // Id: "",
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllDriversAndUsers(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.DriversUsersList = res.Records;
          this.DrivertotalRecords = res.TotalCount;
          this.selectedRowIndex3 = null;
          this.DriversUsersList.map((item, index) => {
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

  tabClick(event: any) {
    this.selectedtab = event.index;
    this.GOCfilterBtnClicked = false;
    this.COfficefilterBtnClicked = false;
    this.DriverfilterBtnClicked = false;

    // if (this.selectedtab == 0) {
    //   // this.GetAllGroupOfCompanies();
    //   this.GOCTabSelected = true;
    //   this.UserDriverTabSelected = false;
    //   this.clientOfficeTabSelected = false;
    // }
    // else 
    if (this.selectedtab == 0) {
      // this.GetAllClientsOffices();
      this.clientOfficeTabSelected = true;
      this.GOCTabSelected = false;
      this.UserDriverTabSelected = false;
    }
    else if (this.selectedtab == 1) {
      // this.getAllUserAndDrivers();
      this.UserDriverTabSelected = true;
      this.clientOfficeTabSelected = false;
      this.GOCTabSelected = false;
    }


    let tab: any = event.tab;
    if (tab) {
      let _closestTabGroup: any = tab._closestTabGroup;
      let _elementRef: any = _closestTabGroup._elementRef;
      let nativeElement: any = _elementRef.nativeElement;
      let children: any = nativeElement.children;
      let children1: any = children[1];
      let Childs: any = children1.children;
      let Child1 = Childs[0];
      let Child2 = Childs[1];
      // let Child3 = Childs[2];

      // let childArray: any[] = [Child1, Child2, Child3];
      // let childArray: any[] = [Child1, Child2];
      // childArray.map((item, i) => {
      //   let tabContentWrapper: any = item.children;
      //   let tabContent: any = tabContentWrapper[0];
      //   if (this.selectedtab === i) {
      //     tabContent.classList.add('blue-bg');
      //   } else {
      //     tabContent.classList.remove('blue-bg');
      //   }
      // });
    }

  }


  COfficeFilterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.GetAllClientsOffices();
      }
    }
    else {
      this.selectedFilter = { filterName: '' };
    }
  }


  // to search on the text input
  COfficeSearchFilterApplied() {
    this.COfficeIsSearch = this.COfficesearchText && this.COfficesearchText != '' ? true : false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.GetAllClientsOffices();
    }, 500);
  }

  COfficeAnnounceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.clientOfficeList = this.commonService.customSort(this.clientOfficeList, sortState.active, sortState.direction);
      this.COfficeTableList.renderRows();
    }
  }

  COfficehandlePage(event: any) {
    this.COfficePageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.GetAllClientsOffices();
  }

  UserDriverFilterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getAllUserAndDrivers();
      }
    }
    else {
      this.selectedFilter = { filterName: '' };
    }
  }

  // to search on the text input
  DriverSearchFilterApplied() {
    this.DriverIsSearch = this.DriversearchText && this.DriversearchText != '' ? true : false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.getAllUserAndDrivers();
    }, 500);
  }

  DriverAnnounceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.DriversUsersList = this.commonService.customSort(this.DriversUsersList, sortState.active, sortState.direction);
      this.driverTableList.renderRows();
    }
  }

  DriverhandlePage(event: any) {
    this.DriverPageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.GetAllClientsOffices();
  }

  // pageChange(event: any) {
  //   this.PageNumber = event.pageIndex;
  //   this.PageSize = event.pageSize;
  //   this.GetAllGroupOfCompanies();
  // }

  // getPages(): number[] {
  //   const totalPages = this.totalPages();
  //   const startPage = Math.max(1, this.PageNumber - 2);
  //   const endPage = Math.min(totalPages, startPage + 4);

  //   const pages: number[] = [];
  //   for (let i = startPage; i <= endPage; i++) {
  //     pages.push(i);
  //   }

  //   return pages;
  // }

  // totalPages(): number {
  //   return Math.ceil(this.totalRecords / 10);
  // }

  // pageClick(event: any) {
  //   this.PageNumber = event;
  //   this.GetAllGroupOfCompanies();
  // }

  GOCgetPages(): (number | string)[] {
    const totalPages = this.GOCtotalPages();
    let startPage = Math.max(1, this.GOCPageNumber - 1);
    let endPage = Math.min(totalPages, startPage + 1);

    // If near the end, adjust the startPage
    if (totalPages - this.GOCPageNumber <= 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    // If near the start, adjust the endPage
    if (this.GOCPageNumber <= 3) {
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

  GOCtotalPages(): number {
    return Math.ceil(this.GOCtotalRecords / 10);
  }

  GOCpageClick(event: any) {
    this.GOCPageNumber = event;
    this.GetAllGroupOfCompanies();
  }

  COfficegetPages(): (number | string)[] {
    const totalPages = this.COfficetotalPages();
    let startPage = Math.max(1, this.COfficePageNumber - 1);
    let endPage = Math.min(totalPages, startPage + 1);

    // If near the end, adjust the startPage
    if (totalPages - this.COfficePageNumber <= 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    // If near the start, adjust the endPage
    if (this.COfficePageNumber <= 3) {
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

  COfficetotalPages(): number {
    return Math.ceil(this.COfficetotalRecords / 10);
  }

  COfficepageClick(event: any) {
    this.COfficePageNumber = event;
    this.GetAllClientsOffices();
  }

  DrivergetPages(): (number | string)[] {
    const totalPages = this.DrivertotalPages();
    let startPage = Math.max(1, this.DriverPageNumber - 1);
    let endPage = Math.min(totalPages, startPage + 1);

    // If near the end, adjust the startPage
    if (totalPages - this.DriverPageNumber <= 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    // If near the start, adjust the endPage
    if (this.DriverPageNumber <= 3) {
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

  DrivertotalPages(): number {
    return Math.ceil(this.DrivertotalRecords / 10);
  }

  DriverpageClick(event: any) {
    this.DriverPageNumber = event;
    this.getAllUserAndDrivers();
  }

  openAddGOC() {
    this.router.navigate(["/group-of-companies"], {
      state: {
        level: this.AccessLevel, mode: 'add'
      }
    });
  }

  openUpdateGOC(event: any) {
    this.router.navigate(["/group-of-companies"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: 'edit', IsAuditTrail: this.GOCIsAuditTrail
      }
    });
  }

  openAddClientOffice() {
    this.router.navigate(["/client-office"], {
      state: {
        level: this.AccessLevel, mode: 'add'
      }
    });
  }

  openEditModalCOffice(event: any) {
    this.router.navigate(["/client-office"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: 'edit', IsAuditTrail: this.CofficeIsAuditTrail
      }
    });
  }

  openViewDialogCOffice(event: any) {
    this.router.navigate(["/client-office"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "view", IsAuditTrail: this.CofficeIsAuditTrail
      }
    });

  }

  openAddUsersAndDrivers() {
    this.router.navigate(["/create-usersAndDrivers"], {
      state: {
        level: this.AccessLevel, mode: 'add'
      }
    });
  }

  openUpdateUsersAndDrivers(event: any) {
    this.router.navigate(["/create-usersAndDrivers"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: 'edit', IsAuditTrail: this.DriverIsAuditTrail
      }
    });
  }


  openViewDialogUsersAndDrivers(event: any) {
    this.router.navigate(["/create-usersAndDrivers"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "view", IsAuditTrail: this.DriverIsAuditTrail
      }
    });

  }

  DriverExlUpldPopUp() {
    let dialogRef = this.dialog.open(DriverExlUpldPopUpComponent, {
      width: '750px',
      height: '250px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllUserAndDrivers();
      }
    });
  }

}
