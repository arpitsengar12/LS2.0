import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { DeletemakerComponent } from '../client-maker/deletemaker/deletemaker.component';
import { ClientService } from '../client.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Constant } from 'src/app/shared/model/constant';

export interface PeriodicElement {
  ClientName: string,
  PreFix: string,
  FirstName: string,
  LastName: string,
  City: string,
  MobileNo: string,
}

@Component({
  selector: 'app-users-and-drivers',
  templateUrl: './users-and-drivers.component.html',
  styleUrls: ['./users-and-drivers.component.scss']
})
export class UsersAndDriversComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  displayedColumns: string[] = ['Client Name', 'PreFix', 'First Name', 'Last Name', 'City', 'Mobile No', 'Action'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  DriversUsersList: any[] = [];
  clientList: any;
  totalRecords: any;
  clientId: number = 0;
  PageNumber: number = 1;
  PageSize: number = 10;
  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Client Name' },
    { filterName: 'Prefix' },
    { filterName: 'First Name' },
    { filterName: 'Last Name' },
    { filterName: 'City' },
    // { filterName: 'Created By' },
  ];
  filterBtnClicked: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  uploadDriverExlForm!: FormGroup;
  submitted: boolean = false;
  media: string | Blob;
  fileUploaded: boolean = false;
  files: File[] = [];
  fileName: string = '';
  imageUrl: string = '';
  fileType: string = '';
  url: any = '';
  excelType = Constant.excelType;
  attachmentType: string = '';
  excelUploaded: boolean = false;
  selectedRowIndex: any;
  IsSearch: boolean = false;

  constructor(
    public dialog: MatDialog,
    private clientService: ClientService,
    private route: Router,
    private toaster: ToastrService,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
  ) {

    if (history.state.level) {
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

    this.uploadDriverExlForm = new FormGroup({
      clientName: new FormControl(null, [Validators.required,]),
      driverExcel: new FormControl('', [Validators.required]),

    });
    this.getUserAndDriversData();
    this.GetAllClients();
  }

  get validators() {
    return this.uploadDriverExlForm.controls;
  }

  getUserAndDriversData() {
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
          // ClientName: this.selectedFilter.filterName == "Client Name" ? this.searchText : "",
          // Prefix: this.selectedFilter.filterName == "Prefix" ? this.searchText : "",
          // FirstName: this.selectedFilter.filterName == "First Name" ? this.searchText : "",
          // LastName: this.selectedFilter.filterName == "Last Name" ? this.searchText : "",
          // CityName: this.selectedFilter.filterName == "City" ? this.searchText : "",
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
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
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

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getUserAndDriversData();
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
      this.getUserAndDriversData();
    }, 500);
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getUserAndDriversData();
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
    this.getUserAndDriversData();
  }

  addClick() {
    this.route.navigate(["/create-usersAndDrivers"], {
      state: { level: this.AccessLevel, }
    })
  }

  openViewDialog(event: any) {
    this.route.navigate(["/create-usersAndDrivers"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "view"
      }
    });

  }

  openEditModal(event: any) {
    this.route.navigate(["/create-usersAndDrivers"], {
      state: {
        level: this.AccessLevel, id: event.Id, mode: "edit"
      }
    });

  }

  openDeletemaker(element: any): void {
    let dialogRef = this.dialog.open(DeletemakerComponent, {
      width: '700px',
      height: '200px',
      data: { mode: 'delete', Id: element.Id }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteMaker(element.Id);
      }
    });
  }

  deleteMaker(id: any) {
    this.spinner.show();
    this.clientService.deleteClient(id).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.toaster.success("Deleted Successfully!", undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
          this.getUserAndDriversData();
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

  // searchFilter() {
  //   const data =
  //   {
  //     Page: {
  //       PageNumber: this.PageNumber + 1, PageSize: this.PageSize,
  //       Filter: { Search: this.searchText }
  //     }
  //   }
  //   let formData: FormData = new FormData();
  //   formData.append("RequestData", JSON.stringify(data));

  //   this.spinner.show();
  //   this.clientService.getAllClient(formData).subscribe((res: any) => {
  //     if (res) {
  //       if (!res.HasErrors) {
  //         this.DriversUsersList = res.Records;
  //         this.totalRecords = res.TotalCount;
  //         this.spinner.hide();
  //       }
  //       else {
  //         this.toaster.error(res?.Errors[0]?.Message, undefined, {
  //           positionClass: 'toast-top-center'
  //         });
  //         this.spinner.hide();
  //       }
  //     }
  //     (err: any) => {
  //       this.toaster.error(err, undefined, {
  //         positionClass: 'toast-top-center'
  //       });
  //       this.spinner.hide();
  //     }

  //   })
  // }

  selectedClient(event: any) {
    if (event) {
      this.clientId = event.ClientId;
    }
  }

  GetAllClients() {
    const data =
    {
      Page:
      {
        PageNumber: 0,
        PageSize: 0,
        Filter: {
          ClientName: "",
          CityName: "",
          PANNo: "",
          PinCode: "",
          CreatedBy: "",
          UserName: "",
          // Id: 1, // this.currentUser.RoleId,
          // RoleName: "BDM", // this.currentUser.UserRole,
          // DepartmentId: 1 // this.currentUser.DepartmentId
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getAllClient(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.clientList = res.Records;
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

  //upload media
  upload(event: any) {
    var files = event.target.files[0];
    if (this.commonService.validateExcelFile(files)) {
      const reader = new FileReader();
      reader.readAsDataURL(files);
      reader.onload = () => {
      };
      this.media = files;
    }
    else {
      this.uploadDriverExlForm.get('driverExcel')?.reset();
    }
  }

  uploadFile() {
    this.submitted = true;
    if (this.uploadDriverExlForm.status == 'VALID') {

      var data = {
        ClientId: this.uploadDriverExlForm.value.clientName,
        CreatedById: this.currentUser.UserId
      }
      let formData: FormData = new FormData();
      formData.append('RequestData', JSON.stringify(data));
      // formData.append('files', this.media);
      if (this.files.length === 1) {
        formData.append('file', this.files[0], this.files[0].name);
      }
      this.spinner.show();
      this.clientService.importDriversUSers(formData).subscribe((res: any) => {
        if (!res.HasErrors) {
          this.spinner.hide();
          this.fileUploaded = true;
          this.submitted = false;
          this.toaster.success("File uploaded Successfully", undefined, {
            positionClass: 'toast-top-center'
          });
          this.uploadDriverExlForm.reset();
          this.getUserAndDriversData();
        } else {
          this.spinner.hide();
          this.toaster.error(res?.Errors[0]?.Message, undefined, {
            positionClass: 'toast-top-center'
          });
        }
      });
    }
  }

  getDriverExlFormat() {
    this.spinner.show();
    this.clientService.getDriverExlFormat().subscribe((res: any) => {
      if (!res.HasErrors) {
        this.downloadExlFile(res.ExcelBase64);
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    });
  }

  downloadExlFile(file: string): void {
    const sourceFile = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${file}`;
    const link = document.createElement('a');
    link.href = sourceFile;
    link.download = `Sample.xlsx`;
    link.click();
  }

  onSelect(event: any) {
    this.files = [];
    this.toaster.clear();
    this.files.push(...event.addedFiles);
    if (this.commonService.validateExcelFile(this.files[0])) {
      const reader = new FileReader();
      reader.readAsDataURL(this.files[0]);
      reader.onload = () => {
        this.url = reader.result as string;
      };
      this.fileName = this.files[0]?.name;
      this.fileType = this.files[0]?.type;
      // this.attachmentType = this.fileType.split('/')[1];
      // if (this.excelType.includes(this.attachmentType)) {
      //   this.excelUploaded = true;
      // }
      // else {
      //   this.excelUploaded = false;
      // }

    }
  }

}

