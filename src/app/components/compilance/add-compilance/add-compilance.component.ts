import { Component, Inject } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../../client.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
var $event: any;
@Component({
  selector: 'app-add-compilance',
  templateUrl: './add-compilance.component.html',
  styleUrls: ['./add-compilance.component.scss']
})
export class AddCompilanceComponent {
  addComplianceForm!: FormGroup;
  submitted: boolean = false;
  isaddedToAvailable: boolean = false;
  isaddedToChosen: boolean = false;
  complianceMode: string = 'Add';
  selectedCompliance: any[] = [];
  mainThemeClass = '';
  localTheme: any;
  complianceTypeIdArray: number[] = [];
  isEdit: boolean = false;
  editCompliance: any;
  AllComplianceList: any;
  availableComplianceList: any[] = [];
  tableNameList: any;
  columnNameList: any;
  currentUser: any;
  columnTypeList: any;

  fieldLabelList: any;

  chosenComplianceList: any[] = [];
  CompilanceArray: any[] = [];
  compliancetype: any;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddCompilanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected commonService: CommonService,
    private clientService: ClientService,
    private toaster: ToastrService,
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

    this.addComplianceForm = new FormGroup({
      tableName: new FormControl(null, [Validators.required]),
      columnName: new FormControl(null, [Validators.required]),
      columnType: new FormControl(null, [Validators.required]),
      fieldLabel: new FormControl(null, [Validators.required]),
    });
    this.addComplianceForm.markAllAsTouched();
    this.getComplianceList();
    this.getTableNames();
    this.fieldLabelList = ['Name', 'Email', 'Phone', "PAN"];
  }

  getComplianceList() {
    this.spinner.show();
    this.clientService.getComplianceList().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.AllComplianceList = res.Rows;
          this.availableComplianceList = res.Rows;
          this.ModeOfCompliance();
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

  getTableNames() {
    const data =
      { Page: { PageNumber: 0, PageSize: 0 } }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getTableNames(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.tableNameList = res.Records;
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

  getColumnNames() {
    const data =
    {
      Page: {
        PageNumber: 0, PageSize: 0,
        Filter: {
          Search: this.addComplianceForm.value.tableName,
        }
      }
    }

    let formData: FormData = new FormData();
    formData.append("RequestData", JSON.stringify(data));

    this.spinner.show();
    this.clientService.getColumnNames(formData).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.columnNameList = res.Records;
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

  getColumnType(event: any) {
    if (event) {
      this.columnTypeList = [];
      this.columnTypeList.push(event);
      this.addComplianceForm.get('columnType')?.setValue(this.columnTypeList[0].ColumnType);
    }
  }

  ModeOfCompliance() {
    if (this.data.mode === 'add') {
      this.complianceMode = 'Add';

    }
    else if (this.data.mode === 'edit') {
      this.complianceMode = 'Edit';
      this.isEdit = true;
      let element = this.data.element;
      this.editCompliance = this.data.element;

      this.chosenComplianceList = [];
      this.complianceTypeIdArray = [];
      if (element.CompilanceArray) {
        this.CompilanceArray = element.CompilanceArray;
        this.CompilanceArray.map((item => {
          this.AllComplianceList.map((value: any) => {
            if (item == value.Type) {
              this.compliancetype = { Type: item, Id: value.Id };
              this.complianceTypeIdArray.push(value.Id);
              this.chosenComplianceList.push(this.compliancetype);
            }
          })
        }));
      }

      for (let i = 0; i < this.chosenComplianceList.length; i++) {
        for (let j = 0; j < this.availableComplianceList.length; j++) {
          if (this.chosenComplianceList[i].Type == this.availableComplianceList[j].Type) {
            this.availableComplianceList.splice(j, 1);
          }
        }
      }

      // this.fieldLabelList.unshift(element.LabelName);
      this.addComplianceForm.get('tableName')?.setValue(element.TableName);
      this.getColumnNames();
      if (!this.fieldLabelList.some((item: any) => item === element.LabelName)) {
        this.fieldLabelList.unshift(element.LabelName);
      }
      this.addComplianceForm.get('columnName')?.setValue(element.ColumnName);
      this.addComplianceForm.get('fieldLabel')?.setValue(element.LabelName);
      this.addComplianceForm.get('columnType')?.setValue(element.ColumnType);
      // this.addComplianceForm.get('tableName')?.disable();
      // this.addComplianceForm.get('columnName')?.disable();
    }
  }

  updateSelection(event: any, selectedItem: any) {
    let element: any = event.target;
    let parentElement: any = element.parentElement;
    let parent: any = parentElement.parentElement
    let firstChild: any = parent.firstChild;
    if (firstChild.innerText == 'Chosen :') {
      this.isaddedToAvailable = true;
    }
    else if (firstChild.innerText == 'Available :') {
      this.isaddedToChosen = true;
    }

    event.target.classList.add("text-dark");

    if (!this.selectedCompliance.some(element => element.Type === selectedItem.Type)) {
      this.selectedCompliance.push(selectedItem);
    }

    // this.availableComplianceList.forEach((item) => {
    //   if (item == selectedItem) {
    //     item.selected = true;
    //   }
    // });

  }

  addtoChosen() {
    if (this.isaddedToChosen) {
      this.selectedCompliance.map((item => {
        if (!this.chosenComplianceList.some(element => element.Type === item.Type)) {
          this.chosenComplianceList.unshift(item);
          this.complianceTypeIdArray.push(item.Id);
        }
      }));

      for (let i = 0; i < this.selectedCompliance.length; i++) {
        for (let j = 0; j < this.availableComplianceList.length; j++) {
          if (this.selectedCompliance[i].Type == this.availableComplianceList[j].Type) {
            this.availableComplianceList.splice(j, 1);
          }
        }
      }
      this.selectedCompliance = [];
      this.isaddedToChosen = false;
    }
  }

  chosentoAvailable() {
    if (this.isaddedToAvailable) {
      this.complianceTypeIdArray = [];

      this.selectedCompliance.map((item => {
        if (!this.availableComplianceList.some((element) => element.Type === item.Type)) {
          this.availableComplianceList.unshift(item);
        }
      }));

      for (let i = 0; i < this.selectedCompliance.length; i++) {
        for (let j = 0; j < this.chosenComplianceList.length; j++) {
          if (this.selectedCompliance[i].Type == this.chosenComplianceList[j].Type) {
            this.chosenComplianceList.splice(j, 1);
          }
        }
      }

      this.chosenComplianceList.map((item => {
        this.complianceTypeIdArray.push(item.Id);
      }))

      this.selectedCompliance = [];
      this.isaddedToAvailable = false;
    }
  }

  close() {
    this.dialogRef.close();
  }

  addCompliance() {
    this.submitted = true;
    if (this.addComplianceForm.status == "VALID" && this.complianceTypeIdArray.length !== 0) {
      let data = {
        CompilanceTypeArray: this.complianceTypeIdArray,
        TableName: this.addComplianceForm.value.tableName,
        ColumnName: this.addComplianceForm.value.columnName,
        Description: "",
        LabelName: this.addComplianceForm.value.fieldLabel,
        CreatedById: this.currentUser.UserId
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.AddComplianceconfig(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Compliance added successfully!", undefined, {
              positionClass: 'toast-top-center'
            });
            this.dialogRef.close(true);
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

  updateCompliance() {
    this.submitted = true;
    if (this.complianceTypeIdArray.length !== 0) {
      let data = {
        CompilanceTypeArray: this.complianceTypeIdArray,
        GetTableName: this.editCompliance.TableName,
        GetColumnName: this.editCompliance.ColumnName,
        Description: "",
        LabelName: this.addComplianceForm.value.fieldLabel,
        ModifiedById: this.currentUser.UserId,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.UpdateComplianceconfig(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Compliance updated successfully!", undefined, {
              positionClass: 'toast-top-center'
            });
            this.dialogRef.close(true);
            this.spinner.hide();
          }
          else {
            this.toaster.error(res?.Errors[0]?.Message, undefined, {
              positionClass: 'toast-top-center'
            });
          }
          this.spinner.hide();
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
}
