import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../client.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var settings: any;
interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-common-page',
  templateUrl: './common-page.component.html',
  styleUrls: ['./common-page.component.scss']
})
export class CommonPageComponent {
  @ViewChild('iframe') iframe: ElementRef;

  IFrameBaseUrl = settings.IFrameBaseUrl;
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }
  aspxURL: SafeResourceUrl;
  data: any;
  pageUrl: any;

  constructor(
    public dialog: MatDialog,
    protected commonService: CommonService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer
  ) {
    this.sanitizer = sanitizer;

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

    this.commonService.aspxURL.subscribe(res => {
      if (res) {
        if (res.status) {
          history.state.aspxURL = res.url;
          this.pageUrl = res.url;

          this.RedirectToIframe(res.url);
          let defaultLevel = [0, 0, 0, 0, 0]
          // if (res.url && res.url != '' && res.level && res.level != defaultLevel) {
          //   history.state.aspxURL = res.url;
          //   this.pageUrl = res.url;
          //   this.RedirectToIframe(res.url, res.level);
          // }
        }
      }
    })

    if (!this.pageUrl && history.state.aspxURL) {
      this.RedirectToIframe(history.state.aspxURL, history.state.level);
    }

  }

  RedirectToIframe(url: any, level?: any) {
    // let obj = {
    //   username: this.currentUser.Name,
    //   url: url,
    //   userid: this.currentUser.UserId,
    //   role: this.currentUser.UserRole,
    // }
    let data = {
      username: "varun.shukla",
      url: url,
      userid: "0B85A0E5-D116-4470-8A24-00A9DF25AC52",
      role: "Application Admin",
    }
    let URL = this.IFrameBaseUrl + JSON.stringify(data);
    this.aspxURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL);
  }

  ngOnDestroy() {
    window.location.reload();
    this.commonService.aspxURL.next({ status: false, url: '' });
  }
}
