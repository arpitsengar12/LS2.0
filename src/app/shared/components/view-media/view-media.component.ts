import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-media',
  templateUrl: './view-media.component.html',
  styleUrls: ['./view-media.component.scss']
})
export class ViewMediaComponent {
  constructor(public dialogRef: MatDialogRef<ViewMediaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }
}
