import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { Constant } from 'src/app/shared/model/constant';
import { ClientService } from '../../../../client.service';
import { Location } from '@angular/common';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map } from 'rxjs';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PeriodicElement } from '../../../../compilance/compilance.component';
import { Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { RequestApprovalComponent } from 'src/app/shared/components/request-approval/request-approval.component';

const ENTER = 13;
const COMMA = 44;

export interface RouteData {
  breadcrumb?: string;
}

@Component({
  selector: 'app-add-variant',
  templateUrl: './add-variant.component.html',
  styleUrls: ['./add-variant.component.scss']
})
export class AddVariantComponent {
  mainThemeClass = '';
  localTheme: any;
  currentUser: any;
  darkThemeMode: boolean = false;
  theme = {
    themeClass: 'default-blue-colored-theme',
    themeMode: '',
    themeName: 'Default',
    themeColorCode: '#00B0F0',
  }

  VariantDetailsForm!: FormGroup;
  shadesFeaturesForm!: FormGroup;


  VariantDetailsFormSubmitted: boolean = false;
  shadesFeaturesFormSubmitted: boolean = false;

  panelOpenState = false;
  selectedtab: number = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  PageNumber: number = 1;
  PageSize: number = 10;
  totalRecords: number;
  variantId: number = 0;
  selecetdVariantData: any;
  isView: boolean = false;
  editMode: boolean = false;
  IsApproverView: boolean = false;
  TransactionId: number = 0;
  modelList: any;
  manufacturerList: any;
  VlengthList: any;
  svCategoryList: any;
  transmissionTypeList: any;
  driveTypeList: any;
  fpMaintScheduleList: any;
  vehSegmentList: any;
  fuelTypeList: any;
  emissionLevelList = [1, 2, 3, 4, 5, 6];
  replCarCategoryList: any;
  carCategoryList: any;
  objectTypeList: any;
  taxCategoryList: any;
  shadesList: any;
  featuresList: any;
  selectedShadesList: any[] = [];
  selectedFeaturesList: any[] = [];
  totalAssets = 0;
  totalQuotes = 0;
  IsSvTypeSelected: boolean = false;

  fuelTankType: number = 1;
  fuelTanks = [{ Id: 1, name: 'Normal' }, { Id: 2, name: 'Fiber' }];
  svType: number = 1;
  svTypeList = [{ Id: 1, name: 'No' }, { Id: 2, name: 'CAT 1' }, { Id: 3, name: 'CAT 3' }];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  shadeCtrl1 = new FormControl('');
  filteredShades: Observable<any[]>;
  shades: any[] = [];
  @ViewChild('shadeInput') shadeInput: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);
  featureCtrl = new FormControl('');
  filteredFeatures: Observable<any[]>;
  features: any[] = [];
  @ViewChild('featureInput') featureInput: ElementRef<HTMLInputElement>;

  @ViewChild('variantTableList') variantTableList!: MatTable<any>;
  sortState: string = '';
  sortDirection: string = '';
  displayedColumns: string[] = ['Column Name', 'Group Name', 'Value'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  VariantsList: any[] = [];
  AllVariants: any[] = [];

  timer: any;
  searchText = '';
  selectedFilter = { filterName: '' };
  filterList = [
    { filterName: 'Variant Name' },
    { filterName: 'Model Name' },
    { filterName: 'Jato Id' },
    { filterName: 'Fuel Type' },
  ];
  filterBtnClicked: boolean = false;
  IsAuditTrail: boolean = false;
  AccessLevel: any;
  isAddAccess: boolean = false;
  isEditAccess: boolean = false;
  isViewAccess: boolean = false;
  isDeleteAccess: boolean = false;
  isApprovAccess: boolean = false;
  selectedRowIndex: any;
  IsSearch: boolean = false;

  constructor(
    private clientService: ClientService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    protected commonService: CommonService,
    private datePipe: DatePipe,
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
      this.variantId = history.state.id;
      if (history.state.mode === "view") {
        this.isView = true;
        this.editMode = false;
        this.IsApproverView = false;
        this.getAllVariantDropDowns();
      }
      else if (history.state.mode === "edit") {
        this.editMode = true;
        this.isView = false;
        this.IsApproverView = false;
        this.getAllVariantDropDowns();
      } else if (history.state.mode === "approver") {
        this.IsApproverView = true;
        this.editMode = false;
        this.isView = false;
        this.getAllVariantDropDowns();
      } else {
        this.getAllVariantDropDowns();
      }

      this.AccessLevel = history.state.level;
      this.AccessLevel[0] == 1 ? this.isAddAccess = true : this.isAddAccess = false;
      this.AccessLevel[1] == 1 ? this.isEditAccess = true : this.isEditAccess = false;
      this.AccessLevel[2] == 1 ? this.isViewAccess = true : this.isViewAccess = false;
      this.AccessLevel[3] == 1 ? this.isDeleteAccess = true : this.isDeleteAccess = false;
      this.AccessLevel[4] == 1 ? this.isApprovAccess = true : this.isApprovAccess = false;
    } else {
      this.getAllVariantDropDowns();
    }


    this.VariantDetailsForm = new FormGroup({
      variantName: new FormControl('', [Validators.required]),
      modelType: new FormControl(null),
      manufacturer: new FormControl(null),
      tyreSize: new FormControl('', [Validators.required]),
      Vlength: new FormControl(null, [Validators.required]),
      transmType: new FormControl(null, [Validators.required]),
      driveType: new FormControl(null, [Validators.required]),
      freePaidMaintSchedule: new FormControl(null, [Validators.required]),
      vehSegment: new FormControl(null),
      groundClearance: new FormControl('', Validators.pattern(Constant.IntNo)),
      cessPercent: new FormControl('', Validators.pattern(Constant.IntNoWtZero)),
      isCess: new FormControl(false),
      engineCapacity: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      fuelTankType: new FormControl(''),
      fuelType: new FormControl(null),
      ishybrid: new FormControl(false),
      fuelCapacity: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      dimensions: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      warranty: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      km1: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      isBasevariant: new FormControl(false),
      consumption: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      bhp: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      emissionLevel: new FormControl(null),
      replCarCategory: new FormControl(null),
      carCategory: new FormControl(null),
      seatCapcity: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      objectType: new FormControl(null),
      maxTenure: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      km2: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      svType: new FormControl(null),
      svCategory: new FormControl(null),
      taxCategory: new FormControl(null),
      jatoId: new FormControl('', [Validators.pattern(Constant.IntNo)]),
      hsnCode: new FormControl('', [Validators.required, Validators.pattern(Constant.IntNo)]),
      rvDeviation: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      rmtvDeviation: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      gvwKg: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      millage: new FormControl('', [Validators.pattern(Constant.decimalNo)]),
      dormant: new FormControl(false),
    });

    this.shadesFeaturesForm = new FormGroup({
      shades: new FormControl([]),
      features: new FormControl([]),
    });

    // this.getAllVariantDropDowns();
    this.VariantDetailsForm.markAllAsTouched();
    this.shadesFeaturesForm.markAllAsTouched();
    this.onloadData();

  }

  ngOnInit(): void {
    this.route.data.subscribe((data: RouteData) => {
      const breadcrumb = data.breadcrumb || 'Master / Fleet / Variants';
      this.breadcrumbService.setBreadcrumbs(['Master / Fleet / Variants', breadcrumb]);
    });
  }

  remove(shade: any): void {
    const index = this.shades.indexOf(shade);
    if (index >= 0) {
      this.shades.splice(index, 1);
      this.announcer.announce(`Removed ${shade.ShadeDesc}`);
      this.selectedShadesList.splice(index, 1);

      this.filteredShades = this.filteredShades.pipe(
        map(shades => [shade, ...shades])
      );
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.shades.push(event.option.value);
    this.shadeInput.nativeElement.value = '';
    this.shadeCtrl1.setValue(null);

    this.selectedShadesList.push(event.option.value.Id);
    this.filteredShades = this.filteredShades.pipe(
      map(shades => shades.filter(item => item.Id !== event.option.value.Id))
    );

  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.shadesList.filter((shade: any) => shade.ShadeDesc.toLowerCase().includes(filterValue));
  }

  trackById(index: number, item: any): number {
    return item.Id;
  }

  FeatureRemove(feature: any): void {
    const index = this.features.indexOf(feature);
    if (index >= 0) {
      this.features.splice(index, 1);
      this.announcer.announce(`Removed ${feature.Description}`);

      this.selectedFeaturesList.splice(index, 1);

      this.filteredFeatures = this.filteredFeatures.pipe(
        map(features => [feature, ...features])
      );
    }
  }

  FeatureSelected(event: MatAutocompleteSelectedEvent): void {
    this.features.push(event.option.value);
    this.featureInput.nativeElement.value = '';
    this.featureCtrl.setValue(null);

    this.selectedFeaturesList.push(event.option.value.Id);
    this.filteredFeatures = this.filteredFeatures.pipe(
      map(shades => shades.filter(item => item.Id !== event.option.value.Id))
    );
  }

  private feature_filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.featuresList.filter((feature: any) => feature.Description.toLowerCase().includes(filterValue));
  }



  trackFeatureById(index: number, item: any): number {
    return item.Id;
  }

  onloadData() {
    this.VariantDetailsForm.get('svType')?.setValue(1);
    this.VariantDetailsForm.get('fuelTankType')?.setValue(1);
    this.VariantDetailsForm.get('svCategory')?.setValue(null);
  }

  get VariantDetailsValidators() {
    return this.VariantDetailsForm.controls;
  }

  get shadesFeaturesValidators() {
    return this.shadesFeaturesForm.controls;
  }

  getVariantById() {
    this.spinner.show();
    this.clientService.getVariantById(this.variantId).subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.selecetdVariantData = res;
          this.totalAssets = this.selecetdVariantData.AssetsCount;
          this.totalQuotes = this.selecetdVariantData.QnoCount;
          if (this.isView || this.IsApproverView) {
            // this.addVariantForm.disable();
            this.VariantDetailsForm.disable();
            this.shadesFeaturesForm.disable();
            this.shadeCtrl1.disable();
            this.featureCtrl.disable();
          }
          if (this.editMode) {
            this.VariantDetailsForm.get('engineCapacity')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.VariantDetailsForm.get('fuelCapacity')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.VariantDetailsForm.get('dimensions')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.VariantDetailsForm.get('warranty')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.VariantDetailsForm.get('km1')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.VariantDetailsForm.get('seatCapcity')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.VariantDetailsForm.get('maxTenure')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
            this.VariantDetailsForm.get('km2')?.setValidators([Validators.pattern(Constant.IntNoSpChar)]);
          } else {
            this.VariantDetailsForm.get('engineCapacity')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.VariantDetailsForm.get('fuelCapacity')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.VariantDetailsForm.get('dimensions')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.VariantDetailsForm.get('warranty')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.VariantDetailsForm.get('km1')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.VariantDetailsForm.get('seatCapcity')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.VariantDetailsForm.get('maxTenure')?.setValidators([Validators.pattern(Constant.IntNo)]);
            this.VariantDetailsForm.get('km2')?.setValidators([Validators.pattern(Constant.IntNo)]);
          }
          // To apply the new validators, you need to update the form control's value
          this.VariantDetailsForm.updateValueAndValidity();

          this.VariantDetailsForm.patchValue({
            variantName: this.selecetdVariantData.VariantName,
            modelType: this.selecetdVariantData.ModelId,
            manufacturer: this.selecetdVariantData.ManufacturerId,
            tyreSize: this.selecetdVariantData.TyreSize,
            Vlength: this.selecetdVariantData.LengthCategory,
            transmType: this.selecetdVariantData.Transmission,
            driveType: this.selecetdVariantData.DriveType,
            freePaidMaintSchedule: this.selecetdVariantData.FreeServiceId,
            vehSegment: this.selecetdVariantData.VehicleSegmentId,
            groundClearance: this.selecetdVariantData.GroundClearance,
            cessPercent: this.selecetdVariantData.CessPerc,
            isCess: this.selecetdVariantData.IsCess,
            engineCapacity: this.selecetdVariantData.EngineCapacity,
            fuelTankType: this.selecetdVariantData.TankType,
            fuelType: this.selecetdVariantData.FuelId,
            ishybrid: this.selecetdVariantData.IsHybrid == 1 ? true : false,
            fuelCapacity: this.selecetdVariantData.FuelCapacity,
            dimensions: this.selecetdVariantData.Dimension,
            warranty: this.selecetdVariantData.WarrentyYear,
            km1: this.selecetdVariantData.WarrentyKM,
            isBasevariant: this.selecetdVariantData.BaseVariant == 1 ? true : false,
            consumption: this.selecetdVariantData.Consumption,
            bhp: this.selecetdVariantData.Bhp,
            emissionLevel: this.selecetdVariantData.EmissionLevel,
            replCarCategory: this.selecetdVariantData.RepVehicleSegmentId,
            carCategory: this.selecetdVariantData.CRDCategory,
            seatCapcity: this.selecetdVariantData.SeatCapacity,
            objectType: this.selecetdVariantData.ProductId,
            maxTenure: this.selecetdVariantData.MaxTenure,
            km2: this.selecetdVariantData.MaxKM,
            svType: this.selecetdVariantData.SVType,
            svCategory: this.selecetdVariantData.SVCategory,
            taxCategory: this.selecetdVariantData.TaxCategory,
            jatoId: this.selecetdVariantData.JatoId,
            hsnCode: this.selecetdVariantData.HSNCode,
            rvDeviation: this.selecetdVariantData.RvDeviation,
            rmtvDeviation: this.selecetdVariantData.RmtDeviation,
            gvwKg: this.selecetdVariantData.GrossWeight,
            millage: this.selecetdVariantData.Mileage
          });
          // this.shadesFeaturesForm.patchValue({
          //   shades: this.selecetdVariantData.Shade,
          //   features: this.selecetdVariantData.Feature,
          // });
          let selectedShades: any[] = this.selecetdVariantData.Shade;
          if (selectedShades && selectedShades.length > 0) {
            selectedShades.map((Id: any) => {
              this.shadesList.map((item: any) => {
                if (item.Id == Id) {
                  this.shades.push(item);
                  this.selectedShadesList.push(item.Id);

                  this.filteredShades = this.filteredShades.pipe(
                    map(shades => shades.filter(shade => shade.Id !== item.Id))
                  );
                }
              })
            })
          }



          let selectedFeatures: any[] = this.selecetdVariantData.Feature;
          if (selectedFeatures && selectedFeatures.length > 0) {
            selectedFeatures.map((Id: any) => {
              this.featuresList.map((item: any) => {
                if (item.Id == Id) {
                  this.features.push(item);
                  this.selectedFeaturesList.push(item.Id);

                  this.filteredFeatures = this.filteredFeatures.pipe(
                    map(features => features.filter(feature => feature.Id !== item.Id))
                  );
                }
              })
            })

          }
          if (this.selecetdVariantData.SVType != null && this.selecetdVariantData.SVType !== undefined) {
            // this.onSVTypeChange({ value: this.selecetdVariantData.SVType });

            this.VariantDetailsForm.get('svCategory')?.reset();
            if (this.selecetdVariantData.SVType) {
              this.VariantDetailsForm.get('svType')?.setValue(this.selecetdVariantData.SVType);
              if (this.selecetdVariantData.SVType != 1) {
                this.IsSvTypeSelected = true;
                this.VariantDetailsForm.get('svCategory')?.setValue(this.selecetdVariantData.SVCategory);
              }
              else {
                this.IsSvTypeSelected = false;
                this.VariantDetailsForm.get('svCategory')?.setValue(null);
              }
            }
          }

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

  tabClick(event: any) {
    this.selectedtab = event.index;

    if (this.selectedtab == 2) {
      this.getvariantSpecDetails();
    }

    let tab: any = event.tab;

    if (tab) {
      let _closestTabGroup: any = tab._closestTabGroup;
      let _elementRef: any = _closestTabGroup._elementRef;
      let nativeElement: any = _elementRef.nativeElement;
      let children: any = nativeElement.children;
      let children1: any = children[1];
      let Childs: any = children1.children;
      let Child1 = Childs[0];
      let Child2 = Childs[1];
      let Child3 = Childs[2];

      // let childArray: any[] = [Child1, Child2, Child3];
      // childArray.map((item, i) => {
      //   let tabContentWrapper: any = item.children;
      //   let tabContent: any = tabContentWrapper[0];
      //   if (this.selectedtab === i) {
      //     tabContent.classList.add('blue-bg');
      //   } else {
      //     tabContent.classList.remove('blue-bg');
      //   }
      // });
    }
  }

  moveToNextTab() {
    if (this.selectedtab == 0) {
      this.VariantDetailsFormSubmitted = true;
      if (this.VariantDetailsForm.status == 'VALID') {
        this.selectedtab = 1;
      }
    }
  }

  getAllVariantDropDowns() {
    this.spinner.show();
    this.clientService.getVariantDropdowns().subscribe((res: any) => {
      if (res) {
        if (!res.HasErrors) {
          this.modelList = res.ModelList;
          this.manufacturerList = res.ManufacturerList;
          // this.transmissionTypeList = res.TransmissionType;
          this.transmissionTypeList = [{ GeneralDescription: 'Automatic', GeneralTypeId: 146 }, { GeneralDescription: 'Manual', GeneralTypeId: 145 }];
          this.driveTypeList = res.DriveType;
          this.svCategoryList = res.SVCategory;
          this.VlengthList = res.Length;
          this.fpMaintScheduleList = res.FreeServiceList;
          this.vehSegmentList = res.VehicleSegmentList;
          this.fuelTypeList = res.FuelTypeList;
          this.carCategoryList = res.CarCategoryList;
          this.replCarCategoryList = res.VehicleSegmentList;
          this.objectTypeList = res.ObjectList;
          this.taxCategoryList = res.TaxCategory;


          this.shadesList = res.ShadeList;
          this.featuresList = res.FeaturesList;

          this.filteredShades = this.shadeCtrl1.valueChanges.pipe(
            startWith(null),
            map((shade: any | null) => (shade && shade.Id ? this._filter(shade.ShadeDesc) : shade ? this._filter(shade) : this.shadesList.slice())),
          );

          this.filteredFeatures = this.featureCtrl.valueChanges.pipe(
            startWith(null),
            map((feature: any | null) => (feature && feature.Id ? this.feature_filter(feature.Description) : feature ? this.feature_filter(feature) : this.featuresList.slice())),
          );


          this.spinner.hide();
          if (this.editMode || this.isView || this.IsApproverView) {
            this.getVariantById();
          }

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

  addVariant() {
    this.VariantDetailsFormSubmitted = true;
    this.shadesFeaturesFormSubmitted = true;
    console.log(this.VariantDetailsForm);
    console.log(this.selectedShadesList);
    console.log(this.selectedFeaturesList);


    if (this.VariantDetailsForm.status == 'VALID' && this.shadesFeaturesForm.status == 'VALID') {
      let VariantDetails = {
        CreatedById: this.currentUser.UserId,

        VariantName: this.VariantDetailsForm.value.variantName,
        ModelId: this.VariantDetailsForm.value.modelType,
        ManufacturerId: this.VariantDetailsForm.value.manufacturer,
        EngineCapacity: this.VariantDetailsForm.value.engineCapacity,
        Dimension: this.VariantDetailsForm.value.dimensions,
        WarrentyYear: this.VariantDetailsForm.value.warranty,
        BaseVariant: this.VariantDetailsForm.value.isBasevariant == true ? 1 : 0,
        Consumption: this.VariantDetailsForm.value.consumption,
        Bhp: this.VariantDetailsForm.value.bhp,
        SeatCapacity: this.VariantDetailsForm.value.seatCapcity,
        ProductId: this.VariantDetailsForm.value.objectType,
        FuelId: this.VariantDetailsForm.value.fuelType,
        IsHybrid: this.VariantDetailsForm.value.ishybrid == true ? 1 : 0,
        FuelCapacity: this.VariantDetailsForm.value.fuelCapacity,
        VehicleSegmentId: this.VariantDetailsForm.value.vehSegment,
        TankType: this.VariantDetailsForm.value.fuelTankType,
        FreeServiceId: this.VariantDetailsForm.value.freePaidMaintSchedule,
        MaxTenure: this.VariantDetailsForm.value.maxTenure,
        EmissionLevel: this.VariantDetailsForm.value.emissionLevel,
        RvDeviation: this.VariantDetailsForm.value.rvDeviation,
        RmtDeviation: this.VariantDetailsForm.value.rmtvDeviation,
        GrossWeight: this.VariantDetailsForm.value.gvwKg,
        TyreSize: this.VariantDetailsForm.value.tyreSize,
        Transmission: this.VariantDetailsForm.value.transmType,
        DriveType: this.VariantDetailsForm.value.driveType,
        LengthCategory: this.VariantDetailsForm.value.Vlength,
        GroundClearance: this.VariantDetailsForm.value.groundClearance,
        CessPerc: parseFloat(this.VariantDetailsForm.value.cessPercent),
        IsCess: this.VariantDetailsForm.value.isCess,
        SVType: this.VariantDetailsForm.value.svType,
        SVCategory: this.VariantDetailsForm.value.svCategory != null && this.VariantDetailsForm.value.svCategory !== undefined ? this.VariantDetailsForm.value.svCategory : 0,
        TaxCategory: this.VariantDetailsForm.value.taxCategory,
        JatoId: this.VariantDetailsForm.value.jatoId,
        HSNCode: this.VariantDetailsForm.value.hsnCode,
        WarrentyKM: this.VariantDetailsForm.value.km1,
        MaxKM: this.VariantDetailsForm.value.km2,
        RepVehicleSegmentId: this.VariantDetailsForm.value.replCarCategory,
        CRDCategory: this.VariantDetailsForm.value.carCategory,
        Mileage: this.VariantDetailsForm.value.millage,

        Dormant: this.VariantDetailsForm.value.dormant,
        ShadesArray: this.selectedShadesList,
        FeaturesArray: this.selectedFeaturesList,

        // IsOnline: ,
        // IsNotJATO: ,
        // Source: ,
        // Remarks: ,
        // ApprovedBy: ,
        // ApprovedOn: ,
      };

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(VariantDetails));

      this.spinner.show();
      this.clientService.addVariant(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Variant Added successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.spinner.hide();
            this.router.navigate(["/master-variant"], {
              state: {
                level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
              }
            });
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

  updateVariant() {
    this.VariantDetailsFormSubmitted = true;
    this.shadesFeaturesFormSubmitted = true;

    console.log(this.VariantDetailsForm);
    console.log(this.selectedShadesList);
    console.log(this.selectedFeaturesList);

    if (this.VariantDetailsForm.status == 'VALID' && this.shadesFeaturesForm.status == 'VALID') {

      // let VariantDetails = {
      //   ModifiedById: this.currentUser.UserId,
      //   Id: this.selecetdVariantData.Id,

      //   VariantName: this.VariantDetailsForm.value.variantName,
      //   ModelId: this.VariantDetailsForm.value.modelType,
      //   ManufacturerId: this.VariantDetailsForm.value.manufacturer,
      //   EngineCapacity: this.VariantDetailsForm.value.engineCapacity,
      //   Dimension: this.VariantDetailsForm.value.dimensions,
      //   WarrentyYear: this.VariantDetailsForm.value.warranty,
      //   BaseVariant: this.VariantDetailsForm.value.isBasevariant == true ? 1 : 0,
      //   Consumption: this.VariantDetailsForm.value.consumption,
      //   Bhp: this.VariantDetailsForm.value.bhp,
      //   SeatCapacity: this.VariantDetailsForm.value.seatCapcity,
      //   ProductId: this.VariantDetailsForm.value.objectType,
      //   FuelId: this.VariantDetailsForm.value.fuelType,
      //   IsHybrid: this.VariantDetailsForm.value.ishybrid == true ? 1 : 0,
      //   FuelCapacity: this.VariantDetailsForm.value.fuelCapacity,
      //   VehicleSegmentId: this.VariantDetailsForm.value.vehSegment,
      //   TankType: this.VariantDetailsForm.value.fuelTankType,
      //   FreeServiceId: this.VariantDetailsForm.value.freePaidMaintSchedule,
      //   MaxTenure: this.VariantDetailsForm.value.maxTenure,
      //   EmissionLevel: this.VariantDetailsForm.value.emissionLevel,
      //   RvDeviation: this.VariantDetailsForm.value.rvDeviation,
      //   RmtDeviation: this.VariantDetailsForm.value.rmtvDeviation,
      //   GrossWeight: this.VariantDetailsForm.value.gvwKg,
      //   TyreSize: this.VariantDetailsForm.value.tyreSize,
      //   Transmission: this.VariantDetailsForm.value.transmType,
      //   DriveType: this.VariantDetailsForm.value.driveType,
      //   LengthCategory: this.VariantDetailsForm.value.Vlength,
      //   GroundClearance: this.VariantDetailsForm.value.groundClearance,
      //   CessPerc: parseFloat(this.VariantDetailsForm.value.cessPercent),
      //   IsCess: this.VariantDetailsForm.value.isCess,
      //   SVType: this.VariantDetailsForm.value.svType,
      //   SVCategory: this.VariantDetailsForm.value.svCategory != null && this.VariantDetailsForm.value.svCategory !== undefined ? this.VariantDetailsForm.value.svCategory : 0,
      //   TaxCategory: this.VariantDetailsForm.value.taxCategory,
      //   JatoId: this.VariantDetailsForm.value.jatoId,
      //   HSNCode: this.VariantDetailsForm.value.hsnCode,
      //   WarrentyKM: this.VariantDetailsForm.value.km1,
      //   MaxKM: this.VariantDetailsForm.value.km2,
      //   RepVehicleSegmentId: this.VariantDetailsForm.value.replCarCategory,
      //   CRDCategory: this.VariantDetailsForm.value.carCategory,
      //   Mileage: this.VariantDetailsForm.value.millage,

      //   Dormant: this.VariantDetailsForm.value.dormant,
      //   ShadesArray: this.selectedShadesList,
      //   FeaturesArray: this.selectedFeaturesList,

      //   // IsOnline: ,
      //   // IsNotJATO: ,
      //   // Source: ,
      //   // Remarks: ,
      //   // ApprovedBy: ,
      //   // ApprovedOn: ,

      // };

      this.selecetdVariantData.ModifiedById = this.currentUser.UserId,

        this.selecetdVariantData.VariantName = this.VariantDetailsForm.value.variantName;
      this.selecetdVariantData.ModelId = this.VariantDetailsForm.value.modelType;
      this.selecetdVariantData.ManufacturerId = this.VariantDetailsForm.value.manufacturer;
      this.selecetdVariantData.EngineCapacity = this.VariantDetailsForm.value.engineCapacity;
      this.selecetdVariantData.Dimension = this.VariantDetailsForm.value.dimensions;
      this.selecetdVariantData.WarrentyYear = this.VariantDetailsForm.value.warranty;
      this.selecetdVariantData.BaseVariant = this.VariantDetailsForm.value.isBasevariant == true ? 1 : 0;
      this.selecetdVariantData.Consumption = this.VariantDetailsForm.value.consumption;
      this.selecetdVariantData.Bhp = this.VariantDetailsForm.value.bhp;
      this.selecetdVariantData.SeatCapacity = this.VariantDetailsForm.value.seatCapcity;
      this.selecetdVariantData.ProductId = this.VariantDetailsForm.value.objectType;
      this.selecetdVariantData.FuelId = this.VariantDetailsForm.value.fuelType;
      this.selecetdVariantData.IsHybrid = this.VariantDetailsForm.value.ishybrid == true ? 1 : 0;
      this.selecetdVariantData.FuelCapacity = this.VariantDetailsForm.value.fuelCapacity;
      this.selecetdVariantData.VehicleSegmentId = this.VariantDetailsForm.value.vehSegment;
      this.selecetdVariantData.TankType = this.VariantDetailsForm.value.fuelTankType;
      this.selecetdVariantData.FreeServiceId = this.VariantDetailsForm.value.freePaidMaintSchedule;
      this.selecetdVariantData.MaxTenure = this.VariantDetailsForm.value.maxTenure;
      this.selecetdVariantData.EmissionLevel = this.VariantDetailsForm.value.emissionLevel;
      this.selecetdVariantData.RvDeviation = this.VariantDetailsForm.value.rvDeviation;
      this.selecetdVariantData.RmtDeviation = this.VariantDetailsForm.value.rmtvDeviation;
      this.selecetdVariantData.GrossWeight = this.VariantDetailsForm.value.gvwKg;
      this.selecetdVariantData.TyreSize = this.VariantDetailsForm.value.tyreSize;
      this.selecetdVariantData.Transmission = this.VariantDetailsForm.value.transmType;
      this.selecetdVariantData.DriveType = this.VariantDetailsForm.value.driveType;
      this.selecetdVariantData.LengthCategory = this.VariantDetailsForm.value.Vlength;
      this.selecetdVariantData.GroundClearance = this.VariantDetailsForm.value.groundClearance;
      this.selecetdVariantData.CessPerc = parseFloat(this.VariantDetailsForm.value.cessPercent);
      this.selecetdVariantData.IsCess = this.VariantDetailsForm.value.isCess;
      this.selecetdVariantData.SVType = this.VariantDetailsForm.value.svType;
      this.selecetdVariantData.SVCategory = this.VariantDetailsForm.value.svCategory != null && this.VariantDetailsForm.value.svCategory !== undefined ? this.VariantDetailsForm.value.svCategory : 0;
      this.selecetdVariantData.TaxCategory = this.VariantDetailsForm.value.taxCategory;
      this.selecetdVariantData.JatoId = this.VariantDetailsForm.value.jatoId;
      this.selecetdVariantData.HSNCode = this.VariantDetailsForm.value.hsnCode;
      this.selecetdVariantData.WarrentyKM = this.VariantDetailsForm.value.km1;
      this.selecetdVariantData.MaxKM = this.VariantDetailsForm.value.km2;
      this.selecetdVariantData.RepVehicleSegmentId = this.VariantDetailsForm.value.replCarCategory;
      this.selecetdVariantData.CRDCategory = this.VariantDetailsForm.value.carCategory;
      this.selecetdVariantData.Mileage = this.VariantDetailsForm.value.millage;

      this.selecetdVariantData.Dormant = this.VariantDetailsForm.value.dormant;
      this.selecetdVariantData.ShadesArray = this.selectedShadesList;
      this.selecetdVariantData.FeaturesArray = this.selectedFeaturesList;

      let formData: FormData = new FormData();
      formData.append("RequestData", JSON.stringify(this.selecetdVariantData));

      this.spinner.show();
      this.clientService.updateVariant(formData).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.toaster.success("Variant Updated successfully", undefined, {
              positionClass: 'toast-top-center'
            });
            this.resetForm();
            this.spinner.hide();
            this.router.navigate(["/master-variant"], {
              state: {
                level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail
              }
            });
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
    this.VariantDetailsFormSubmitted = false;
    this.shadesFeaturesFormSubmitted = false;
    this.editMode = false;
    this.IsApproverView = false;
    this.isView = false;
    this.IsSvTypeSelected = false;
    this.VariantDetailsForm.reset(VariantDetailsDefaultValues);
    this.shadesFeaturesForm.reset(shadesFeaturesDefaultValues);
    this.VariantDetailsForm.markAllAsTouched();
    this.shadesFeaturesForm.markAllAsTouched();
  }

  onFuelTypeChange(event: any) {
    this.fuelTankType = event.value;
    if (this.fuelTankType) {
      this.VariantDetailsForm.get('fuelTankType')?.setValue(this.fuelTankType);

    } else {
      this.VariantDetailsForm.get('fuelTankType')?.setValue('');
    }
  }

  onSVTypeChange(event: any) {
    this.svType = event.value;
    this.VariantDetailsForm.get('svCategory')?.reset();
    if (this.svType) {
      this.VariantDetailsForm.get('svType')?.setValue(this.svType);
      if (this.svType != 1) {
        this.IsSvTypeSelected = true;
        this.VariantDetailsForm.get('svCategory')?.setValue(null);
      }
      else {
        this.IsSvTypeSelected = false;
        this.VariantDetailsForm.get('svCategory')?.setValue(null);
      }
    }
  }

  versionPageredirect() {
    this.router.navigate(["/audit-log"], {
      state: { level: this.AccessLevel, id: this.variantId, Name: this.selecetdVariantData.VariantName, moduleName: 'add-variant' }
    });
  }

  addModel() {
    this.router.navigate(["/master-model"], {
      state: { level: this.AccessLevel, IsAuditTrail: this.IsAuditTrail }
    });
  }

  filterApplied(event: any) {
    if (event) {
      this.selectedFilter = event;
      if (this.selectedFilter.filterName == 'Active' || this.selectedFilter.filterName == 'In Active') {
        this.getvariantSpecDetails();
      }
    }
    else {
      this.selectedFilter = { filterName: '' };
    }
  }

  // to search on the text input
  SearchFilterApplied() {
    this.IsSearch = this.searchText && this.searchText != '' ? true : false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.getvariantSpecDetails();
    }, 500);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sortState = sortState.active;
      this.sortDirection = sortState.direction;
      this.VariantsList = this.commonService.customSort(this.VariantsList, sortState.active, sortState.direction);
      this.variantTableList.renderRows();
    }
  }

  handlePage(event: any) {
    this.PageNumber = event.pageIndex + 1;
    this.PageSize = event.pageSize;
    this.getvariantSpecDetails();
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
    //1096560

    this.VariantsList = [];
    this.PageNumber = event.pageIndex;
    this.PageSize = event.pageSize;
    // this.variantSpecDetails();
    let startfrom = this.PageNumber;
    let startNumber = Number(startfrom * this.PageSize);
    let endNumber: number = 0;
    if (this.totalRecords > 9) {
      endNumber = startNumber + this.PageSize;
    } else {
      endNumber = this.totalRecords;
    }

    if (endNumber < this.totalRecords) {
      for (let i = startNumber; i < endNumber; i++) {
        this.VariantsList.push(this.AllVariants[i]);
      }
    } else {
      for (let i = startNumber; i < this.totalRecords; i++) {
        this.VariantsList.push(this.AllVariants[i]);
      }
    }


  }

  getvariantSpecDetails() {
    this.AllVariants = [];
    this.VariantsList = [];
    this.totalRecords = 0;
    if (this.VariantDetailsForm.value.jatoId != null && this.VariantDetailsForm.value.jatoId !== undefined && this.VariantDetailsForm.value.jatoId != '' && this.VariantDetailsForm.get('jatoId')?.status == 'VALID') {
      let data = {
        jatoId: this.VariantDetailsForm.value.jatoId, //1096560
        pageName: 'variant.aspx',
        SearchValue: this.searchText,
      }

      this.spinner.show();
      this.clientService.getvariantSpecDetails(data).subscribe((res: any) => {
        if (res) {
          if (!res.HasErrors) {
            this.AllVariants = res.Rows;
            this.totalRecords = this.AllVariants.length;
            this.pageClick({ pageIndex: 0, pageSize: 10 });
            this.spinner.hide();
          }
          else {
            this.toaster.error(res?.Errors[0]?.Message, undefined, {
              positionClass: 'toast-top-center'
            });
            this.spinner.hide();
          }
          this.spinner.hide();
        }
        (err: any) => {
          this.toaster.error(err, undefined, {
            positionClass: 'toast-top-center'
          });
          this.spinner.hide();
        }
      })
    }

  }

  cessPercent(event: any) {
    this.VariantDetailsForm.get('cessPercent')?.reset();
    if (event.checked) {
      this.VariantDetailsForm.get('cessPercent')?.setValidators(Validators.required);
      this.VariantDetailsForm.updateValueAndValidity();
    }
    else {
      this.VariantDetailsForm.get('cessPercent')?.setValidators(null);
      this.VariantDetailsForm.updateValueAndValidity();
    }
  }

  modelChanged(event: any) {
    this.VariantDetailsForm.get('manufacturer')?.setValue(event.ManufacturerId);
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

let VariantDetailsDefaultValues = {
  variantName: '',
  modelType: null,
  manufacturer: null,
  tyreSize: '',
  Vlength: null,
  transmType: null,
  driveType: null,
  freePaidMaintSchedule: null,
  vehSegment: null,
  groundClearance: '',
  cessPercent: '',
  isCess: false,
  engineCapacity: '',
  fuelTankType: 1,
  fuelType: null,
  ishybrid: false,
  fuelCapacity: '',
  dimensions: '',
  warranty: '',
  km1: '',
  isBasevariant: false,
  consumption: '',
  bhp: '',
  emissionLevel: null,
  replCarCategory: null,
  carCategory: null,
  seatCapcity: '',
  objectType: null,
  maxTenure: '',
  km2: '',
  svType: 1,
  svCategory: null,
  taxCategory: null,
  jatoId: '',
  hsnCode: '',
  rvDeviation: '',
  rmtvDeviation: '',
  gvwKg: '',
};

let shadesFeaturesDefaultValues = {
  shades: [],
  features: [],
};