import { Injectable } from '@angular/core';
import { DataService } from './core/http/data.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private dataService: DataService) { }

  loginWithCredentials(data: any) {
    return this.dataService.postDataLogin("security/Login", data);
  }

  loginWithOTP(data: any) {
    return this.dataService.postDataLogin("security/VerifyOTP", data);
  }

  loginWithFirebase(data: any) {
    return this.dataService.postDataLoginFirebase("security/FirebaseLogin", data);
  }

  forgetPassword(data: any) {
    return this.dataService.postFormData("security/ForgotPassword", data);
  }

  getDashboardSalesData(data: any) {
    return this.dataService.postFormData("", data);
  }

  saveTheme(data: any) {
    return this.dataService.postData("master/AddUserTheme", data);
  }

  getAllClient(data: any) {
    // return this.dataService.postData(`/GetAllClient?RequestData=${data}`,null);
    return this.dataService.postFormData("client/GetAllClient", data);
  }

  addNewClient(data: any) {
    return this.dataService.postFormData("client/AddClient", data);
  }

  getClientById(id: any) {
    return this.dataService.getData(`client/GetClient?id=${id}`);
  }

  getAllDataConfiguration(data: any) {
    return this.dataService.postFormData("compliance/GetDataConfigurationByFilter", data);
  }

  getTableNames(data: any) {
    return this.dataService.postFormData("master/GetAllTables", data);
  }

  getColumnNames(data: any) {
    return this.dataService.postFormData("master/GetAllFields", data);
  }

  AddComplianceconfig(data: any) {
    return this.dataService.postFormData("compliance/AddDataConfiguration", data);
  }

  UpdateComplianceconfig(data: any) {
    return this.dataService.postFormData("compliance/UpdateDataConfiguration", data);
  }

  deleteComplianceRec(data: any) {
    return this.dataService.deleteData(`compliance/DeleteDataConfiguration?tableName=${data.TableName}&columnName=${data.ColumnName}&createdById=${data.CreatedById}`);
  }

  addRecentMenu(data: any) {
    return this.dataService.postData("master/AddRecentMenu", data);
  }

  getRecentMenu(id: any) {
    return this.dataService.getData(`master/GetRecentMenu?EmployeeId=${id}`);
  }

  getAllCity(data: any) {
    return this.dataService.postFormData("city/GetAllCity", data);
  }

  getAllIndustryType(data: any) {
    return this.dataService.getData(`generalcode/GetGeneralCodeByType?type=${data}`,);
  }

  addApproval(data: any) {
    return this.dataService.postData("master/AddApproval", data);
  }

  updateApproval(data: any) {
    return this.dataService.postData("master/UpdateApproval", data);
  }

  updateClient(data: any) {
    return this.dataService.postFormData("client/UpdateClient", data);
  }

  getVersionHistory(data: any) {
    return this.dataService.postData("auditlog/GetAuditLogConfigurationByTable", data);
  }

  getClientVersionHistory(data: any) {
    return this.dataService.postData("auditlog/GetAudit", data);
  }

  getUser(data: any) {
    return this.dataService.postFormData("master/GetUsers", data);
  }

  getComplianceList() {
    return this.dataService.getData("compliance/GetAllCompilanceType");
  }

  getfavoriteMenu(data: any) {
    return this.dataService.getData(`favouritemenu/GetFavoriteMenu?EmployeeId=${data.id}&roleId=${data.RoleId}`);
  }

  addfavoriteMenu(data: any) {
    return this.dataService.postData("favouritemenu/AddFavoriteMenu", data);
  }

  deleteFavMenu(data: any) {
    return this.dataService.deleteData(`favouritemenu/DeleteFavouriteMenu?employeeId=${data.employee_Id}&menuName=${data.MenuName}`);
  }

  getAllAddClientData() {
    return this.dataService.getData("master/GetDropDowns");
  }

  deleteClient(data: any) {
    return this.dataService.deleteData(`client/DeleteClient?id=${data}`);
  }

  filterCompliance(data: any) {
    return this.dataService.postFormData("compliance/GetDataConfigurationByFilter", data);
  }

  sendOTPForLogin(data: any) {
    return this.dataService.postFormData("security/GenerateOTP", data);
  }

  getDynamicMenus(roleId: any) {
    return this.dataService.getData(`usermanagement/GetMenusDynamically?roleId=${roleId}`);
  }

  getAllMenu() {
    return this.dataService.getData('usermanagement/GetAllMenusWithURL');
  }

  getParentMenu() {
    return this.dataService.getData('usermanagement/GetAllMenus');
  }

  // getSubMenuByName(data: any) {
  //   return this.dataService.getData(`usermanagement/GetSubmenuByName?menu=${data}`);
  // }

  // getChildMenuBySubMenu(data: any) {
  //   return this.dataService.getData(`usermanagement/GetChildmenuByName?menu=${data}`);
  // }

  getSubMenuById(data: any) {
    return this.dataService.getData(`usermanagement/GetSubmenuByMenuId?id=${data}`);
  }

  getChildMenuBySubMenuId(data: any) {
    return this.dataService.getData(`usermanagement/GetChildmenuBySubMenuId?id=${data}`);
  }

  addParentMenu(data: any) {
    return this.dataService.postFormData('usermanagement/AddMenus', data);
  }

  updateParentMenu(data: any) {
    return this.dataService.putFormData('usermanagement/UpdateMenus', data);
  }

  addSubMenu(data: any) {
    return this.dataService.postFormData('usermanagement/AddSubMenus', data);
  }

  updateSubMenu(data: any) {
    return this.dataService.putFormData('usermanagement/UpdateSubMenus', data);
  }

  addChildMenu(data: any) {
    return this.dataService.postFormData('usermanagement/AddChildMenus', data);
  }

  updateChildMenu(data: any) {
    return this.dataService.putFormData('usermanagement/UpdateChildMenus', data);
  }

  disableParentMenu(id: any) {
    return this.dataService.deleteData(`usermanagement/disableMenu?id=${id}`);
  }

  disableSubMenu(id: any) {
    return this.dataService.deleteData(`usermanagement/DisableSubMenu?id=${id}`);
  }

  disableChildMenu(id: any) {
    return this.dataService.deleteData(`usermanagement/DisableChildMenu?id=${id}`);
  }

  getMyClients(id: any) {
    return this.dataService.getData(`client/GetMyClients?ApproverId=${id}`);
  }

  getAllUsersDetails(data: any) {
    return this.dataService.postFormData("usermanagement/userDetails", data);
  }

  getAllRoles(data: any) {
    return this.dataService.postFormData('usermanagement/GetRole', data);
  }

  addNewRole(data: any) {
    return this.dataService.postData("usermanagement/AddRole", data);
  }

  updateRole(data: any) {
    return this.dataService.putFormData("usermanagement/UpdateRole", data);
  }

  assignRole(data: any) {
    return this.dataService.postData("usermanagement/AssignRole", data);
  }

  getAssignedRoleById(id: any) {
    return this.dataService.getData(`usermanagement/GetAssignedRoleById?id=${id}`);
  }

  UpdateAssignedRole(data: any) {
    return this.dataService.putFormData("usermanagement/UpdateAssignedRole", data);
  }

  getAssignedRole(data: any) {
    return this.dataService.postFormData("usermanagement/GetAssignRole", data);
  }

  getRolesByDepartment(id: any) {
    return this.dataService.getData(`usermanagement/GetRoleByDepartment?DepartmentId=${id}`);
  }

  createUser(data: any) {
    return this.dataService.postData('security/SignUp', data);
  }

  UpdateUser(data: any) {
    return this.dataService.postFormData('security/UpdateUser', data);
  }

  getUserById(id: any) {
    return this.dataService.getData(`master/GetUserById?id=${id}`);
  }

  resetUserPassword(data: any) {
    return this.dataService.putFormData('security/ResetPassword', data);
  }

  getRolewiseUsers(data: any) {
    return this.dataService.getData(`usermanagement/GetUsersByRole?roleName=${data}`);
  }

  getUsersByRoleId(data: any) {
    return this.dataService.getData(`usermanagement/GetUsersByRoleId?id=${data}`);
  }

  getUnassignUsers() {
    return this.dataService.getData('master/GetUnAssignedUsers');
  }

  getDepartment() {
    return this.dataService.getData('master/GetDepartment');
  }

  getMenuAccessLevel(data: any) {
    return this.dataService.getData(`usermanagement/GetMenusForRole?menuId=${data.menuId}&roleId=${data.roleId}`);
  }

  assignMenuAccessLevel(data: any) {
    return this.dataService.postFormData('usermanagement/AssignMenusForRoles', data);
  }

  getUsersByDepartment(id: any) {
    return this.dataService.getData(`master/GetAssignedUsers?id=${id}`);
  }

  GetAllGroupOfCompanies(data: any) {
    return this.dataService.postFormData('groupofcompanies/GetAllGroupOfCompanies', data);
  }

  getGOCById(id: any) {
    return this.dataService.getData(`groupofcompanies/GetGroupOfCompany?id=${id}`);
  }

  addGroupOfCompany(data: any) {
    return this.dataService.postData('groupofcompanies/AddGroupOfCompany', data);
  }

  updateGroupOfCompany(data: any) {
    return this.dataService.postData('groupofcompanies/UpdateGroupOfCompany', data);
  }

  getClientsByGocId(id: any) {
    return this.dataService.getData(`master/GetClientByGOCId?id=${id}`);
  }

  GetAllCreditAppraisal(data: any) {
    return this.dataService.postFormData('creditappraisal/GetAllCreditAppraisal', data);
  }

  addCreditAppraisal(data: any) {
    return this.dataService.postFormData('creditappraisal/AddCreditAppraisal', data);
  }

  updateCreditAppraisal(data: any) {
    return this.dataService.putFormData('creditappraisal/UpdateCreditAppraisal', data);
  }

  getAllAssignedUsers() {
    return this.dataService.getData('usermanagement/GetAssignRoleForDropDown');
  }

  getAllClientOffices(data: any) {
    return this.dataService.postFormData('clientoffice/GetAllClientOffices', data);
  }

  getClientOfficeById(id: any) {
    return this.dataService.getData(`clientoffice/GetClientOffices?id=${id}`);
  }

  addClientOffices(data: any) {
    return this.dataService.postFormData('clientoffice/AddClientOffices', data);
  }

  updateClientOffices(data: any) {
    return this.dataService.putFormData('clientoffice/UpdateClientOffices', data);
  }

  getAllDriversAndUsers(data: any) {
    return this.dataService.postFormData('driver/GetAllDriver', data);
  }

  getDriverUserById(id: any) {
    return this.dataService.getData(`driver/GetDriver?id=${id}`);
  }

  addDriverAndUser(data: any) {
    return this.dataService.postFormData('driver/AddDriver', data);
  }

  updateDriverAndUser(data: any) {
    return this.dataService.putFormData('driver/UpdateDriver', data);
  }

  getDriverExlFormat() {
    return this.dataService.getData('driver/GetDriverExcelFormat');
  }

  importDriversUSers(data: any) {
    return this.dataService.postFormData('driver/AddDriverFromExcel', data);
  }

  GetAllContractAgreement(data: any) {
    return this.dataService.postFormData('contractagreement/GetAllContractAgreement', data);
  }

  getContractById(id: any) {
    return this.dataService.getData(`contractagreement/GetContractAgreement?id=${id}`);
  }

  addContract(data: any) {
    return this.dataService.postFormData('contractagreement/AddContractAgreement', data);
  }

  updateContract(data: any) {
    return this.dataService.putFormData('contractagreement/UpdateContractAgreement', data);
  }

  deleteContract(id: any) {
    return this.dataService.deleteData(`contractagreement/DeleteContractAgreement?id=${id}`);
  }

  getAllContractDropdowns() {
    return this.dataService.getData('master/getCADropDowns');
  }

  getDriversByClientId(id: any) {
    return this.dataService.getData(`contractagreement/GetDriversByClientId?id=${id}`);
  }

  deleteCAService(id: any) {
    return this.dataService.deleteData(`contractagreement/DeleteContractAgreement?id=${id}`);
  }

  getAllmanufacturers(data: any) {
    return this.dataService.postFormData('manufacturer/GetAllManufacturer', data);
  }

  getManufacturerById(id: any) {
    return this.dataService.getData(`manufacturer/GetManufacturer?id=${id}`);
  }

  addManufacturer(data: any) {
    return this.dataService.postFormData('manufacturer/AddManufacturer', data);
  }

  updateManufacturer(data: any) {
    return this.dataService.putFormData('manufacturer/UpdateManufacturer', data);
  }

  getAllDealers(data: any) {
    return this.dataService.postFormData('creditor/GetAllCreditor', data);
  }

  addDealer(data: any) {
    return this.dataService.postFormData('creditor/AddCreditor', data);
  }

  updateDealer(data: any) {
    return this.dataService.putFormData('creditor/UpdateCreditor', data);
  }

  getDealerById(id: any) {
    return this.dataService.getData(`creditor/GetCreditor?id=${id}`);
  }

  getAllDealerDropDowns() {
    return this.dataService.getData('creditor/GetDealerDropDowns');
  }

  getAllProducts(data: any) {
    return this.dataService.postFormData('product/GetAllLkpProduct', data);
  }

  addProduct(data: any) {
    return this.dataService.postFormData('product/AddLkpProduct', data);
  }

  updateProduct(data: any) {
    return this.dataService.putFormData('product/UpdateLkpProduct', data);
  }

  getAllObjects(data: any) {
    return this.dataService.postFormData('object/GetAllObject', data);
  }

  addObject(data: any) {
    return this.dataService.postFormData('object/AddObject', data);
  }

  updateObject(data: any) {
    return this.dataService.putFormData('object/UpdateObject', data);
  }

  getAllStates(data: any) {
    return this.dataService.postFormData('statedetails/GetAllStateDetails', data);
  }

  addState(data: any) {
    return this.dataService.postFormData('statedetails/AddStateDetails', data);
  }

  getStateById(id: any) {
    return this.dataService.getData(`statedetails/GetStateDetails?id=${id}`);
  }

  updateState(data: any) {
    return this.dataService.putFormData('statedetails/UpdateStateDetails', data);
  }

  getParentState() {
    return this.dataService.getData('statedetails/ShowState');
  }

  getAllCities(data: any) {
    return this.dataService.postFormData('city/GetAllCity', data);
  }

  addCities(data: any) {
    return this.dataService.postFormData('city/AddCity', data);
  }

  getCitiesById(id: any) {
    return this.dataService.getData(`city/GetCity?id=${id}`);
  }

  updateCities(data: any) {
    return this.dataService.putFormData('city/UpdateCity', data);
  }

  getCitiesDropdowns() {
    return this.dataService.getData('city/GetCityDropdowns');
  }

  getAllModels(data: any) {
    return this.dataService.postFormData('model/GetAllModel', data);
  }

  addModel(data: any) {
    return this.dataService.postFormData('model/AddModel', data);
  }

  getModelById(id: any) {
    return this.dataService.getData(`model/GetModel?id=${id}`);
  }

  updateModel(data: any) {
    return this.dataService.putFormData('model/UpdateModel', data);
  }

  getModelDropdowns() {
    return this.dataService.getData('model/GetDropdownsForModel');
  }

  deleteModelService(id: any) {
    return this.dataService.deleteData(`model/DeleteModelService?id=${id}`);
  }

  getAllVariants(data: any) {
    return this.dataService.postFormData('variant/GetAllVariant', data);
  }

  addVariant(data: any) {
    return this.dataService.postFormData('variant/AddVariant', data);
  }

  getVariantById(id: any) {
    return this.dataService.getData(`variant/GetVariant?id=${id}`);
  }

  updateVariant(data: any) {
    return this.dataService.putFormData('variant/UpdateVariant', data);
  }

  getVariantDropdowns() {
    return this.dataService.getData('variant/GetVariantDropdowns');
  }


  getAllAccessories(data: any) {
    return this.dataService.postFormData('accessories/GetAllAccessories', data);
  }

  addAccessories(data: any) {
    return this.dataService.postFormData('accessories/AddAccessories', data);
  }

  getAccessoryById(id: any) {
    return this.dataService.getData(`accessories/GetAccessories?id=${id}`);
  }

  updateAccessories(data: any) {
    return this.dataService.putFormData('accessories/UpdateAccessories', data);
  }

  getAccessoriesDropdowns() {
    return this.dataService.getData('accessories/GetAccessoriesDropdowns');
  }

  copyVariant(data: any) {
    return this.dataService.getData(`variant/CopyVariant?variantId=${data.variantId}&userId=${data.userId}`);
  }

  exportVariantExcel() {
    return this.dataService.getData('variant/ExportVariant');
  }

  getvariantSpecDetails(data: any) {
    return this.dataService.getData(`variant/GetJatoVariantDetails?id=${data.jatoId}&userId=${data.pageName}&search=${data.searchValue}`);
  }

  getAllSpareParts(data: any) {
    return this.dataService.postFormData('SpareParts/GetAllPart', data);
  }

  addSpareParts(data: any) {
    return this.dataService.postFormData('SpareParts/AddPart', data);
  }

  updateSpareParts(data: any) {
    return this.dataService.putFormData('SpareParts/UpdatePart', data);
  }

  getPartDropDowns() {
    return this.dataService.getData('SpareParts/GetDropdowns');
  }

  getAllInsuredValue(data: any) {
    return this.dataService.postFormData('Insurance/GetAllIsuranceDeclaredValue', data);
  }

  addInsuredValue(data: any) {
    return this.dataService.postFormData('Insurance/AddIsuranceDeclaredValue', data);
  }

  updateInsuredValue(data: any) {
    return this.dataService.putFormData('Insurance/UpdateIsuranceDeclaredValue', data);
  }

  getAllDescription(data: any) {
    return this.dataService.postFormData('Insurance/GetAllThirdPartyPremiumData', data);
  }

  addDescription(data: any) {
    return this.dataService.postFormData('Insurance/AddThirdPartyPremiumData', data);
  }

  getDescriptionById(id: any) {
    return this.dataService.getData(`Insurance/GetThirdPartyPremiumData?id=${id}`);
  }

  updateDescription(data: any) {
    return this.dataService.putFormData('Insurance/UpdateThirdPartyPremiumData', data);
  }

  getAllTpp(data: any) {
    return this.dataService.postFormData('Insurance/GetAllTP', data);
  }

  addTpp(data: any) {
    return this.dataService.postFormData('Insurance/AddTP', data);
  }

  getTppById(id: any) {
    return this.dataService.getData(`Insurance/GetTP?id=${id}`);
  }

  updateTpp(data: any) {
    return this.dataService.putFormData('Insurance/UpdateTP', data);
  }

  getAllBudget(data: any) {
    return this.dataService.postFormData('Budget/GetAll', data);
  }

  addBudget(data: any) {
    return this.dataService.postFormData('Budget/Add', data);
  }

  getBudgetById(id: any) {
    return this.dataService.getData(`Budget/Get?id=${id}`);
  }

  updateBudget(data: any) {
    return this.dataService.putFormData('Budget/Update', data);
  }

  getAllDMRelation(data: any) {
    return this.dataService.postFormData('DealerManufacturerLink/GetAll', data);
  }

  addDMRelation(data: any) {
    return this.dataService.postFormData('DealerManufacturerLink/Add', data);
  }

  getDMRelationById(id: any) {
    return this.dataService.getData(`DealerManufacturerLink/Get?id=${id}`);
  }

  updateDMRelation(data: any) {
    return this.dataService.putFormData('DealerManufacturerLink/Update', data);
  }

  getDMRelationDropDowns() {
    return this.dataService.getData('DealerManufacturerLink/GetDropdowns');
  }

  getAllInvoiceType(data: any) {
    return this.dataService.postFormData('Invoice/GetAll', data);
  }

  addInvoiceType(data: any) {
    return this.dataService.postFormData('Invoice/Add', data);
  }

  getInvoiceTypeById(id: any) {
    return this.dataService.getData(`Invoice/Get?id=${id}`);
  }

  updateInvoiceType(data: any) {
    return this.dataService.putFormData('Invoice/Update', data);
  }

  getAllRegion(data: any) {
    return this.dataService.postFormData("region/GetAllRegion", data);
  }

  addRegion(data: any) {
    return this.dataService.postFormData('region/AddRegion', data);
  }

  updateRegion(data: any) {
    return this.dataService.putFormData('region/UpdateRegion', data);
  }

  getAllServiceTax(data: any) {
    return this.dataService.postFormData("ServiceTax/GetAll", data);
  }

  addServiceTax(data: any) {
    return this.dataService.postFormData('ServiceTax/Add', data);
  }

  updateServiceTax(data: any) {
    return this.dataService.putFormData('ServiceTax/Update', data);
  }

  getAllShades(data: any) {
    return this.dataService.postFormData("Shades/GetAll", data);
  }

  addShade(data: any) {
    return this.dataService.postFormData('Shades/Add', data);
  }

  updateShade(data: any) {
    return this.dataService.putFormData('Shades/Update', data);
  }

  getAllRequests(UserId: any) {
    return this.dataService.getData(`WorkFlow/GetAllRequestByUserId?userId=${UserId}`);
  }

  getPendingRequests(UserId: any) {
    return this.dataService.getData(`WorkFlow/GetPendingRequestByUserId?userId=${UserId}`);
  }

  getApprovedRequests(UserId: any) {
    return this.dataService.getData(`WorkFlow/GetApprovedRequestByUserId?userId=${UserId}`);
  }

  getRejectedRequests(UserId: any) {
    return this.dataService.getData(`WorkFlow/GetRejectedRequestByUserId?userId=${UserId}`);
  }

  updateRequestStatus(data: any) {
    // return this.dataService.putData(`WorkFlow/UpdateStatus?id=${data.id}&statusId=${data.statusId}&remarks=${data.remarks}`);
    return this.dataService.postFormData('WorkFlow/UpdateStatus', data);
  }

  // getNotifications(UserId: any) {
  //   return this.dataService.getData(`WorkFlow/GetRejectedRequestByUserId?userId=${UserId}`);
  // }

  getAllWorkFlowList(data: any) {
    return this.dataService.postFormData('WorkFlow/GetAllWorkFlowHirarche', data);
  }

  getWorkflowDropdowns() {
    return this.dataService.getData(`WorkFlow/GetDropDowns`);
  }

  addWorkFlowList(data: any) {
    return this.dataService.postFormData('WorkFlow/AddWorkFlowHirarche', data);
  }

  updateWorkFlowList(data: any) {
    return this.dataService.putFormData('WorkFlow/UpdateWorkFlowHirarche', data);
  }

  getDataByTransactionId(transactionId: any) {
    return this.dataService.getData(`WorkFlow/GetTransactionDetails?transactionId=${transactionId}`);
  }

  updateStatusByTrasnactionId(data: any) {
    return this.dataService.postFormData('WorkFlow/UpdateWorkFlowStatusByTransactionId', data);
  }

  getservicebookingdetails(assetId:any){
    return this.dataService.getData1(`SeriviceBooking/getBookingHistory?AssetNumber=${assetId}`);

  }

}
