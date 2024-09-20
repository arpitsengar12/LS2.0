import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmMailComponent } from './components/authentication/confirm-mail/confirm-mail.component';
import { ForgotPasswordComponent } from './components/authentication/forgot-password/forgot-password.component';
import { LockScreenComponent } from './components/authentication/lock-screen/lock-screen.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { LogoutComponent } from './components/authentication/logout/logout.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { ResetPasswordComponent } from './components/authentication/reset-password/reset-password.component';
import { SigninSignupComponent } from './components/authentication/signin-signup/signin-signup.component';
import { InternalErrorComponent } from './components/common/internal-error/internal-error.component';
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AddDetailComponent } from './components/clients-detail/add-detail/add-detail.component';
import { CompilanceComponent } from './components/compilance/compilance.component';
import { ClientMakerComponent } from './components/client-maker/client-maker.component';
import { SessionComponent } from './components/session/session.component';
import { AddMenuComponent } from './components/add-menu/add-menu.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { AssignRoleComponent } from './components/assign-role/assign-role.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AuthGuard } from './components/core/guard/auth.guard';
import { AssignMenuRoleComponent } from './components/Admin/assign-menu-role/assign-menu-role.component';
import { VersioHistoryComponent } from './components/versio-history/versio-history.component';
import { GroupOfCompaniesComponent } from './components/Master/group-of-companies/group-of-companies.component';
import { CreditAppraisalComponent } from './components/Master/Sales/credit-appraisal/credit-appraisal.component';
import { CreditAppraisalCheckerComponent } from './components/Master/Sales/credit-appraisal-checker/credit-appraisal-checker.component';
import { ClientsOfficeComponent } from './components/Master/clients-office/clients-office.component';
import { UsersAndDriversComponent } from './components/users-and-drivers/users-and-drivers.component';
import { CreateUsersAndDriversComponent } from './components/users-and-drivers/create-users-and-drivers/create-users-and-drivers.component';
import { ContactAgreementComponent } from './components/Master/Sales/contact-agreement/contact-agreement.component';
import { CreateContactAgreementComponent } from './components/Master/Sales/contact-agreement/create-contact-agreement/create-contact-agreement.component';
import { ManufacturerComponent } from './components/Master/manufacturer/manufacturer.component';
import { AddManufacturersComponent } from './components/Master/manufacturer/add-manufacturers/add-manufacturers.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MasterDealerComponent } from './components/Master/master-dealer/master-dealer.component';
import { AddDealerComponent } from './components/Master/master-dealer/add-dealer/add-dealer.component';
import { MasterObjectsComponent } from './components/Master/master-objects/master-objects.component';
import { MasterProductsComponent } from './components/Master/master-products/master-products.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { CreateRoleComponent } from './components/Admin/create-role/create-role.component';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { MasterStatesComponent } from './components/Master/master-states/master-states.component';
import { AddStateComponent } from './components/Master/master-states/add-state/add-state.component';
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
import { WorkFlowComponent } from './components/Admin/work-flow/work-flow.component';
import { ApproverScreenComponent } from './components/Admin/approver-screen/approver-screen.component';
import { ServiceBookingComponent } from './components/service-booking/service-booking.component';
import { ReimbursementComponent } from './components/reimbursement/reimbursement.component';
import { ExpenseClaimComponent } from './components/expense-claim/expense-claim.component';
import { GstoverheadinvoiceComponent } from './components/gstoverheadinvoice/gstoverheadinvoice.component';
import { QuotationComponent } from './components/quotation/quotation.component';
import { FinanceleaseComponent } from './components/financelease/financelease.component';
import { OperationleaseComponent } from './components/operationlease/operationlease.component';
import { FlsalesandleasebackComponent } from './components/flsalesandleaseback/flsalesandleaseback.component';
import { ManagmentonlyComponent } from './components/managmentonly/managmentonly.component';
const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      // { path: '', redirectTo: 'authentication/login', pathMatch: 'full' },
      { path: '', component: LoginComponent, data: { breadcrumb: 'Login' } },
      { path: 'authentication/forgot-password', component: ForgotPasswordComponent, data: { breadcrumb: 'Forgot Password' } },
      { path: 'authentication/reset-password', component: ResetPasswordComponent, data: { breadcrumb: 'Reset Password' } },
    ]
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: DashboardComponent, data: { breadcrumb: 'Home' } },
      { path: 'error-500', component: InternalErrorComponent, data: { breadcrumb: 'Page Not Found' } },
      { path: 'common-page', component: CommonPageComponent, data: { breadcrumb: 'LeaseSoft' } },
      { path: 'version-history', component: VersioHistoryComponent, data: { breadcrumb: 'Version History' } },
      { path: 'audit-log', component: AuditLogComponent, data: { breadcrumb: 'Version History' } },
      { path: 'workflow', component: WorkFlowComponent, data: { breadcrumb: 'Workflow' } },
      { path: 'approver-screen', component: ApproverScreenComponent, data: { breadcrumb: '' } },
      { path: 'add-client-detail', component: AddDetailComponent, data: { breadcrumb: 'Client Form' } },
      { path: 'compliance', component: CompilanceComponent, data: { breadcrumb: 'Compliance' } },
      { path: 'clientMaker', component: ClientMakerComponent, data: { breadcrumb: 'All Client' } },
      { path: 'account-details', component: AccountDetailsComponent, data: { breadcrumb: 'Account Details' } },
      { path: 'session', component: SessionComponent, data: { breadcrumb: 'Session' } },
      { path: 'add-menu', component: AddMenuComponent, data: { breadcrumb: 'Add Menu' } },
      { path: 'users-list', component: CreateUserComponent, data: { breadcrumb: 'All Users' } },
      { path: 'add-user', component: AddUserComponent, data: { breadcrumb: 'Create User' } },
      { path: 'create-role', component: CreateRoleComponent, data: { breadcrumb: 'Create Role' } },
      { path: 'assign-role', component: AssignRoleComponent, data: { breadcrumb: 'Assign Roles' } },
      { path: 'assign-menu-role', component: AssignMenuRoleComponent, data: { breadcrumb: 'Assign Menus For Roles' } },
      { path: 'GocListView', component: GOCListComponent, data: { breadcrumb: 'Group Of Companies' } },
      { path: 'group-of-companies', component: GroupOfCompaniesComponent, data: { breadcrumb: 'Group Of Companies Form' } },
      { path: 'credit-appraisal', component: CreditAppraisalComponent, data: { breadcrumb: 'Credit Appraisal' } },
      { path: 'credit-appraisal-checker', component: CreditAppraisalCheckerComponent, data: { breadcrumb: 'Credit Appraisal Checker' } },
      { path: 'client-office', component: ClientsOfficeComponent, data: { breadcrumb: "Client's Office" } },
      { path: 'usersAndDrivers', component: UsersAndDriversComponent, data: { breadcrumb: 'User & Driver' } },
      { path: 'create-usersAndDrivers', component: CreateUsersAndDriversComponent, data: { breadcrumb: 'User & Driver Form' } },
      { path: 'contract-agreement', component: ContactAgreementComponent, data: { breadcrumb: 'Contract Agreement' } },
      { path: 'create-contract-agreement', component: CreateContactAgreementComponent, data: { breadcrumb: 'Contact Agreement Form' } },
      { path: 'manufacturers', component: ManufacturerComponent, data: { breadcrumb: 'Manufacturers' } },
      { path: 'add-manufacturers', component: AddManufacturersComponent, data: { breadcrumb: 'Manufacturer Form' } },
      { path: 'master-dealers', component: MasterDealerComponent, data: { breadcrumb: 'Dealers' } },
      { path: 'add-masterDealer', component: AddDealerComponent, data: { breadcrumb: 'Dealer Form' } },
      { path: 'master-Objects', component: MasterObjectsComponent, data: { breadcrumb: 'Object Type' } },
      { path: 'master-Products', component: MasterProductsComponent, data: { breadcrumb: 'Product' } },
      { path: 'master-states', component: MasterStatesComponent, data: { breadcrumb: 'States' } },
      { path: 'add-state', component: AddStateComponent, data: { breadcrumb: 'State Form' } },
      { path: 'master-city', component: MasterCitiesComponent, data: { breadcrumb: 'Cities' } },
      { path: 'add-city', component: AddCityComponent, data: { breadcrumb: 'City Form' } },
      { path: 'master-model', component: MasterModelComponent, data: { breadcrumb: 'Models' } },
      { path: 'add-model', component: AddModelComponent, data: { breadcrumb: 'Model Form' } },
      { path: 'master-variant', component: MasterVariantComponent, data: { breadcrumb: 'Variants' } },
      { path: 'add-variant', component: AddVariantComponent, data: { breadcrumb: 'Variants Form' } },
      { path: 'master-accessories', component: MasterAccessoriesComponent, data: { breadcrumb: 'Accessories' } },
      { path: 'master-spareParts', component: SparePartsComponent, data: { breadcrumb: 'Spare Parts' } },
      { path: 'insured-declared-value', component: InsuredValueComponent, data: { breadcrumb: 'Insured Declared Value' } },
      { path: 'third-party-insurance', component: ThirdPartyInsComponent, data: { breadcrumb: 'Third Party Premium Table' } },
      { path: 'master-budget', component: MasterBudgetComponent, data: { breadcrumb: 'Budget' } },
      { path: 'dealer-manufacturer-relation', component: DealerManufacturerRelnComponent, data: { breadcrumb: 'Dealer Manufacturer Relation' } },
      { path: 'invoice-type', component: InvoiceTypeComponent, data: { breadcrumb: 'Invoice Type' } },
      { path: 'add-invoice-type', component: AddInvoiceTypeComponent, data: { breadcrumb: 'Invoice Type Form' } },
      { path: 'master-region', component: MasterRegionComponent, data: { breadcrumb: 'Region' } },
      { path: 'master-serviceTax', component: ServiceTaxComponent, data: { breadcrumb: 'Service Tax Master' } },
      { path: 'master-shades', component: MasterShadesComponent, data: { breadcrumb: 'Shade Master' } },
      { path: 'pending-requests', component: PendingRequestsComponent, data: { breadcrumb: 'Notification' } },
      {path: 'service-booking', component: ServiceBookingComponent, data:{breadcrumb:'Service Booking'} },
      {path: 'reimbursement', component: ReimbursementComponent, data:{breadcrumb:'reimbursement'} },
      {path: 'expenseclaimss', component: ExpenseClaimComponent, data:{breadcrumb:'expense-claim'} },
      {path: 'gstoverheadinvoice', component: GstoverheadinvoiceComponent, data:{breadcrumb:'gst-overhead-invoice'} },
      {path:'quotationinvoice', component:QuotationComponent,data:{breadcrumb:'quotationinvoice'}},
      {path:'financelease', component:FinanceleaseComponent,data:{breadcrumb:'financelease'}},
      {path:'operationlease', component:OperationleaseComponent,data:{breadcrumb:'operationlease'}},
      {path:'flsalesandleaseback', component:FlsalesandleasebackComponent,data:{breadcrumb:'flsalesandleaseback'}},
      {path:'managementonly', component:ManagmentonlyComponent,data:{breadcrumb:'managementonly'}},
       
    ],
  },
  { path: 'authentication/forgot-password', component: ForgotPasswordComponent },
  { path: 'authentication/reset-password', component: ResetPasswordComponent },
  { path: 'authentication/login', component: LoginComponent },
  { path: 'authentication/register', component: RegisterComponent },
  { path: 'authentication/signin-signup', component: SigninSignupComponent },
  { path: 'authentication/logout', component: LogoutComponent },
  { path: 'authentication/confirm-mail', component: ConfirmMailComponent },
  { path: 'authentication/lock-screen', component: LockScreenComponent },
  // Here add new pages component

  { path: '**', component: NotFoundComponent } // This line will remain down from the whole pages component list
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    useHash: true,
    //onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }