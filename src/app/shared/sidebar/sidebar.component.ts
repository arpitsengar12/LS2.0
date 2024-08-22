import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ToggleService } from '../header/toggle.service';
import { CommonService } from '../Services/common.service';
import { Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { ClientService } from 'src/app/components/client.service';
import { FormControl, FormGroup } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  // @ViewChild('favMenuDiv', { static: true }) favMenuDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('favMenu') public ngSelectComponent: NgSelectComponent;
  @ViewChild('childMenuDiv') childMenuDiv: ElementRef<HTMLDivElement>;
  panelOpenState = false;
  mtValue = '0px';
  divDisplay = 'none';
  currentUser: any;

  isToggled = false;
  isFavMenuOpened = false;
  showSidebar = false;
  pathNamesList: any[] = [];
  routerMenu: any;
  sidebarFavMenu: any[] = [];
  childMenuDisplay = 'none';
  childMenuMtValue: any;
  subMenuHovered: boolean = false;
  childMenuHovered: boolean = false;
  addFavBtnClicked: boolean = false;
  singleClick: boolean = false;
  isHovered: boolean = false;

  favoriteMenuList: any[] = [];
  favMenuList: any[] = [];
  favMenuForm!: FormGroup;
  favMenuDisabled: boolean = false;
  favMenuBuffer: boolean = false;

  favMenuItems: any[] = [];
  sidebarMenuItems: any[] = [];
  ChildMenuList: any[] = [];
  AllMenuList: any[] = [];
  filteredMenus: any[] = [];
  @ViewChild(MatAccordion) accordion: MatAccordion;
  AccessLevel = [0, 0, 0, 0, 0];

  constructor(
    private toggleService: ToggleService,
    protected commonService: CommonService,
    private router: Router,
    private clientService: ClientService,
    private renderer: Renderer2,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    this.toggle();
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);
    // this.pathNamesList = this.commonService.pathNamesList;
    this.getDynamicMenus();

    this.toggleService.isToggled$.subscribe(isToggled => {
      this.isToggled = isToggled;
    });

    this.toggleService.showSidebar$.subscribe(showSidebar => {
      this.showSidebar = showSidebar;
    });

    this.favMenuForm = new FormGroup({
      favMenuName: new FormControl(null)
    });

    this.commonService.sidebarDynamicMenu.subscribe(res => {
      if (res) {
        this.getDynamicMenus();
      }
    });
  }

  ngOnInit() {
    this.renderer.listen('window', 'click', (event: Event) => {
      let target: any = event.target;
      // if (!this.favMenuDiv.nativeElement.contains(target)) {
      //   this.divDisplay = 'none';
      // }
    });
    // this.getfavoriteMenu();
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }

  toggle() {
    this.toggleService.toggle();
  }

  toggleSidebar() {
    this.toggleService.toggleSidebar();
  }

  addFavBtnClick() {
    this.addFavBtnClicked = true;
  }
  addToFavInput() {

    // this.addFavBtnClicked=false;
  }

  getDynamicMenus() {
    let roleId = this.currentUser.RoleId;
    this.spinner.show();
    this.clientService.getDynamicMenus(roleId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.AllMenuList = res.Rows;
          this.sidebarMenuItems = this.AllMenuList;
          this.favMenuItems = this.AllMenuList;
          this.sidebarMenuItems.map(item => {
            let SubmenuList: any = item.SubmenuList;
            SubmenuList.map((subMenu: any) => {
              subMenu.selected = true;
              if (subMenu.ChildMenuList && subMenu.ChildMenuList.length > 0) {
                subMenu.ChildMenuList.map((childMenu: any) => {
                  childMenu.selected = false;
                });
              }
            });
          });

          this.favMenuItems.map(item => {
            let SubmenuList: any = item.SubmenuList;
            SubmenuList.map((subMenu: any) => {
              subMenu.selected = true;
              if (subMenu.ChildMenuList && subMenu.ChildMenuList.length > 0) {
                subMenu.ChildMenuList.map((childMenu: any) => {
                  childMenu.selected = false;
                });
              }
            });
          });

          this.spinner.hide();
        }
        else {
          this.spinner.hide();
        }
      }
    });
  }


  subMenuOpened(menu: any) {
    if (menu.URL != null && menu.URL != undefined) {
      this.sidebarMenuItems.map(item => {
        let SubmenuList = item.SubmenuList;
        SubmenuList.map((subMenu: any) => {
          if (subMenu.SubMenuName != menu.SubMenuName) {
            subMenu.selected = false;
          }
        })
      });

      this.favMenuItems.map(item => {
        let SubmenuList = item.SubmenuList;
        SubmenuList.map((subMenu: any) => {
          if (subMenu.SubMenuName != menu.SubMenuName) {
            subMenu.selected = false;
          }
        })
      });
    }
  }

  childMenuOpened(menu: any) {
    this.sidebarMenuItems.map(item => {
      let SubmenuList = item.SubmenuList;
      SubmenuList.map((subMenu: any) => {
        subMenu.selected = false;
        let childList: any = subMenu.ChildMenuList;
        if (childList != null) {
          childList.map((childMenu: any) => {
            childMenu.selected = false;
            if (childMenu.ChildMenuName == menu) {
              subMenu.selected = true;
              childMenu.selected = true;
              this.AccessLevel = subMenu.AccessLevelArray;
            }
          });
        }
      })
    });

    this.favMenuItems.map(item => {
      let SubmenuList = item.SubmenuList;
      SubmenuList.map((subMenu: any) => {
        subMenu.selected = false;
        let childList: any = subMenu.ChildMenuList;
        if (childList != null) {
          childList.map((childMenu: any) => {
            childMenu.selected = false;
            if (childMenu.ChildMenuName == menu) {
              subMenu.selected = true;
              childMenu.selected = true;
              this.AccessLevel = subMenu.AccessLevelArray;
            }
          });
        }
      })
    });
  }

  menuClicked(menu: any) {
    this.addMenu(menu);
    // this.router.navigate(['/' + menu.URL]);

    this.commonService.pageNavigation(menu);
    // if (menu.URL && menu.URL.includes('.aspx')) {
    //   this.commonService.aspxURL.next({ status: true, url: menu.URL });
    //   // this.commonService.aspxURL.next(menu.URL,menu.AccessLevelArray);
    //   this.router.navigate(['/' + 'common-page'], {
    //     state: { level: menu.AccessLevelArray, aspxURL: menu.URL }
    //   });
    // }
    // else
    //   if (menu.URL) {
    //     this.router.navigate(['/' + menu.URL], {
    //       state: { level: menu.AccessLevelArray }
    //     });
    //   }
  }

  // to show all expansion menu on click of header
  allexpansionMenu() {
    this.sidebarMenuItems.map(item => {
      let SubmenuList = item.SubmenuList;
      SubmenuList.map((subMenu: any) => {
        subMenu.selected = true;
        if (subMenu.ChildMenuList && subMenu.ChildMenuList.length > 0) {
          subMenu.ChildMenuList.map((childMenu: any) => {
            childMenu.selected = true;
          });
        }
      })
    });

    this.favMenuItems.map(item => {
      let SubmenuList = item.SubmenuList;
      SubmenuList.map((subMenu: any) => {
        subMenu.selected = true;
        if (subMenu.ChildMenuList && subMenu.ChildMenuList.length > 0) {
          subMenu.ChildMenuList.map((childMenu: any) => {
            childMenu.selected = true;
          });
        }
      })
    });
  }

  allchildMenu() {
    this.sidebarMenuItems.map(item => {
      let SubmenuList = item.SubmenuList;
      SubmenuList.map((subMenu: any) => {
        if (subMenu.ChildMenuList && subMenu.ChildMenuList.length > 0) {
          subMenu.ChildMenuList.map((childMenu: any) => {
            childMenu.selected = true;
          });
        }
      })
    });
  }

  addMenu(menu: any) {
    // to get router path 
    let menuName = "";
    if (menu.SubMenuName) {
      menuName = menu.SubMenuName;
    }
    else if (menu.ChildMenuName) {
      menuName = menu.ChildMenuName;
    }
    else {
      menuName = menu.menuName;
    }

    let data = {
      MenuName: menuName,
      RoutePath: menu.URL,
      EmployeeId: this.currentUser.Id,
      CreatedById: this.currentUser.UserId,
      ModifiedById: this.currentUser.UserId
    }


    this.spinner.show();
    this.clientService.addRecentMenu(data).subscribe((res: any) => {
      if (!res.HasErrors) {
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    });
  }

  addfavorite(item: any) {
    this.divDisplay = 'none';
    this.addFavBtnClicked = false;
    let data = {
      MenuName: [item.Menu],
      // RoutePath: item.URL,
      EmployeeId: this.currentUser.Id,
      Order: 1,
      CreatedById: this.currentUser.UserId,
      ModifiedById: this.currentUser.UserId
    }
    // this.spinner.show();
    // this.favMenuDisabled = true;
    this.favMenuBuffer = true;
    this.clientService.addfavoriteMenu(data).subscribe((res: any) => {
      if (!res.HasErrors) {
        this.addFavBtnClicked = false;
        // this.spinner.hide();
        this.favMenuForm.reset();
        // this.favMenuDisabled = false;
        this.favMenuBuffer = false;
        this.getfavoriteMenu();
      }
      else {
        this.toastr.error(res?.Errors[0]?.Message, undefined, {
          positionClass: 'toast-top-center'
        });
        // this.spinner.hide();
        // this.favMenuDisabled = false;
        this.favMenuBuffer = false;
      }
    });
  }


  // openContextMenu(event: MouseEvent): void {
  //   // event.preventDefault();
  //   this.sidebarFavMenu = []; // to empty this array before pushing new one
  //   let value: any = event.target;
  //   let childNode: any = value.lastChild;

  //   this.divDisplay = 'flex';
  //   let offsetParent = value.offsetParent;
  //   if (offsetParent.localName == 'a' || value.localName == 'a') {
  //     this.mtValue = offsetParent.offsetTop + value.offsetTop;
  //   }
  //   else if (offsetParent.localName == 'i') {
  //     let offsetParentI: any = offsetParent.offsetParent;
  //     this.mtValue = offsetParentI.offsetTop + value.offsetTop;
  //   }
  //   // this.mtValue = offsetParent.offsetTop + value.offsetTop;

  //   let parentElement: any = value.parentElement;
  //   let parentLocalName: any = parentElement.localName; // to ignore pushing icon names in favorite menu

  //   if (value.lastElementChild !== null && parentLocalName === 'a' || parentLocalName == 'mat-accordion') {
  //     if (this.sidebarFavMenu.length == 0) {
  //       this.sidebarFavMenu.push(childNode.innerText);
  //     }
  //     else {
  //       if (!this.sidebarFavMenu.some(element => element == childNode.innerText)) {
  //         this.sidebarFavMenu.push(childNode.innerText);
  //       }
  //     }
  //   }
  //   else if (value.lastElementChild == null && parentLocalName === 'a' || parentLocalName === 'li') {
  //     if (this.sidebarFavMenu.length == 0) {
  //       this.sidebarFavMenu.push(value.innerText);
  //     }
  //     else {
  //       if (this.sidebarFavMenu.some(element => element !== value.innerText)) {
  //         this.sidebarFavMenu.push(value.innerText);
  //       }
  //     }
  //   }
  //   else if (parentLocalName == 'i') {
  //     let nextElementSibling: any = parentElement.nextElementSibling;
  //     this.sidebarFavMenu.push(nextElementSibling.innerText);
  //   }
  // }

  onSubMenuHover(event: MouseEvent) {
    this.ChildMenuList = [];
    this.subMenuHovered = true;
    this.childMenuHovered = true;
    event.preventDefault();
    let target: any = event.target;
    let childNode: any = target.lastChild;

    this.sidebarMenuItems.map(item => {
      let SubmenuList = item.SubmenuList;
      SubmenuList.map((subMenu: any) => {
        if (subMenu.ChildMenuList != null) {
          if (subMenu.SubMenuName == target.innerText && subMenu.ChildMenuList.length > 0) {
            this.ChildMenuList = subMenu.ChildMenuList;
          }
        }
      })
    });

    this.favMenuItems.map(item => {
      let SubmenuList = item.SubmenuList;
      SubmenuList.map((subMenu: any) => {
        if (subMenu.ChildMenuList != null) {
          if (subMenu.SubMenuName == target.innerText && subMenu.ChildMenuList.length > 0) {
            this.ChildMenuList = subMenu.ChildMenuList;
          }
        }
      })
    });

    this.childMenuDisplay = 'flex';
    if (this.childMenuDiv) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;

      // Calculate the position relative to the viewport
      const top = rect.top + scrollTop;
      const left = rect.left + scrollLeft;

      this.childMenuMtValue = top - 115;
    }
  }

  getfavoriteMenu() {
    let data = {
      id: this.currentUser.Id,
      RoleId: this.currentUser.RoleId,
    }
    let id: any = this.currentUser.Id;
    // this.spinner.show();
    // this.favMenuDisabled = true;
    this.favMenuBuffer = true;
    this.clientService.getfavoriteMenu(data).subscribe((res: any) => {
      if (!res.HasErrors) {

        this.favMenuList = res.FavoriteMenus;
        this.favoriteMenuList = [];
        this.favMenuList.map(item => {
          this.favMenuItems.map((value, index) => {
            if (item.MenuName == value.Menu) {
              this.favoriteMenuList.push(value);
              // this.favMenuItems.splice(index, 1);
            }
          })
        });

        this.favMenuBuffer = false;
        // this.spinner.hide();
        // this.favMenuDisabled = false;
      }
      else {
        this.favMenuBuffer = false;
        // this.spinner.hide();
        // this.favMenuDisabled = false;
      }
    })
  }

  deleteFavMenu(menu: any) {
    let data = {
      employee_Id: this.currentUser.Id,
      MenuName: menu,
    }
    // this.spinner.show();
    // this.favMenuDisabled = true;
    this.favMenuBuffer = true;
    this.clientService.deleteFavMenu(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          // this.spinner.hide();
          // this.favMenuDisabled = false;
          this.favMenuBuffer = false;
          this.getfavoriteMenu();
        }
        else {
          // this.spinner.hide();
          // this.favMenuDisabled = false;
          this.favMenuBuffer = false;
        }
      }
    });
  }

  handleClick(subMenu: any, event: MouseEvent) {
    // this.singleClick = true;
    // setTimeout(() => {
    //   if (this.singleClick) {
    //     this.subMenuOpened(subMenu);
    //     if (subMenu.URL != null && subMenu.URL != undefined && subMenu.URL != '' && subMenu.URL) {
    //       this.menuClicked(subMenu);
    //     }
    //   }
    // }, 300);

    if (subMenu.URL == null && subMenu.ChildMenuList != null && subMenu.ChildMenuList) {
      this.onSubMenuHover(event);
    }
    else if (subMenu.URL != null && subMenu.URL != undefined && subMenu.URL != '' && subMenu.URL) {
      this.subMenuOpened(subMenu);
      this.menuClicked(subMenu);
    }

  }

  handleDoubleClick(event: MouseEvent) {
    // this.singleClick = false;
    // this.onSubMenuHover(event);
  }

  // Method to search menus
  searchMenus(event: any, searchTerm: string) {
    // console.log(searchTerm);
    // console.log(event);
    if (searchTerm && searchTerm != '') {
      this.accordion.openAll();
      let filteredMenus: any = [];
      let parentMenus: any = [];
      let subMenus: any = [];
      let childMenus: any = [];


      this.AllMenuList.map((parentMenu) => {

        if (parentMenu.Menu.toLowerCase().includes(searchTerm.toLowerCase())) {
          if (!filteredMenus.includes(parentMenu)) {
            filteredMenus.push(parentMenu);
          }
          parentMenus.push(parentMenu);
        }

        if (parentMenu.SubmenuList && parentMenu.SubmenuList.length > 0) {
          parentMenu.SubmenuList.map((subMenu: any) => {
            subMenu.selected = false;

            if (subMenu.SubMenuName.toLowerCase().includes(searchTerm.toLowerCase())) {
              if (!filteredMenus.includes(parentMenu)) {
                filteredMenus.push(parentMenu);
              }
              subMenu.selected = true;
              subMenus.push(subMenu);

            }

            if (subMenu.ChildMenuList && subMenu.ChildMenuList.length > 0) {
              subMenu.ChildMenuList.map((childMenu: any) => {
                childMenu.selected = false;
                if (childMenu.ChildMenuName.toLowerCase().includes(searchTerm.toLowerCase())) {
                  if (!filteredMenus.includes(parentMenu)) {
                    filteredMenus.push(parentMenu);
                  }
                  subMenu.selected = true;
                  childMenu.selected = true;
                  childMenus.push(childMenu);
                }
              });

              // if (subMenus.includes(subMenu)) {
              //   subMenu.selected = true;
              // }
            }
          });
        }

      });

      // console.log({ parentMenus: parentMenus, subMenus: subMenus, childMenus: childMenus });
      // console.log(filteredMenus);

      this.sidebarMenuItems = filteredMenus;

    }
    else {
      this.sidebarMenuItems = this.AllMenuList;
      this.allexpansionMenu();
      this.accordion.closeAll();
    }

  }


}