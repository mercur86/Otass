import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { PhotoService } from '../services/photo.service';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Actividades } from '../entidades/Actividades';



@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  periodoInput?:string;
  anio?:string;
  mes?:string;
  suministro?:any;
  nombre?:any='';
  direccion?:any;
  latitud?:any;
  longitud?:any;
  observacion: string = '';
  sgrabar?=false;
  idUs?:any;
  listaActividades:Actividades[]=[];
selectedActividad : any;
 watchId:any; // para geolocalizar
usuarioId:any;
uri:string ='https://sisgeco.epsgrau.pe/sisgeco-ws/sisgeco/app/v1';
tipoUsuario?:any;
nombreUser:any;
provincia:any;
distrito:any;
codCatastral:any;
bas64:any;
public photos: UserPhoto[] = [];
  constructor(private http: HttpClient,
    private loadingController: LoadingController, 
    private toastController: ToastController,
    public photoService: PhotoService,
    public alertController:AlertController,
    private router: Router,
    private apiService:ApiService) {
   }

 

  ngOnInit() {
    this.obtenerCoordenadasGPS();
  }


  ionViewDidEnter() {
    this.nombreUser=localStorage.getItem('nombreUser');
    this.idUs=localStorage.getItem('idUsuario');
    this.tipoUsuario = localStorage.getItem('perfil');
    const actividades = localStorage.getItem('actividades');
    this.provincia= localStorage.getItem('provincia');
    this.distrito= localStorage.getItem('distrito');
    if (actividades) {
    this.listaActividades = JSON.parse(actividades);
      // Hacer algo con los datos almacenados en el array 'impedimentosArray'
    }
  }
  
  
  async addPhotoToGallery() {
    //this.photoService.addNewToGallery();
    this.obtenerCoordenadasGPS();
   if(await this.photoService.addNewToGallery()){
    console.log("foto tomada");
    this.sgrabar=true;
    const files = await this.convertPhotosToFiles();
   this.bas64= await this.convertFilesToBase64(files);
    console.log(this.bas64);
    
   }
  }

  async obtenerCoordenadasGPS() {
    try {
      this.watchId = Geolocation.watchPosition({ enableHighAccuracy: true }, async (position, error) => {
        if (position) {
          const latitude = position.coords.latitude;
          this.latitud=latitude;
          const longitude = position.coords.longitude;
          this.longitud=longitude;
          // Realizar acciones con las coordenadas obtenidas
          console.log('Latitud:', latitude);
          console.log('Longitud:', longitude);

        } else if (error) {
          console.error('Error al obtener las coordenadas GPS:', error);
          const toast = await this.toastController.create({
            message: 'Error al obtener las coordenadas GPS',
            duration: 5000,
            color: 'danger'
          });
          toast.present();
        }
      });
    } catch (error) {
      console.error('Error al iniciar la captura continua de coordenadas:', error);
      const toast = await this.toastController.create({
        message: 'Error al iniciar la captura continua de coordenadas',
        duration: 5000,
        color: 'danger'
      });
      toast.present();
    }
  }

  subirFotos(){

    const body={
      archivoBase64Original: this.bas64[0],
    }
    this.http.post<any>('https://sisgeco.epsgrau.pe/SISGECO/servicioWeb/subirArchivo2.htm',body)
    .subscribe(
      (response) => { 
          console.log(response.mensaje);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async guardarMorososActivos() {
    console.log('select campturado: '+ this.selectedActividad);
    if(this.nombre){
      if(this.selectedActividad==''){
      const loading = await this.loadingController.create({
        message: 'Cargando datos...',
        spinner: 'crescent'
      });
      await loading.present();

      const body={
        archivoBase64Original: this.bas64[0],
      }
      // this.http.post<any>('https://sisgeco.epsgrau.pe/SISGECO/servicioWeb/registrarVisitaProyectoOtass/'+this.suministro+'/'+this.longitud+'/'+this.latitud+'/'+this.idUs+'/'+this.nombreUser+'/'+this.selectedActividad+'/'+this.observacion+'.htm',body)
      this.http.post<any>('https://6nz7pqzj-8080.brs.devtunnels.ms/SistemaComercialEPS/servicioWeb/registrarVisitaProyectoOtass/'+this.suministro+'/'+this.longitud+'/'+this.latitud+'/'+this.idUs+'/'+this.nombreUser+'/'+this.selectedActividad+'/'+this.observacion+'.htm',body)
      .subscribe(
        async (response) => { 
          loading.dismiss();
          console.log(response);
         // this.subirFotos();
          const toast = await this.toastController.create({
            message: 'grabado correctamente',
            duration: 5000,
            color: 'success'
          });
          toast.present();
          this.limpiar();
         this.presentAlertPersonalizado('Notificado Correctamente');
        },
        async (error) => {
          loading.dismiss();
          console.error(error);
          const toast = await this.toastController.create({
            message: 'Error en la conexión.',
            duration: 5000,
            color: 'danger'
          });
          toast.present();
          
        }
      );
    }else{
      this.presentAlertPersonalizado('Debes seleccionar una actividad');
    
    }
    }else{
      this.presentAlertPersonalizado('Debes Cargar un suministro');
    }
  
    }
  

    async presentAlertPersonalizado(mensaje:any) {
      const alert = await this.alertController.create({
        header: 'ALERTA',
        message: mensaje,
       
      });
      await alert.present();
    }
  
  

  limpiar() {
    console.log("ingreso a limpiar");
    // Establecer todas las variables utilizadas en los campos en blanco
    this.suministro = '';
    this.observacion = '';
    this.nombre='';
    this.direccion='';
    this.photoService.photos=[];
    this.suministro='';
    this.provincia='',
    this.distrito='',
    this.codCatastral='',
    this.sgrabar=false;
   // this.selectedRuta=null;
  }

  getFormattedDate(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Agrega un cero inicial si es necesario
    let day = String(currentDate.getDate()).padStart(2, '0'); // Agrega un cero inicial si es necesario 
    // Formato: 'dd/MM/yyyy'
    const formattedDate = `${day}/${month}/${year}`;
  
    return formattedDate;
  }

  getPeriodo() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString(); // Se agrega 1 ya que los meses en JavaScript son indexados desde 0
  
    this.anio = currentYear;
    this.mes = currentMonth;
    let mesA = parseInt(this.mes + "");
    let anioA = parseInt(this.anio + "");
    if (mesA == 12) {
      anioA = anioA + 1;
      this.anio = anioA + "";
    } else {
      mesA = mesA + 1;
      this.mes = mesA + "";
    }
    this.periodoInput = this.mes + "/" + this.anio;
  }
  

  public convertPhotosToFiles(): Promise<File[]> {
    const photoPromises = this.photoService.photos.map(photo => {
      if (photo.webviewPath) {
        return fetch(photo.webviewPath)
          .then(response => response.blob())
          .then(blob => {
            const filename = this.getFilenameFromPath(photo.webviewPath);
            return new File([blob], filename);
          });
      } else {
        return Promise.reject('webviewPath is undefined');
      }
    });
  
    return Promise.all(photoPromises);
  }

  public getPhotosArray(): UserPhoto[] {
    return this.photoService.photos;
  }

  private getFilenameFromPath(path: any): string {
    const startIndex = path.lastIndexOf('/') + 1;
    return path.substring(startIndex);
  } 

  public async convertFilesToBase64(files: File[]): Promise<string[]> {
    const base64Promises = files.map(file => {
      return this.convertFileToBase64(file);
    });

    return Promise.all(base64Promises);
  }
  

  private async convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('No se pudo convertir el archivo a Base64.');
        }
      };

      reader.readAsDataURL(file);
    });
  }
  

  
  public async buscar(event: any) {
    const query = parseInt(event.target.value, 10); // El segundo argumento (10) especifica la base numérica (decimal).
    if (!isNaN(query)) {
     this.suministro=query;
     this.usuarioId= localStorage.getItem('idUsuario');
    console.log("suministro: "+this.suministro);
    console.log("id ususario: "+this.usuarioId);
    console.log("año en buscar"+this.anio);
    console.log("mes en buscar"+this.mes);
    localStorage.setItem('suministro',this.suministro);
    this.http.get<any>('https://sisgeco.epsgrau.pe/SISGECO/servicioWeb/buscarSuministro/'+this.suministro+'.htm ')
    .subscribe(
      (response) => { 
      
        const jsonData = JSON.parse(response.data);
        console.log(jsonData);
        this.nombre=jsonData.nombreCliente;
        this.direccion=jsonData.direccionPredio;
        this.codCatastral=jsonData.codigoCatastral;
        this.provincia=jsonData.desProvincia;
        this.distrito=jsonData.desDistrito;
      },
      (error) => {
        console.error(error);
      }
    );
  
  }
  }

    
  async regresarToLogin(){ 
    localStorage.clear();
    this.router.navigate(['/tab1']);
  }

  async avanceNotificacion(){ 
    this.router.navigate(['/tab3']);
    
  }
  onActividadSelect(event: any) {
    console.log(event);//realizar una accion al seleccionar un select 
  }

} 

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}