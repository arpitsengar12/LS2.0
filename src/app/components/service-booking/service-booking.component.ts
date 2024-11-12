import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbService } from 'src/app/shared/Services/breadcrumb.service';
import { CommonService } from 'src/app/shared/Services/common.service';
import { ClientService } from '../client.service';
import { Location } from '@angular/common';

interface JobDetail {
  status: string;
  description: string;
}

interface ServiceBooking {
  BookingNumber: string;
  AssetNumber: string;
  RegNo: string;
  ChasisNo: string;
  ServiceType: string;
  ServiceDesc: string;
  CityName: string;
  ClientName: string;
  BookingPerson: string;
  Model: string;
  VariantName: string;
  BookingDate: string;
  BookingTime: string;
  LastKm: string;
  ServiceDone: string;
  ServiceDoneDate: string;
  requestServiceDate: string;
  isReplacementRequired: string;
  workshopName: string;
  bookingStatus: string;
  jobDetails: JobDetail[];
}

@Component({
  selector: 'app-service-booking',
  templateUrl: './service-booking.component.html',
  styleUrls: ['./service-booking.component.scss']
})
export class ServiceBookingComponent implements OnInit {
  displayedColumns: string[] = [
    'BookingNumber', 'AssetNumber', 'RegNo', 'ChasisNo', 'ServiceType', 'ServiceDesc',
    'CityName', 'ClientName', 'BookingPerson', 'Model', 'VariantName', 'BookingDate',
    'BookingTime', 'LastKm', 'ServiceDone', 'ServiceDoneDate', 'RequestServiceDate',
    'ReplacementRequired', 'WorkshopName', 'BookingStatus', 'JobDetails'
  ];
  
  selectedComponent: string = '';
  dataSource = new MatTableDataSource<ServiceBooking>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private breadcrumbService: BreadcrumbService,
    private commonService: CommonService,
    private clientService: ClientService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fetchServiceBookings();
  }

  fetchServiceBookings(): void {
  this.clientService.getservicebookingdetails('10058').subscribe(
      (response:any) => {
        console.log("API Response:", response); // Log the response
        if (response && response.results) {
          this.dataSource.data = response.results; 
        } else {
          this.toastr.error('No service bookings found.');
        }
      },
      (error) => {
        console.error('Error fetching service bookings:', error);
        this.toastr.error('Failed to load service bookings');
      }
    );
}


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  announceSortChange(sortState: Sort): void {
    // Implement sorting announcement if needed
  }

  goBack(): void {
    this.location.back();
  }

  modifyBooking(booking: ServiceBooking): void {
    // Implement modify logic
  }

  deleteBooking(booking: ServiceBooking): void {
    // Implement delete logic
  }

  addBooking(): void {
    // Implement add booking logic
  }

  voiceBooking(booking: ServiceBooking): void {
    // Implement voice command logic
  }
}
