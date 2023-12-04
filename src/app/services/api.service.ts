import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiRoot:string="https://sisgea.epsgrau.pe/SISGEA/app/";
  private headers: HttpHeaders;
  public MENSAJE_ERROR_REQUEST = "Ocurrió un error inesperado, por favor inténtelo más tarde";
  
  constructor(private http: HttpClient) {
   
   }

  getDatos(path: string) {
    let apiURL = `${this.apiRoot}${path}`;
        return this.http.get(apiURL);
  }
  getDatosSisgea(path: string) {
    let apiURL = `${this.apiRoot}${path}`;
        return this.http.get(apiURL);
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
    let apiURL = `${this.apiRoot}${path}`;
    return this.http.post(apiURL, data);
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
  
postFormData(path: string, formData: FormData) {
  let apiURL = path;
  const headers = new HttpHeaders({
    'Accept': 'application/json, text/plain, */*'
    
  });
  return this.http.post(apiURL, formData, { headers: headers });
}
  deleteDato(path: string) {
    let apiURL = `${this.apiRoot}${path}`;
    return this.http.delete(apiURL, { headers: this.headers });
  }
}
