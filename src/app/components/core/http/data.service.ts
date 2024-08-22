import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
declare var settings: any;
@Injectable({
  providedIn: 'root'
})
export class DataService {

  baseUrl = settings.api;
  baseUrltest = settings.apitest;
  ar = settings.artoken;
  constructor(private http: HttpClient) {
        this.baseUrl = settings.api;
    this.baseUrltest = settings.apitest;
   }

  postDataLogin(url: any, formData: FormData): Observable<any> {
    // const headers = new HttpHeaders().set("Content-Type", "application/json");
    // return this.http
    //   .post(this.baseUrl + url, JSON.stringify(data), { headers: headers })
    //   .pipe(
    //     catchError((err: HttpErrorResponse) => {
    //       return throwError(err);
    //     })
    //   );

    // Make the POST request with the FormData
    return this.http.post(this.baseUrl + url, formData);
  }

  postDataLoginFirebase(url: any, formData: FormData): Observable<any> {
    return this.http
      .post(this.baseUrl + url, formData, this.getFormDataHeader())
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  getData(url: any): Observable<any> {
    return this.httpRequest(
      this.http.get(this.baseUrl + url, this.getHttpHeader())
    );
  }

  getData1(url: any): Observable<any> {
    return this.httpRequest(
                this.http.get(this.baseUrltest + url, this.getFormDataHeaderService())
    );
  }

  deleteData(url: any): Observable<any> {
    return this.httpRequest(
      this.http.delete(this.baseUrl + url, this.getHttpHeader())
    );
  }

  postFormData(url: string, formData: FormData): Observable<any> {
    // Make the POST request with the FormData
    return this.http.post(this.baseUrl + url, formData, this.getFormDataHeader());
  }

  putFormData(url: string, formData: FormData): Observable<any> {
    // Make the PUT request with the FormData
    return this.http.put(this.baseUrl + url, formData, this.getFormDataHeader());
  }

  postData(url: any, data: any): Observable<any> {
    return this.httpRequest(
      this.http.post(
        this.baseUrl + url,
        JSON.stringify(data),
        this.getHttpHeader()
      )
    );
  }

  private getFormDataHeaderService(): { headers: HttpHeaders } {
    const username = 'SalesForce';
    const password = 'SFCrm@!9@-#$J';
    const basicAuth = btoa(`${username}:${password}`);
  
    return {
      headers: new HttpHeaders()
        .set("Authorization", `Basic ${basicAuth}`)
        .set("Cache-control", "no-cache")
        .set("Cache-control", "no-store")
        .set("Expires", "0")
        .set("Pragma", "no-cache")
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        .set(
          "Access-Control-Allow-Headers",
          "Origin, Content-Type, X-Auth-Token"
        )
   
        .set("X-XSS-Protection", "1")
        .set("mode", "block")
        .set("X-Content-Type-Options", "nosniff")
        .set("Content-Security-Policy", "frame-ancestors 'self'")
        .set("X-Frame-Options", "deny ")
        .set(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains"
        )
        .set(
          "Content-Type","application/json"
        )
    };
  }
  
  

  private getFormDataHeader(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders()
        .set("Authorization", `Bearer ${sessionStorage.getItem("AccessToken")}`)
        // .set("Content-Type", "application/json")
        .set("Cache-control", "no-cache")
        .set("Cache-control", "no-store")
        .set("Expires", "0")
        .set("Pragma", "no-cache")
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        .set(
          "Access-Control-Allow-Headers",
          "Origin, Content-Type, X-Auth-Token"
        )
        .set("X-XSS-Protection", "1")
        .set("mode", "block")
        .set("X-Content-Type-Options", "nosniff")
        .set("Content-Security-Policy", "frame-ancestors 'self'")
        .set("X-Frame-Options", "deny ")
        .set(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains"
        )
      // .set("ar", "5e3d803410d9620e488249eb")
    };
  }
  private getHttpHeader(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders()
        .set("Authorization", `Bearer ${sessionStorage.getItem("AccessToken")}`)
        .set("Content-Type", "application/json")
        .set("Cache-control", "no-cache")
        .set("Cache-control", "no-store")
        .set("Expires", "0")
        .set("Pragma", "no-cache")
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        .set(
          "Access-Control-Allow-Headers",
          "Origin, Content-Type, X-Auth-Token"
        )
        .set("X-XSS-Protection", "1")
        .set("mode", "block")
        .set("X-Content-Type-Options", "nosniff")
        .set("Content-Security-Policy", "frame-ancestors 'self'")
        .set("X-Frame-Options", "deny ")
        .set(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains"
        )
      // .set("ar", "5e3d803410d9620e488249eb")
    };
  }

  private httpRequest(response: Observable<Object>): Observable<Object> {
    return response.pipe(tap(() => { }));
  }
}

