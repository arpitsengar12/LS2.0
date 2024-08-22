import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleService {

  private isToggled = new BehaviorSubject<boolean>(false);
  private showSidebar = new BehaviorSubject<boolean>(false);

  get isToggled$() {
    return this.isToggled.asObservable();
  }

  get showSidebar$() {
    return this.showSidebar.asObservable();
  }

  toggle() {
    this.isToggled.next(!this.isToggled.value);
  }

  toggleSidebar() {
    this.showSidebar.next(!this.showSidebar.value);
  }
}