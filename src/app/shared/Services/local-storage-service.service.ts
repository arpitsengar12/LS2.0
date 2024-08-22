import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageServiceService {

  constructor() { }
  
  //set Item
  setItem(key: string, value: any) {
    localStorage.setItem(key, value);
  }

  // get Item
  getItem(key: string) {
    return localStorage.getItem(key);
  }

  // remove Item
  removeItem(key: string) {
    return localStorage.removeItem(key);
  }

}
