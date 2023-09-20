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
  
  username?: string="";
  password?: string="";
  idProvincia?: any;
  public token?: any;
  idUs?: any;
  constructor(private http: HttpClient, private router: Router, private toastController: ToastController, public navCtrl: NavController,private loadingController: LoadingController) {}
 
  ionViewWillLeave() {
   
  }
  
  async login() {
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circular'
    });
    await loading.present();
  
    try {
      //localStorage.clear();
      const body = {
        usuarioId: this.username,
        clave: this.password
      };
  
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
  
      const response: any = await this.http.post('https://sisgeco.epsgrau.pe/sisgeco-ws/sisgeco/app/v1/usuarios/logueo', body, { headers: headers }).toPromise();
  
      console.log(response);
     // localStorage.clear();
      const rolesUsuario = response.rolesUsuario;
      if (rolesUsuario.includes('PERFIL_MED')) {
        this.idProvincia = response.idProvinciaAcceso;
        this.token = response.token;
        this.idUs = response.idUsuario;
        const nombre = response.nombreCompletoUsuario;
        localStorage.setItem('perfil','PERFIL NOTIFICADOR');
        localStorage.setItem('token', this.token);
        localStorage.setItem('idProvinciaAcceso', this.idProvincia);
        localStorage.setItem('idUsuario', this.idUs);
        localStorage.setItem('nombreUser',nombre);
        this.router.navigate(['/tab4']);
      } else if(rolesUsuario.includes('PERFIL_LECTURADOR')){
        localStorage.setItem('perfil','PERFIL LECTURADOR');
        this.router.navigate(['/tabs/tab5']);
      } else {
        console.error('Usuario no tiene permiso para acceder.');
        const toast = await this.toastController.create({
          message: '¡Usuario no tiene permiso para acceder!',
          duration: 3000,
          color: 'warning'
        });
        toast.present();
      }
    } catch (error:any) {
      console.error(error);
      console.log(error.error);
      if (error.status === 0) {
        // No hay conexión a internet
        const toast = await this.toastController.create({
          message: 'Sin conexión a internet o servidor no responde',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      } else if (error.status === 401){
        // Credenciales incorrectas o usuario no existe
        const toast = await this.toastController.create({
          message: 'Credenciales incorrectas o usuario no existe',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    } finally {
      await loading.dismiss();
    }
  }
  
}
