import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { ClientService } from 'src/app/components/client.service';
import { Constant } from '../model/constant';
import { ViewMediaComponent } from '../components/view-media/view-media.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  updateTheme = new BehaviorSubject('');
  updateThemeMode = new BehaviorSubject('');
  sidebarDynamicMenu = new BehaviorSubject(false);
  aspxURL = new BehaviorSubject({ status: false, url: '' });
  // aspxURL = new BehaviorSubject({url:'',level:[0,0,0,0,0]});
  requestStatusChanged = new BehaviorSubject(false);

  decodedValue: any;
  allow: boolean = false;
  imageType: any = Constant.imageType;
  excelType: any = Constant.excelType;
  pdfType: any = Constant.pdfType;

  pathNamesList = [
    { name: 'Home', pathName: 'home' },
    { name: 'Client Approver', pathName: 'clientApprover' },
    { name: 'Client', pathName: 'clientMaker' },
    { name: 'Compliance', pathName: 'compliance' },
    { name: 'Assign Role', pathName: 'assign-role' },
    { name: 'Add User', pathName: 'add-user' },
    { name: 'Add Menu', pathName: 'add-menu' },
    { name: 'Assign Menu for Roles', pathName: 'assign-menu-role' },
    { name: 'Group Of Companies', pathName: 'group-of-companies' },
  ];
  AllMenuList: any[] = [];
  moduleList: any[] = [];
  workFlowEnabled: boolean = false;

  constructor(
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    public dialog: MatDialog,
    private router: Router,
  ) {
    // this.getAllMenu();
    this.getWorkflowDropdowns();
  }

  // get All Menus which has URL 
  getAllMenu() {
    this.spinner.show();
    this.clientService.getAllMenu().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.AllMenuList = res.Rows;
          this.spinner.hide();
        }
        else {
          this.spinner.hide();
        }
      }
    });
  }

  getWorkflowDropdowns() {
    // this.spinner.show();
    this.clientService.getWorkflowDropdowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          // this.moduleList = res.Rows;
          this.moduleList = [
            {
              "Id": 1,
              "Screen": "add-user",
              "Module": "Create User",
              "IsActive": false
            },
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
            {
              "Id": 6,
              "Screen": "add-masterDealer",
              "Module": "Dealer",
              "IsActive": false
            },
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
            {
              "Id": 14,
              "Screen": "create-role",
              "Module": "Create Role",
              "IsActive": false
            },
            {
              "Id": 15,
              "Screen": "assign-role",
              "Module": "Assign Role",
              "IsActive": false
            },
            {
              "Id": 16,
              "Screen": "credit-appraisal",
              "Module": "Credit Appraisal Maker",
              "IsActive": false
            },
            {
              "Id": 17,
              "Screen": "credit-appraisal-checker",
              "Module": "Credit Appraisal Checker",
              "IsActive": false
            },
            {
              "Id": 18,
              "Screen": "master-Objects",
              "Module": "Object",
              "IsActive": false
            },
            {
              "Id": 19,
              "Screen": "master-Products",
              "Module": "Product",
              "IsActive": false
            },
            {
              "Id": 20,
              "Screen": "master-budget",
              "Module": "Budget",
              "IsActive": false
            },
            {
              "Id": 21,
              "Screen": "master-region",
              "Module": "Region",
              "IsActive": false
            },
            {
              "Id": 22,
              "Screen": "dealer-manufacturer-relation",
              "Module": "Dealer Manufacturer Relation",
              "IsActive": false
            },
            {
              "Id": 23,
              "Screen": "insured-declared-value",
              "Module": "Insured Declared Value",
              "IsActive": false
            },
            {
              "Id": 24,
              "Screen": "master-accessories",
              "Module": "Accessories",
              "IsActive": false
            },
            {
              "Id": 25,
              "Screen": "master-spareParts",
              "Module": "Spare Parts",
              "IsActive": false
            },
            {
              "Id": 26,
              "Screen": "master-shades",
              "Module": "Shade Master",
              "IsActive": false
            }
          ]
          this.spinner.hide();
        }
        else {

          this.spinner.hide();
        }
      }
      (err: any) => {

        this.spinner.hide();
      }
    });
  }

  pageNavigation(menu: any) {
    if (menu.URL && menu.URL.includes('.aspx')) {
      this.aspxURL.next({ status: true, url: menu.URL });
      // this.commonService.aspxURL.next(menu.URL,menu.AccessLevelArray);
      this.router.navigate(['/' + 'common-page'], {
        state: { level: menu.AccessLevelArray, aspxURL: menu.URL }
      });
    }
    else
      if (menu.URL) {
        // menu.workFlowEnabled = false;
        // if (this.moduleList && this.moduleList.length > 0) {
        //   this.moduleList.map((item => {
        //     if (menu.SubMenuName && menu.SubMenuName != '' && item.Module == menu.SubMenuName && item.IsActive) {
        //       menu.workFlowEnabled = true;
        //     } else if (menu.ChildMenuName && menu.ChildMenuName != '' && item.Module == menu.ChildMenuName && item.IsActive) {
        //       menu.workFlowEnabled = true;
        //     }
        //   }));
        // }

        this.router.navigate(['/' + menu.URL], {
          state: { level: menu.AccessLevelArray, IsAuditTrail: menu.IsAuditTrail, workFlowEnabled: menu.workFlowEnabled }
        });
      }
  }


  decodeString(item: any) {
    this.decodedValue = decodeURIComponent(item);
    return this.decodedValue;
  }

  //Validate Decimal
  validateDecimal(keyCode: number) {
    if (keyCode >= 48 && keyCode <= 57 || keyCode == 46) {
      return true;
    } else {
      return false;
    }
  }

  //Validate Numbers
  validateNumber(keyCode: number) {
    if (keyCode >= 48 && keyCode <= 57) {
      return true;
    } else {
      return false;
    }
  }

  validateInput(event: KeyboardEvent) {
    const inputValue = (event.target as HTMLInputElement).value;
    // Check if the entered value is within the range of 0.1 to 0.9
    if (!/^(0\.[1-9]|[0-9]\.[0-9])$/.test(inputValue)) {
      event.preventDefault(); // Prevent the keypress if the condition is not met
    }
  }

  //custom sorting
  customSort(array: any[], key: string, order: string) {
    return array.sort((a, b) => {
      const aValue = String(a[key]).toLowerCase();
      const bValue = String(b[key]).toLowerCase();
      if (order === 'asc') {
        if (aValue < bValue) {
          return -1;
        } else if (aValue > bValue) {
          return 1;
        } else {
          return 0;
        }
      } else { // Descending order
        if (aValue > bValue) {
          return -1;
        } else if (aValue < bValue) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }

  //validate File
  validateExcelFile(file: any) {
    const fileType = file.name.split('.');
    if (
      !this.excelType.includes(
        fileType[fileType.length - 1].toLowerCase()
      )
    ) {
      this.toaster.error('Please upload file in xlsx, xls format', undefined, {
        positionClass: 'toast-top-center'
      });
      return (this.allow = false);
    } else if (file.size > Constant.maxSizeImage) {
      this.toaster.error(Constant.errors.excelSizeError, undefined, {
        positionClass: 'toast-top-center'
      });
      return (this.allow = false);
    } else {
      return (this.allow = true);
    }
  }

  validateImageFile(file: any) {
    this.toaster.clear();
    const fileType = file.name.split('.');
    if (
      !this.imageType.includes(
        fileType[fileType.length - 1].toLowerCase()
      )
    ) {
      this.toaster.error('Please upload file in jpeg, jpg, png, svg, jfif, gif format', undefined, {
        positionClass: 'toast-top-center'
      });
      return (this.allow = false);
    } else if (file.size > Constant.maxSizeImage) {
      this.toaster.error(Constant.errors.fileSizeError, undefined, {
        positionClass: 'toast-top-center'
      });
      return (this.allow = false);
    } else {
      return (this.allow = true);
    }
  }

  validatePDFFile(file: any) {
    this.toaster.clear();
    const fileType = file.name.split('.');
    if (
      !this.pdfType.includes(
        fileType[fileType.length - 1].toLowerCase()
      )
    ) {
      this.toaster.error('Please upload file in PDF format', undefined, {
        positionClass: 'toast-top-center'
      });
      return (this.allow = false);
    } else if (file.size > Constant.maxSizeImage) {
      this.toaster.error(Constant.errors.fileSizeError, undefined, {
        positionClass: 'toast-top-center'
      });
      return (this.allow = false);
    } else {
      return (this.allow = true);
    }
  }

  viewMedia(url: string) {
    let dialogRef = this.dialog.open(ViewMediaComponent, {
      //width: '1000px',
      disableClose: false,
      data: { url: url },
      panelClass: 'dialog-container-custom-image',
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

  convertBase64ToExcel(base64String: string, fileName: string) {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

}
