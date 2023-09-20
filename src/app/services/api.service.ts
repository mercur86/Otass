import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiRoot: string = "https://sisgeco.epsgrau.pe/sisgeco-ws/sisgeco/app/v1/";
  
  //private apiRootSisgea:string="http://localhost:8099/SISGEA/app/";
  private apiRootSisgea:string="https://sisgea.epsgrau.pe/SISGEA/app/";
  //private apiRoot: string= "https://sisgeco.epsgrau.pe/sisgeco-ws/problema/"
  private headers: HttpHeaders;
  private headersSisgea: HttpHeaders;
  private headersMultiPart: HttpHeaders;
  public MENSAJE_ERROR_REQUEST = "Ocurrió un error inesperado, por favor inténtelo más tarde";
  
  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json, text/plain, */*'
  });
  this.headersSisgea = new HttpHeaders({
    'Accept': 'application/json, text/plain, */*'
});

  this.headersMultiPart = new HttpHeaders({
      'Accept': 'application/json, text/plain, */*'
  });
   }

  getDatos(path: string) {
    let apiURL = `${this.apiRoot}${path}`;
        return this.http.get(apiURL, { headers: this.headers });
  }
  getDatosSisgea(path: string) {
    let apiURL = `${this.apiRootSisgea}${path}`;
        return this.http.get(apiURL, { headers: this.headersSisgea });
  }
  getDatosConToken(path: string, token: any) {
    let apiURL = `${this.apiRoot}${path}`;
    let headersWithToken = this.headers.set('x-auth-token', token);
    return this.http.get(apiURL, { headers: headersWithToken });
  }

  postDatos(path: string, data: any = {}) {
    let apiURL = `${this.apiRoot}${path}`;
    return this.http.post(apiURL, data, { headers: this.headers });
  }

  postDatosSisgea(path: string, data: any = {}) {
    let apiURL = `${this.apiRootSisgea}${path}`;
    return this.http.post(apiURL, data, { headers: this.headersSisgea });
  }

  postDatosConToken(path: string, data: any = {},token:any) {
    let apiURL = `${this.apiRoot}${path}`;
    let headersWithToken = this.headers.set('x-auth-token', token);
    return this.http.post(apiURL, data, { headers: headersWithToken });
  }

  postArchivo(path: string, formData: FormData, token: any) {
    let apiURL = `${this.apiRoot}${path}`;
    const headers = new HttpHeaders({
      'Accept': 'application/json, text/plain, */*',
      'x-auth-token': token
    });
    return this.http.post(apiURL, formData, { headers: headers });
}
  
  deleteDato(path: string) {
    let apiURL = `${this.apiRoot}${path}`;
    return this.http.delete(apiURL, { headers: this.headers });
  }
}
