import { Component, ViewChild } from '@angular/core';
import { ToggleService } from './toggle.service';
import { CommonService } from '../Services/common.service';
import { Router } from '@angular/router';
import { ClientService } from 'src/app/components/client.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  isToggled = false;
  panelOpenState = false;
  isListOpen: boolean = false;
  recentMenus: any[] = [];
  getrecentMenuItems: any[] = [];
  pathNamesList: any[] = [];
  routerMenu: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }
  localTheme: any;
  themeMode = '';
  currentUser: any;
  userName: any;
  themeModeList = [
    { name: 'Light Mode', selected: true },
    { name: 'Dark Mode', selected: false },
  ];
  showSidebar = false;
  colors = [
    { name: 'Default', hexCode: '#00B0F0', themeClass: 'default-blue-colored-theme' },
    { name: 'Blue', hexCode: '#0070C0', themeClass: 'blue-colored-theme' },
    { name: 'Dark-blue', hexCode: '#002060', themeClass: 'darkBlue-colored-theme' },
    { name: 'Red', hexCode: '#D51D1D', themeClass: 'red-colored-theme' },
    { name: 'Dark-red', hexCode: '#C00000', themeClass: 'darkRed-colored-theme' },
    { name: 'Orange', hexCode: '#FFC000', themeClass: 'orange-colored-theme' },
    { name: 'Yellow', hexCode: '#FFFF00', themeClass: 'yellow-colored-theme' },
    { name: 'Light-green', hexCode: '#92D050', themeClass: 'lightGreen-colored-theme' },
    { name: 'Green', hexCode: '#00B050', themeClass: 'green-colored-theme' },
    { name: 'Violet', hexCode: '#7030A0', themeClass: 'violet-colored-theme' },
  ];

  defaultClass = { name: 'Default', hexCode: '#00B0F0', themeClass: 'default-blue-colored-theme' };

  IsAuditTrail: boolean = false;
  AccessLevel: any;
  AllnotificationList: any;
  notificationList: any;

  constructor(
    private toggleService: ToggleService,
    protected commonService: CommonService,
    private router: Router,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
  ) {

    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);
    this.userName = this.currentUser.UserName;
    this.getTheme();

    this.pathNamesList = this.commonService.pathNamesList;
    this.toggleService.isToggled$.subscribe((isToggled) => {
      this.isToggled = isToggled;
    });

    this.toggleService.showSidebar$.subscribe(showSidebar => {
      this.showSidebar = showSidebar;
    });

    this.commonService.requestStatusChanged.subscribe(res => {
      if (res) {
        this.getNotifications();
      }
    });

    // custom values
    this.AccessLevel = [1, 1, 1, 1, 1];
    this.IsAuditTrail = true;
    // custom values
    this.AllnotificationList = [];
    this.notificationList = [];
    this.getNotifications();
  }

  getTheme() {
    this.themeMode = '';
    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    if (this.localTheme != null && this.localTheme != undefined) {
      this.theme.themeName = this.localTheme.themeName;
      this.theme.themeColorCode = this.localTheme.themeColorCode;
      this.theme.themeClass = this.localTheme.themeClass;

      if (this.localTheme.themeMode == "dark-theme") {
        this.theme.themeMode = 'dark-theme';
        this.themeMode = 'dark-theme';
        document.body.classList.add(this.localTheme.themeMode);
        this.themeModeList[1].selected = true;
        this.themeModeList[0].selected = false;
      }
      else {
        this.themeModeList[0].selected = true;
        this.themeModeList[1].selected = false;
      }
    }
  }

  toggleList() {
    this.isListOpen = !this.isListOpen;
  }
  stopEvent(event: Event) {
    event.stopPropagation();
  }

  toggleSidebar() {
    this.toggleService.toggleSidebar();
  }

  onMenuItemClick(menu: any) {

    // this.pathNamesList.map((item => {
    //   if (item.name == menu) {
    //     this.routerMenu = item.pathName;
    //   }
    // }));

    // if (this.routerMenu) {
    //   this.router.navigate(['/' + this.routerMenu]);
    // }

    if (menu.RoutePath) {
      this.router.navigate(['/' + menu.RoutePath]);
    }
  }

  getRecentMenu() {
    this.recentMenus = [];
    let id = this.currentUser.Id;
    this.spinner.show();
    this.clientService.getRecentMenu(id).subscribe((res: any) => {
      if (!res.HasErrors) {
        this.recentMenus = res.RecentMenuList;
        // this.getrecentMenuItems = res.RecentMenuList;
        // this.recentMenus = [];
        // if (this.getrecentMenuItems) {
        //   // this.getrecentMenuItems.map((item => {
        //   //   this.recentMenus.push(item.MenuName);
        //   // }));

        //   this.recentMenus= res.RecentMenuList;
        // }
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    });
  }
  // currentDate: Date = new Date();


  updateSelection(selectedItem: any) {
    // to uncheck remaining checkbox
    this.themeModeList.forEach((item) => {
      if (item !== selectedItem) {
        item.selected = false;
      }
    });

    // to set default if not selected any theme
    if (!selectedItem.selected) {
      document.body.classList.remove('dark-theme');
      this.themeModeList[0].selected = true;
    }
    // to save theme in local storage
    sessionStorage.setItem('theme', JSON.stringify(this.theme));

    // to change theme
    if (selectedItem.name == 'Dark Mode' && selectedItem.selected) {
      document.body.classList.add('dark-theme');
      this.theme.themeColorCode = '#00B0F0';
      this.theme.themeMode = 'dark-theme';

      sessionStorage.setItem('theme', JSON.stringify(this.theme));
      this.commonService.updateThemeMode.next(this.theme.themeMode);
    }
    else {
      document.body.classList.remove('dark-theme');
      this.theme.themeColorCode = '#00B0F0';
      this.theme.themeMode = '';

      sessionStorage.setItem('theme', JSON.stringify(this.theme));
      this.commonService.updateThemeMode.next(this.theme.themeMode);
    }
  }

  updateSelectionColor(selectedColor: any) {
    this.theme.themeColorCode = selectedColor.hexCode;
    this.theme.themeClass = selectedColor.themeClass;
    this.theme.themeName = selectedColor.name;

    if (selectedColor.themeClass == 'default-blue-colored-theme') {
      this.commonService.updateTheme.next(this.theme.themeName);
    }
    this.commonService.updateTheme.next(selectedColor.themeClass);
  }

  // colorReset() {
  //   this.theme.themeColorCode = '#00B0F0';
  //   this.theme.themeName = 'Default';
  //   this.theme.themeClass = 'default-blue-colored-theme';
  //   this.commonService.updateTheme.next(this.theme.themeName);

  //   sessionStorage.setItem('theme', JSON.stringify(this.theme));
  // }

  saveTheme() {
    sessionStorage.setItem('theme', JSON.stringify(this.theme));

    this.getTheme();
    let data = {
      EmployeeId: this.currentUser.Id,
      theme: this.theme,
    }

    this.spinner.show();
    this.clientService.saveTheme(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.toaster.success('Theme Saved successfully!', undefined, {
            positionClass: 'toast-top-center'
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

  closeThemeMenu() {
    this.theme.themeName = this.localTheme.themeName;
    this.theme.themeClass = this.localTheme.themeClass;
    this.theme.themeColorCode = this.localTheme.themeColorCode;
    this.commonService.updateTheme.next(this.theme.themeClass);
    this.commonService.updateThemeMode.next(this.theme.themeMode);
  }

  clearSession() {
    document.body.classList.remove('dark-theme');
    sessionStorage.clear();
    localStorage.clear();
  }

  openPendingRequests() {
    this.router.navigate(['pending-requests'], {
      state: { level: this.AccessLevel }
    })
  }

  getNotifications() {
    this.spinner.show();
    this.clientService.getPendingRequests(this.currentUser.UserId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.AllnotificationList = res.Rows;
          this.notificationList = [];
          if (this.AllnotificationList.length > 3) {
            this.AllnotificationList.map((item: any, index: number) => {
              if (index <= 3) {
                this.notificationList.push(item);
              }
            })
          } else {
            this.notificationList = this.AllnotificationList;
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
}
