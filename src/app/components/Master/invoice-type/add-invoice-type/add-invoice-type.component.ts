import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/components/client.service';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';
import { MatDialog } from '@angular/material/dialog';

interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-invoice-type',
  templateUrl: './add-invoice-type.component.html',
  styleUrls: ['./add-invoice-type.component.scss']
})

export class AddInvoiceTypeComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;

  invoiceTypeForm!: FormGroup;
  submitted: boolean = false;
  isView: boolean = false;
  editMode: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  selectedInvTypeData: any;
  InvoiceTypeId: number = 0;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;

  constructor(
    private clientService: ClientService,
    protected commonService: CommonService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public location: Location,
    public dialog: MatDialog,
  ) {

    this.commonService.updateTheme.subscribe(res => {

      if (res) {
        this.mainThemeClass = res;
      }

    });

    this.commonService.updateThemeMode.subscribe(res => {
      if (res) {
        if (res == 'dark-theme') {
          this.darkThemeMode = true;
        }
        else {
          this.darkThemeMode = false;
        }
      }
      else {
        this.darkThemeMode = false;
      }
    });

    this.localTheme = JSON.parse(sessionStorage.getItem('theme')!);
    this.currentUser = JSON.parse(sessionStorage.getItem('user')!);
    this.localTheme ? this.localTheme.themeMode ? (this.localTheme.themeMode == 'dark-theme' ? this.darkThemeMode = true : this.darkThemeMode = false) : '' : '';

    if (this.localTheme == null || this.localTheme == '') {
      this.mainThemeClass = 'default-blue-colored-theme';
    }
    else {
      this.mainThemeClass = this.localTheme.themeClass;
    }

    if (history.state.level) {
      this.IsAuditTrail = history.state.IsAuditTrail;
      this.TransactionId = history.state.TransactionId;
      this.InvoiceTypeId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.IsApproverView = false;
        this.editMode = false;
        this.getInvoiceById();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.IsApproverView = false;
        this.isView = false;
        this.getInvoiceById();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getInvoiceById();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    }
    this.invoiceTypeForm = new FormGroup({
      invoiceType: new FormControl('', Validators.required),
      invoiceCode: new FormControl(''),
      lastInvNumber: new FormControl('', Validators.pattern(Constant.IntNo)),
      isDormant: new FormControl(false),
      isVAT: new FormControl(false),
      isSTAX: new FormControl(false),
      incomeGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      expenseGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      chargebackGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      advanceGLCode: new FormControl('', Validators.pattern(Constant.IntNo)),
      chargebackGLCodeFL: new FormControl('', Validators.pattern(Constant.IntNo)),
      isOverhead: new FormControl(false),
      tdsSection: new FormControl(''),
      tdsCode: new FormControl(''),
      tdsPer: new FormControl('', Validators.pattern(Constant.decimalNo)),
      isReimburse: new FormControl(false),
    });

    this.invoiceTypeForm.markAllAsTouched();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Invoice Type';
      this.breadcrumbService.setBreadcrumbs(['Master / Invoice Type', breadcrumb]);
    });
  }

  get validators() {
    return this.invoiceTypeForm.controls;
  }

  getInvoiceById() {
    this.spinner.show();
    this.clientService.getInvoiceTypeById(this.InvoiceTypeId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selectedInvTypeData = res;
          this.InvoiceTypeId = res.Id;
          this.invoiceTypeForm.reset(defaultValues);
          if (this.isView || this.IsApproverView) {
            this.invoiceTypeForm.disable();

          }
          if (this.editMode) {
            this.invoiceTypeForm.get('lastInvNumber')?.setValidators(Validators.pattern(Constant.IntNoSpChar));
            this.invoiceTypeForm.get('incomeGLCode')?.setValidators(Validators.pattern(Constant.IntNoSpChar));
            this.invoiceTypeForm.get('expenseGLCode')?.setValidators(Validators.pattern(Constant.IntNoSpChar));
            this.invoiceTypeForm.get('chargebackGLCode')?.setValidators(Validators.pattern(Constant.IntNoSpChar));
            this.invoiceTypeForm.get('advanceGLCode')?.setValidators(Validators.pattern(Constant.IntNoSpChar));
            this.invoiceTypeForm.get('chargebackGLCodeFL')?.setValidators(Validators.pattern(Constant.IntNoSpChar));
          } else {

            this.invoiceTypeForm.get('lastInvNumber')?.setValidators(Validators.pattern(Constant.IntNo));
            this.invoiceTypeForm.get('incomeGLCode')?.setValidators(Validators.pattern(Constant.IntNo));
            this.invoiceTypeForm.get('expenseGLCode')?.setValidators(Validators.pattern(Constant.IntNo));
            this.invoiceTypeForm.get('chargebackGLCode')?.setValidators(Validators.pattern(Constant.IntNo));
            this.invoiceTypeForm.get('advanceGLCode')?.setValidators(Validators.pattern(Constant.IntNo));
            this.invoiceTypeForm.get('chargebackGLCodeFL')?.setValidators(Validators.pattern(Constant.IntNo));
          }
          // To apply the new validators, you need to update the form control's value
          this.invoiceTypeForm.updateValueAndValidity();

          this.invoiceTypeForm.patchValue({
            invoiceType: this.selectedInvTypeData.InvoiceType,
            invoiceCode: this.selectedInvTypeData.InvoiceCode,
            lastInvNumber: this.selectedInvTypeData.LastInvoiceNo,
            isDormant: this.selectedInvTypeData.Dormant,
            isVAT: this.selectedInvTypeData.IsVat,
            isSTAX: this.selectedInvTypeData.IsSTax,
            incomeGLCode: this.selectedInvTypeData.IncomeGLCode,
            expenseGLCode: this.selectedInvTypeData.ExpenseGLCode,
            chargebackGLCode: this.selectedInvTypeData.ChargebackGLCode,
            advanceGLCode: this.selectedInvTypeData.AdvanceGLCODE,
            chargebackGLCodeFL: this.selectedInvTypeData.ChargebackGLCodeFL,
            isOverhead: this.selectedInvTypeData.ISOverHead == 1 ? true : false,
            tdsSection: this.selectedInvTypeData.TDSSection,
            tdsCode: this.selectedInvTypeData.TDSCode,
            tdsPer: this.selectedInvTypeData.TDSPer,
            isReimburse: this.selectedInvTypeData.Reimburse == 1 ? true : false,
          });
          this.invoiceTypeForm.markAllAsTouched();
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

  addInvoiceType() {
    this.submitted = true;
    if (this.invoiceTypeForm.status == "VALID") {
      let data = {
        CreatedById: this.currentUser.UserId,

        InvoiceType: this.invoiceTypeForm.value.invoiceType,
        InvoiceCode: this.invoiceTypeForm.value.invoiceCode,
        LastInvoiceNo: this.invoiceTypeForm.value.lastInvNumber,
        Dormant: this.invoiceTypeForm.value.isDormant,
        IsVat: this.invoiceTypeForm.value.isVAT,
        IsSTax: this.invoiceTypeForm.value.isSTAX,
        IncomeGLCode: this.invoiceTypeForm.value.incomeGLCode,
        ExpenseGLCode: this.invoiceTypeForm.value.expenseGLCode,
        ChargebackGLCode: this.invoiceTypeForm.value.chargebackGLCode,
        AdvanceGLCODE: this.invoiceTypeForm.value.advanceGLCode,
        ChargebackGLCodeFL: this.invoiceTypeForm.value.chargebackGLCodeFL,
        ISOverHead: this.invoiceTypeForm.value.isOverhead == true ? 1 : 0,
        TDSSection: this.invoiceTypeForm.value.tdsSection,
        TDSCode: this.invoiceTypeForm.value.tdsCode,
        TDSPer: this.invoiceTypeForm.value.tdsPer ? parseFloat(this.invoiceTypeForm.value.tdsPer) : 0.0,
        Reimburse: this.invoiceTypeForm.value.isReimburse == true ? 1 : 0,
      }

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(data));

      this.spinner.show();
      this.clientService.addInvoiceType(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Invoice type added successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/invoice-type"], {
              state: {
                level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
              }
            });
            this.resetForm();

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

  updateInvoiceType() {
    this.submitted = true;
    if (this.invoiceTypeForm.status == "VALID") {
      // let data = {
      //   Id: this.InvoiceTypeId,
      //   ModifiedById: this.currentUser.UserId,

      // }
      this.selectedInvTypeData.ModifiedById = this.currentUser.UserId;
      this.selectedInvTypeData.InvoiceType = this.invoiceTypeForm.value.invoiceType;
      this.selectedInvTypeData.InvoiceCode = this.invoiceTypeForm.value.invoiceCode;
      this.selectedInvTypeData.LastInvoiceNo = this.invoiceTypeForm.value.lastInvNumber;
      this.selectedInvTypeData.Dormant = this.invoiceTypeForm.value.isDormant;
      this.selectedInvTypeData.IsVat = this.invoiceTypeForm.value.isVAT;
      this.selectedInvTypeData.IsSTax = this.invoiceTypeForm.value.isSTAX;
      this.selectedInvTypeData.IncomeGLCode = this.invoiceTypeForm.value.incomeGLCode;
      this.selectedInvTypeData.ExpenseGLCode = this.invoiceTypeForm.value.expenseGLCode;
      this.selectedInvTypeData.ChargebackGLCode = this.invoiceTypeForm.value.chargebackGLCode;
      this.selectedInvTypeData.AdvanceGLCODE = this.invoiceTypeForm.value.advanceGLCode;
      this.selectedInvTypeData.ChargebackGLCodeFL = this.invoiceTypeForm.value.chargebackGLCodeFL;
      this.selectedInvTypeData.ISOverHead = this.invoiceTypeForm.value.isOverhead == true ? 1 : 0;
      this.selectedInvTypeData.TDSSection = this.invoiceTypeForm.value.tdsSection;
      this.selectedInvTypeData.TDSCode = this.invoiceTypeForm.value.tdsCode;
      this.selectedInvTypeData.TDSPer = this.invoiceTypeForm.value.tdsPer ? parseFloat(this.invoiceTypeForm.value.tdsPer) : 0.0,
        this.selectedInvTypeData.Reimburse = this.invoiceTypeForm.value.isReimburse == true ? 1 : 0;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selectedInvTypeData));

      this.spinner.show();
      this.clientService.updateInvoiceType(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success('Invoice type updated successfully', undefined, {
              positionClass: 'toast-top-center'
            });
            this.router.navigate(["/invoice-type"], {
              state: {
                level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
              }
            });
            this.resetForm();

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


  resetForm() {
    this.submitted = false;
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.invoiceTypeForm.reset(defaultValues);
  }

  // Scroll to the top-left corner of the page
  scrollToTop() {
    window.scrollTo(0, 0);
  }


  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.InvoiceTypeId, Name: this.selectedInvTypeData.Name, moduleName: 'add-invoice-type' }
    });
  }

  approveRequest() {
    this.approveRejectDialog('Approved')
  }

  rejectRequest() {
    this.approveRejectDialog('Rejected')
  }

  approveRejectDialog(status: any) {
    let dialogRef = this.dialog.open(RequestApprovalComponent, {
      width: '700px',
      height: '200px',
      data: { mode: status, data: { Id: null, workflowId: this.TransactionId } },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.spinner.hide();
        this.router.navigate([`/pending-requests`], {
          state: { level: this.AccessLevel }
        });
      }
    });
  }
}


let defaultValues = {
  invoiceType: '',
  invoiceCode: '',
  lastInvNumber: '',
  isDormant: false,
  isVAT: false,
  isSTAX: false,
  incomeGLCode: '',
  expenseGLCode: '',
  chargebackGLCode: '',
  advanceGLCode: '',
  chargebackGLCodeFL: '',
  isOverhead: false,
  tdsSection: '',
  tdsCode: '',
  tdsPer: '',
  isReimburse: false,
}