import { Component, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../client.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})

export class AuditLogComponent {
  versionHistoryList: any[] = [];
  clientId: 0;
  selecetdClientData: any;
  recordName: any;
  moduleName: any;

  mainThemeClass = '';
  localTheme: any;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  displayedColumns: string[] = ['Column Name', 'Old Value', 'New Value', 'Updated By', 'updated On'];
  @ViewChild('versionTableList') versionTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  selectedRowIndex: any;

  constructor(
    protected commonService: CommonService,
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    public location: Location,
  ) {
    if (history.state) {
      console.log(history.state);

      this.clientId = history.state.id;
      this.recordName = history.state.Name;
      this.moduleName = history.state.moduleName;
      this.getVesrionHistory();
    }
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
  }

  getVesrionHistory() {

    let data = {
      Page: {
        PageNumber: this.PageNumber,
        PageSize: this.PageSize,
        Filter: {
          PrimeryId: this.clientId,
          Screen: this.moduleName,
          IsSearch: true,
          ColumnName: null,
          UpdatedBy: null,
          UpdatedOn: null,
          TableName: "",
        }
      }
    };

    this.spinner.show();
    this.clientService.getClientVersionHistory(data).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.versionHistoryList = res.Records;
          this.totalRecords = res.TotalCount;
          this.selectedRowIndex = null;
          this.versionHistoryList.map((item, index) => {
            item.position = index;
          });
          this.spinner.hide();
        }
        else if (res.Exception) {
          this.toaster.error('Unable to fetch version history', undefined, {
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
    })


  }

  pageChange(event: any) {
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    this.getVesrionHistory();
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
    this.getVesrionHistory();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.versionHistoryList = this.commonService.customSort(this.versionHistoryList, sortState.active, sortState.direction);
      this.versionTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getVesrionHistory();
  }
}