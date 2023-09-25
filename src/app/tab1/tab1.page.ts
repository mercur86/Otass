import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

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
  constructor(private http: HttpClient, private router: Router, private toastController: ToastController, public navCtrl: NavController, private loadingController: LoadingController) { }

  ionViewWillLeave() {

  }

  async login() {
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circular'
    });
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain;charset=ISO-8859-1',
    });
    
    const body = {
    }
    this.http.post<any>('https://sisgeco.epsgrau.pe/SISGECO/servicioWeb/iniciarSesionSisgeco.htm?id=' + this.username + '&contrasena=' + this.password, body,{headers})
      .subscribe(
        async (response) => {

          console.log(response);
        
          if (response.id == 1) {
      
            const jsonData = JSON.parse(response.data);
            console.log(jsonData);
            if (jsonData.idTipoProyectoOtass == 1) {
              this.idProvincia = response.idProvinciaAcceso;
              this.idUs = jsonData.idUsuario;
              const nombre = jsonData.nombreCompletoUsuario;
              const actividades = jsonData.listaTbProyectoOtassActividad;
              console.log('**');
              console.log(actividades);
              localStorage.setItem('actividades', JSON.stringify(actividades));
              localStorage.setItem('perfil', jsonData.nombreProyectoOtass);
              localStorage.setItem('provincia', jsonData.desProvinciaProyectoOtassZonal);
              localStorage.setItem('distrito', jsonData.desDistritoProyectoOtassZonal);
              localStorage.setItem('idUsuario', this.idUs);
              localStorage.setItem('nombreUser', nombre);
              this.mostrarToast(response.mensaje, 'success');
              this.router.navigate(['/tab4']);
              loading.dismiss();
            }
          } else if (response.id == 2) {
            this.mostrarToast(response.mensaje, 'danger');
            loading.dismiss();
          } else if (response.id == 3) {
            this.mostrarToast(response.mensaje, 'danger');
          }
        },
        (error) => {
          console.error(error);
        }
      );

  }

  async mostrarToast(mensaje: any, color: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    toast.present();

  }

}
