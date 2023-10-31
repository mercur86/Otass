import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UtilServices } from '../services/utils.service';
import { environment } from 'src/environments/environment.prod';
import { Device } from '@capacitor/device';
import { InformacionDispositiboMovil } from '../entidades/InformacionDispositiboMovil';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  username?: string = "";
  password?: string = "";
  idProvincia?: any;
  idUs?: any;
  showPassword = false;
  tipoMovimiento = 1;
  informacionDispositiboMovil: InformacionDispositiboMovil;
  observacion: any = '';
  urlDescargaApp: string;
  constructor(private http: HttpClient,
    private router: Router,
    public navCtrl: NavController,
    private utils: UtilServices,
  ) { }

  async ngOnInit() {
    this.logDeviceInfo();
  }
  ionViewWillLeave() {

  }
  public login() {
    this.http.get<any>(environment.ROOTAPI + 'iniciarSesionSisgeco.htm?id=' + this.username + '&contrasena=' + this.password + '&versionApp=' + environment.VERSIONAPP)
      .subscribe({
        next: response => {
          console.log(response);
          if (response.id == 1) { // respuesta de exito
            const jsonData = JSON.parse(response.data);
            console.log(jsonData);
            if (jsonData.idProyectoOtass == 3) {
              this.idProvincia = response.idProvinciaAcceso;
              this.idUs = jsonData.idUsuario;
              const nombre = jsonData.nombreCompletoUsuario;
              const actividades = jsonData.listaActividades;
              localStorage.setItem('idProyectoOtass', jsonData.idProyectoOtass);
              localStorage.setItem('idProyectoOtassZonal', jsonData.idProyectoOtassZonal);
              localStorage.setItem('actividades', JSON.stringify(actividades));
              localStorage.setItem('perfil', jsonData.nombreProyectoOtass);
              localStorage.setItem('provincia', jsonData.desProvinciaProyectoOtassZonal);
              localStorage.setItem('distrito', jsonData.desDistritoProyectoOtassZonal);
              localStorage.setItem('idUsuario', this.idUs);
              localStorage.setItem('nombreUser', nombre);
              localStorage.setItem('rol', 'MOROSOS');
              //this.utils.mostrarToast(response.mensaje,2000,'success');
              this.router.navigate(['tabs/tab4']);
              this.utils.closeLoader();
              this.observacion = response.mensaje;
            } else if (jsonData.idProyectoOtass == 4) {
              this.idProvincia = response.idProvinciaAcceso;
              this.idUs = jsonData.idUsuario;
              const nombre = jsonData.nombreCompletoUsuario;
              const actividades = jsonData.listaTbProyectoOtassActividad;
              localStorage.setItem('idProyectoOtass', jsonData.idProyectoOtass);
              localStorage.setItem('idProyectoOtassZonal', jsonData.idProyectoOtassZonal);
              localStorage.setItem('actividades', JSON.stringify(actividades));
              console.log('estoy en consumo promedio');
              localStorage.setItem('perfil', jsonData.nombreProyectoOtass);
              localStorage.setItem('provincia', jsonData.desProvinciaProyectoOtassZonal);
              localStorage.setItem('distrito', jsonData.desDistritoProyectoOtassZonal);
              localStorage.setItem('idUsuario', this.idUs);
              localStorage.setItem('nombreUser', nombre);
              localStorage.setItem('rol', 'CONSUMO');
              //this.utils.mostrarToast(response.mensaje,2000,'success');
              this.router.navigate(['tabs/tab4']);
              this.utils.closeLoader();
              this.observacion = response.mensaje;
            }

          } else if (response.id == 2) { // respuesta de excepcion controlada

            const text = response.mensaje;
            const linkRegex = /https?:\/\/[^\s]+/;

            const linkMatch = text.match(linkRegex);
            const link = linkMatch ? linkMatch[0] : '';
            if (link) {
              this.downloadFile(link);
              const text = response.mensaje;
              const linkRegex = /https?:\/\/[^\s]+/
              const match = text.match(linkRegex);
              let message = text;
              if (match) {
                const linkStartIndex = text.indexOf(match[0]);
                if (linkStartIndex !== -1) {
                  message = text.substring(0, linkStartIndex);
                }
              }
              this.observacion=message;
              console.log(message); // Imprime el mensaje primero
            } else {
              this.observacion = response.mensaje;
            }
            this.utils.mostrarToast(response.mensaje, 3000, 'danger');
            this.utils.closeLoader();
            this.tipoMovimiento = 2;

          } else if (response.id == 3) { // respuesta de excepcion controlada
            this.observacion = response.mensaje;
            this.utils.mostrarToast(response.mensaje, 3000, 'danger');
            this.utils.closeLoader();
            this.tipoMovimiento = 2;

          }
        },
        error: error => {
          this.utils.mostrarToast(JSON.stringify(error), 2000, 'danger');
          this.utils.closeLoader();
          console.error(error);
        },
        complete: async () => {
          console.log('Solicitud completada. login');

          const logMovimientos = {
            idUs: this.idUs,
            tipoMovimiento: this.tipoMovimiento,
            idCelular: this.informacionDispositiboMovil.identifier,
            ipCelular: await this.obtenerIP(),
            modeloCelular: this.informacionDispositiboMovil.model,
            versionOS: this.informacionDispositiboMovil.osVersion,
            observacion: this.observacion

          }
          localStorage.setItem('logMovimientos', JSON.stringify(logMovimientos));
          this.enviarInformacionDispositivo(this.username, this.tipoMovimiento, this.informacionDispositiboMovil.identifier, logMovimientos.ipCelular, this.informacionDispositiboMovil.model, this.informacionDispositiboMovil.osVersion, this.observacion);
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  enviarInformacionDispositivo(idUs: any, tipoMovimiento: any, idCelular: any, ipCelular: any, modeloCelular: any, versionOs: any, observacion: any) {
    this.http.get(environment.ROOTAPI + 'registrarAppInOut/' + idUs + '/' + tipoMovimiento + '/' + idCelular + '/' + ipCelular + '/' + modeloCelular + '/' + versionOs + '/' + observacion + '.htm').subscribe({
      next: response => {
        console.log(response);
      },
      error: error => {
        console.log(JSON.stringify(error));
      },
      complete: () => {
        console.log('Solicitud completada. registrar info device');
      },
    })
  }


  // verificacVersion(): boolean { // devuelve verdadero si es necesario actualizar 
  //   const version = 0;
  //   const versionLocal = environment.VERSIONAPP
  //   if (version > versionLocal) {
  //     return true;
  //   } else {
  //     return false
  //   }
  // }


  logDeviceInfo = async () => {
    const info = await Device.getInfo();
    const idDevice = await Device.getId();
    const infoFinal = {
      model: info.model,
      osVersion: info.osVersion.substring(8),
      identifier: idDevice.identifier
    }
    this.informacionDispositiboMovil = infoFinal;
    console.log(infoFinal);

  }


  async obtenerIP() {
    return new Promise<string>((resolve, reject) => {
      this.http.get<any>('https://api.ipify.org/?format=json').subscribe({
        next: (response) => {
          resolve(response.ip);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  downloadFile = async (url: any) => {
    await Browser.open({ url: url });
  };

}
