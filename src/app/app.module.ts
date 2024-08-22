import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { StickyNavModule } from 'ng2-sticky-nav';
import { FullCalendarModule } from '@fullcalendar/angular';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxEditorModule } from 'ngx-editor';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgApexchartsModule } from "ng-apexcharts";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxGaugeModule } from 'ngx-gauge';
import { GaugeModule } from 'angular-gauge';
import { NgChartsModule } from 'ng2-charts';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { QuillModule } from 'ngx-quill';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ColorPickerModule } from 'ngx-color-picker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { InternalErrorComponent } from './components/common/internal-error/internal-error.component';
import { ResetPasswordComponent } from './components/authentication/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/authentication/forgot-password/forgot-password.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { SigninSignupComponent } from './components/authentication/signin-signup/signin-signup.component';
import { LogoutComponent } from './components/authentication/logout/logout.component';
import { ConfirmMailComponent } from './components/authentication/confirm-mail/confirm-mail.component';
import { LockScreenComponent } from './components/authentication/lock-screen/lock-screen.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ClientsDetailModule } from './components/clients-detail/clients-detail.module';
import { CompilanceComponent } from './components/compilance/compilance.component';
import { AddCompilanceComponent } from './components/compilance/add-compilance/add-compilance.component';
import { ClientMakerComponent } from './components/client-maker/client-maker.component';
import { DeleteConfirmationDialogComponent } from './shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeletemakerComponent } from './components/client-maker/deletemaker/deletemaker.component';
import { ToastrModule } from 'ngx-toastr';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SessionComponent } from './components/session/session.component';
import { VersioHistoryComponent } from './components/versio-history/versio-history.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { AddMenuComponent } from './components/add-menu/add-menu.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { AssignRoleComponent } from './components/assign-role/assign-role.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AssignMenuRoleComponent } from './components/Admin/assign-menu-role/assign-menu-role.component';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AddDetailComponent } from './components/clients-detail/add-detail/add-detail.component';
import { GroupOfCompaniesComponent } from './components/Master/group-of-companies/group-of-companies.component';
import { CreditAppraisalComponent } from './components/Master/Sales/credit-appraisal/credit-appraisal.component';
import { CreditAppraisalCheckerComponent } from './components/Master/Sales/credit-appraisal-checker/credit-appraisal-checker.component';
import { ApproveRejectComponent } from './shared/components/approve-reject/approve-reject.component';
import { ClientsOfficeComponent } from './components/Master/clients-office/clients-office.component';
import { UsersAndDriversComponent } from './components/users-and-drivers/users-and-drivers.component';
import { CreateUsersAndDriversComponent } from './components/users-and-drivers/create-users-and-drivers/create-users-and-drivers.component';
import { ContactAgreementComponent } from './components/Master/Sales/contact-agreement/contact-agreement.component';
import { CreateContactAgreementComponent } from './components/Master/Sales/contact-agreement/create-contact-agreement/create-contact-agreement.component';
import { ManufacturerComponent } from './components/Master/manufacturer/manufacturer.component';
import { AddManufacturersComponent } from './components/Master/manufacturer/add-manufacturers/add-manufacturers.component';
import { ViewMediaComponent } from './shared/components/view-media/view-media.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MasterDealerComponent } from './components/Master/master-dealer/master-dealer.component';
import { AddDealerComponent } from './components/Master/master-dealer/add-dealer/add-dealer.component';
import { MasterProductsComponent } from './components/Master/master-products/master-products.component';
import { MasterObjectsComponent } from './components/Master/master-objects/master-objects.component';
import { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { CreateRoleComponent } from './components/Admin/create-role/create-role.component';
import { CreateRolePopUpComponent } from './components/assign-role/create-role-pop-up/create-role-pop-up.component';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { DriverExlUpldPopUpComponent } from './components/account-details/driver-exl-upld-pop-up/driver-exl-upld-pop-up.component';
import { AddMenuPopUpComponent } from './components/add-menu/add-menu-pop-up/add-menu-pop-up.component';
import { CdkListboxModule } from '@angular/cdk/listbox';
import { MasterStatesComponent } from './components/Master/master-states/master-states.component';
import { AddStateComponent } from './components/Master/master-states/add-state/add-state.component';
import { ResetUserPasswordComponent } from './components/create-user/reset-user-password/reset-user-password.component';
import { MasterCitiesComponent } from './components/Master/master-cities/master-cities.component';
import { AddCityComponent } from './components/Master/master-cities/add-city/add-city.component';
import { MasterModelComponent } from './components/Master/Fleet/master-model/master-model.component';
import { AddModelComponent } from './components/Master/Fleet/master-model/add-model/add-model.component';
import { MasterVariantComponent } from './components/Master/Fleet/master-variant/master-variant.component';
import { AddVariantComponent } from './components/Master/Fleet/master-variant/add-variant/add-variant.component';
import { CommonPageComponent } from './components/common-page/common-page.component';
import { GOCListComponent } from './components/Master/goclist/goclist.component';
import { MasterAccessoriesComponent } from './components/Master/Fleet/master-accessories/master-accessories.component';
import { SparePartsComponent } from './components/Master/Fleet/spare-parts/spare-parts.component';
import { InsuredValueComponent } from './components/Master/Insurance/insured-value/insured-value.component';
import { ThirdPartyInsComponent } from './components/Master/Insurance/third-party-ins/third-party-ins.component';
import { MasterBudgetComponent } from './components/Master/master-budget/master-budget.component';
import { DealerManufacturerRelnComponent } from './components/Master/dealer-manufacturer-reln/dealer-manufacturer-reln.component';
import { InvoiceTypeComponent } from './components/Master/invoice-type/invoice-type.component';
import { MasterRegionComponent } from './components/Master/master-region/master-region.component';
import { AddInvoiceTypeComponent } from './components/Master/invoice-type/add-invoice-type/add-invoice-type.component';
import { ServiceTaxComponent } from './components/Master/service-tax/service-tax.component';
import { MasterShadesComponent } from './components/Master/Fleet/master-shades/master-shades.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { PendingRequestsComponent } from './components/dashboard/pending-requests/pending-requests.component';
import { RequestApprovalComponent } from './shared/components/request-approval/request-approval.component';
import { WorkFlowComponent } from './components/Admin/work-flow/work-flow.component';
import { ApproverScreenComponent } from './components/Admin/approver-screen/approver-screen.component';
import { ServiceBookingComponent } from './components/service-booking/service-booking.component';
import { ReimbursementComponent } from './components/reimbursement/reimbursement.component';
import { ExpenseClaimComponent } from './components/expense-claim/expense-claim.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    FooterComponent,
    HeaderComponent,
    NotFoundComponent,
    InternalErrorComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    LoginComponent,
    RegisterComponent,
    SigninSignupComponent,
    LogoutComponent,
    ConfirmMailComponent,
    LockScreenComponent,
    MainLayoutComponent,
    CompilanceComponent,
    AddCompilanceComponent,
    ClientMakerComponent,
    DeleteConfirmationDialogComponent,
    DeletemakerComponent,
    SessionComponent,
    VersioHistoryComponent,
    AddMenuComponent,
    AddUserComponent,
    AssignRoleComponent,
    AuthLayoutComponent,
    AssignMenuRoleComponent,
    AddDetailComponent,
    GroupOfCompaniesComponent,
    CreditAppraisalComponent,
    CreditAppraisalCheckerComponent,
    ApproveRejectComponent,
    ClientsOfficeComponent,
    UsersAndDriversComponent,
    CreateUsersAndDriversComponent,
    ContactAgreementComponent,
    CreateContactAgreementComponent,
    ManufacturerComponent,
    AddManufacturersComponent,
    ViewMediaComponent,
    DashboardComponent,
    MasterDealerComponent,
    AddDealerComponent,
    MasterProductsComponent,
    MasterObjectsComponent,
    BreadcrumbComponent,
    CreateUserComponent,
    CreateRoleComponent,
    CreateRolePopUpComponent,
    AccountDetailsComponent,
    DriverExlUpldPopUpComponent,
    AddMenuPopUpComponent,
    MasterStatesComponent,
    AddStateComponent,
    ResetUserPasswordComponent,
    MasterCitiesComponent,
    AddCityComponent,
    MasterModelComponent,
    AddModelComponent,
    MasterVariantComponent,
    AddVariantComponent,
    CommonPageComponent,
    GOCListComponent,
    MasterAccessoriesComponent,
    SparePartsComponent,
    InsuredValueComponent,
    ThirdPartyInsComponent,
    MasterBudgetComponent,
    DealerManufacturerRelnComponent,
    InvoiceTypeComponent,
    MasterRegionComponent,
    AddInvoiceTypeComponent,
    ServiceTaxComponent,
    MasterShadesComponent,
    AuditLogComponent,
    PendingRequestsComponent,
    RequestApprovalComponent,
    WorkFlowComponent,
    ApproverScreenComponent,
    ServiceBookingComponent,
    ReimbursementComponent,
    ExpenseClaimComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    NgApexchartsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    NgScrollbarModule,
    StickyNavModule,
    FormsModule,
    FullCalendarModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CarouselModule,
    NgxEditorModule,
    DragDropModule,
    HttpClientModule,
    CdkAccordionModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NgxGaugeModule,
    GaugeModule.forRoot(),
    NgChartsModule,
    NgxMatTimepickerModule,
    QuillModule.forRoot(),
    NgxDropzoneModule,
    ColorPickerModule,
    ToastrModule.forRoot(),
    NgOtpInputModule,
    MatGridListModule,
    CommonModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    NgSelectModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    CdkListboxModule,
  ],
  providers: [
    DatePipe,
    provideToastr({
      closeButton: true,
      preventDuplicates: true,
    }),
    provideAnimations(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }