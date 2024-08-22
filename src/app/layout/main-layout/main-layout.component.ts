import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ToggleService } from 'src/app/shared/header/toggle.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent   {
  isToggled = false;
  mainThemeClass = '';
  localTheme: any;
  isHome = false;
  constructor(
    public router: Router,
    private toggleService: ToggleService,
    protected commonService: CommonService,
    
  ) {

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);

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

    this.toggleService.isToggled$.subscribe(isToggled => {
      this.isToggled = isToggled;
    });

    // this.router.navigate(["/session"])
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   // throw new Error('Method not implemented.');
  //   const currentRoute = this.router.url;
  //   if (currentRoute === "/" || currentRoute === "/#/") {
  //     this.isHome = true;
  //   }
  //   else {
  //     this.isHome = false
  //   }
  // }

  // ngOnInit() {
  //   const currentRoute = this.router.url;
  //   if (currentRoute === "/" || currentRoute === "/#/") {
  //     this.isHome = true;
  //   }
  //   else {
  //     this.isHome = false
  //   }
  // }

  // ngOnChange(){
  //   const currentRoute = this.router.url;
  //   if (currentRoute === "/" || currentRoute === "/#/") {
  //     this.isHome = true;
  //   }
  //   else {
  //     this.isHome = false
  //   }
  // }
}
