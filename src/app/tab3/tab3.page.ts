import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Provincia } from '../entidades/Provincia';
import { Distrito } from '../entidades/Distrito';
import { Ciclo } from '../entidades/Ciclo';
import { Ruta } from '../entidades/ruta';
import { HttpHeaders } from '@angular/common/http';
import { Impedimento } from '../entidades/impedimento';
import { Observacion } from '../entidades/observacion';
import { Periodo } from '../entidades/periodo';
import { PadronLectura } from '../entidades/padronLectuta';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { AlertController, InfiniteScrollCustomEvent, Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { ToastController } from '@ionic/angular';
import { Lectura } from '../entidades/lectura';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
ListaAvance :Avance []=[];
results: Avance[]=[];
dni:any;
nombreUser:any;
idUs:any;
lastIndexToShow = 20;
tipoUsuario:any;
  constructor(private platform: Platform,private http: HttpClient,public photoService: PhotoService,public alertController:AlertController,private loadingController: LoadingController, private toastController: ToastController,private router: Router) { 
   
  }
 

  ngOnInit() {
    
 
  }

  ionViewDidEnter() {
    this.nombreUser=localStorage.getItem('nombreUser');
    this.idUs=localStorage.getItem('idUsuario');
    this.tipoUsuario = localStorage.getItem('perfil');
    this.dni = localStorage.getItem('idUsuario');
    console.log(this.dni);
    this.http.get<any>('https://sisgeco.epsgrau.pe/SISGECO/servicioWeb/buscarPadronVisitaAvancePorIdPersonal/'+this.dni+'.htm')
    .subscribe(
      (response) => { 
      
        const jsonData = JSON.parse(response.data);
        console.log(response.data);
        this.ListaAvance=jsonData;
        console.log(this.ListaAvance);
        this.results=[...this.ListaAvance]
        this.loadMoreData();
      },
      (error) => {
        console.error(error);
      }
    );
  //   const js ={
  //     "data": "[{\"fecha\":\"14/09/2022\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO JUAN\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO PEDRO\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO JOSE\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO MARIA\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO ALEXIS\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"},{\"fecha\":\"14/09/2023\",\"idPersonal\":\"76937187\",\"latitud\":\"-5.190520775441408\",\"longitud\":\"-80.64199268567833\",\"nombreCompleto\":\"TRONCOS ROBLEDO PEPE\",\"numInscripcion\":76061631,\"observacion\":\"observacion de prueba \"}]",
  //     "id": 1,
  //     "mensaje": "SUMINISTRO ENCONTRADO",
  //     "parametroError": null
  //    }
  // const jsp = JSON.parse(js.data);
  // console.log(jsp);
  // this.ListaAvance= jsp;
  // this.results=[...this.ListaAvance]
  // this.loadMoreData();
    }

    buscadorListaAvances(event: any) {
      const query = event.target.value.toUpperCase();
      this.results = this.ListaAvance.filter(item => {
        // Comparar query con campo "fecha" y "nombreCompleto"
        return (
          item.fecha.includes(query) ||
          item.nombreCompleto.includes(query) ||
          item.numInscripcion.toString().includes(query) // Convierte numInscripcion a cadena
        );
      });
    }

    loadMoreData(event?: any) {

        // Verifica si hay más elementos para mostrar
        if (this.lastIndexToShow < this.ListaAvance.length) {
          // Incrementa el índice para mostrar los siguientes 5 elementos
          this.lastIndexToShow += 5;
    
          // Agrega los elementos al resultado para mostrarlos
          const additionalResults = this.ListaAvance.slice(0, this.lastIndexToShow);
          this.results = additionalResults;
    
          // Si se proporciona el evento del Infinite Scroll, completa el evento
          if (event) {
            event.target.complete();
          }
        } else {
          // Si no hay más elementos para mostrar, desactiva el Infinite Scroll
          if (event) {
            event.target.disabled = true;
          }
        }
     
    }
    
    
  

  async regresar(){ 
    this.router.navigate(['/tab4']);
  }


    
}

interface Avance{
 fecha:string;
 idPersonal:string;
 latitud: string;
 longitud:string;
 nombreCompleto:string;
 numInscripcion:string;
}