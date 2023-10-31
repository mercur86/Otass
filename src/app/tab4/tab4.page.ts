import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { Actividades } from '../entidades/Actividades';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Barcode, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { UtilServices } from '../services/utils.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  //qr 

  isSupported = false;
  barcodes: Barcode[] = [];
  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });
  //
  periodoInput?: string;
  anio?: string;
  mes?: string;
  suministro?: any;
  nombre?: any = '';
  direccion?: any;
  latitud?: any;
  longitud?: any;
  observacion: string = '';
  sgrabar?= false;
  idUs?: any;
  listaActividades: Actividades[] = [];
  lectura: number = 0;
  ultimaLectura: any;
  selectedActividad: any;
  watchId: any; // para geolocalizar
  usuarioId: any;
  tipoUsuario?: any;
  nombreUser: any;
  provincia: any;
  distrito: any;
  provinciaUser: any;
  distritoUser: any;
  codCatastral: any;
  bas64: any;
  rol: any;
  rolMorosos = false;
  rolConsumo = false;
  categoria: any;
  fechaUltimaLectura: any;
  idProyectoOtass: any;
  idProyectoOtassZonal: any;
  acuary = true;
  logMovimientos: any;
  // data qr
  ocultarSelectActividad = false;
  idActivida: any;
  descActividad: any;
  flagQR = false;
  public photos: UserPhoto[] = [];
  constructor(
    private http: HttpClient,
    public photoService: PhotoService,
    public alertController: AlertController,
    private router: Router,
    private utils: UtilServices) {
  }

  async ngOnInit() {
    this.obtenerCoordenadasGPS();
    // Check if module is available
    if (await this.isGoogleBarcodeScannerModuleAvailable()) {
      // this.utils.mostrarToast('modulo ya se encuentra  nstalado',100,'success');
    }
    else {
      this.utils.mostrarToast('instalando....', 3000, 'warning');
      // Module not installed, install it
      await this.installGoogleBarcodeScannerModule();
    }
  }


  async ionViewDidEnter() {
    this.rol = localStorage.getItem('rol');
    if (this.rol == 'MOROSOS') {
      this.rolMorosos = true;
    } else if (this.rol == 'CONSUMO') {
      this.rolConsumo = true;
    }
    this.idProyectoOtass = localStorage.getItem('idProyectoOtass');
    this.idProyectoOtassZonal = localStorage.getItem('idProyectoOtassZonal');
    this.nombreUser = localStorage.getItem('nombreUser');
    this.idUs = localStorage.getItem('idUsuario');
    this.tipoUsuario = localStorage.getItem('perfil');
    const actividades = localStorage.getItem('actividades');
    this.provinciaUser = localStorage.getItem('provincia');
    this.distritoUser = localStorage.getItem('distrito');
    const log = localStorage.getItem('logMovimientos') || '';
    this.logMovimientos = JSON.parse(log);
    console.log(this.logMovimientos);
    if (actividades) {
      this.listaActividades = JSON.parse(actividades);
      // Hacer algo con los datos almacenados en el array 'impedimentosArray'
    }
    //await this.printCurrentPosition();
  }

  ionViewDidLeave() {// se ejecuta al salir del componente

  }
  isGoogleBarcodeScannerModuleAvailable = async () => {
    const { available } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    return available;
  };

  installGoogleBarcodeScannerModule = async () => {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  };

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }


  async scan(): Promise<void> {
    this.obtenerCoordenadasGPS();
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
    const objParse = JSON.parse(barcodes[0].rawValue)
    this.suministro = objParse.numInscripcion;
    this.selectedActividad = objParse.idActividad;
    this.descActividad = objParse.desActividad;

    const tipoBusqueda = 1;
    this.obtenerDatosSuministro(this.suministro, tipoBusqueda);
    localStorage.setItem('suministro', this.suministro);
  }

  async addPhotoToGallery() {
    //this.photoService.addNewToGallery();
    //this.obtenerCoordenadasGPS();
    if (await this.photoService.addNewToGallery()) {
      console.log("foto tomada");
      this.sgrabar = true;
      const files = await this.convertPhotosToFiles();
      this.bas64 = await this.convertFilesToBase64(files);
      console.log(this.bas64);

    }
  }
  async printCurrentPosition() {
    const options = {
      enableHighAccuracy: true,
      timeout: 4000,
      maximumAge: 2000
    }
    this.utils.loader();
    const coordinates = await Geolocation.getCurrentPosition(options);
    this.latitud = coordinates.coords.latitude;
    this.longitud = coordinates.coords.longitude;
    console.log('Current position:', coordinates);
    this.utils.closeLoader();

  };

  async obtenerCoordenadasGPS() {
    try {
      const options = {
        enableHighAccuracy: this.acuary,
        timeout: 4000,
        maximumAge: 2000
      }
      this.watchId = Geolocation.watchPosition(options, async (position, error) => {
        if (position) {
          // console.log(position);
          const latitude = position.coords.latitude;
          this.latitud = latitude;
          const longitude = position.coords.longitude;
          this.longitud = longitude;
          // Realizar acciones con las coordenadas obtenidas
          console.log('Latitud:', latitude, 'longitud:', longitude);


        } else if (error) {
          console.error('Error al obtener las coordenadas GPS:', error);
          this.utils.mostrarToast('Error al obtener las coordenadas GPS ', 5000, 'danger');
        }
      });
    } catch (error) {
      console.error('Error al iniciar la captura continua de coordenadas', error);
      this.utils.mostrarToast('Error al obtener las coordenadas GPS ', 5000, 'danger');
    }
  }


  async guardarActividad() {
    if (this.nombre) {
      if (this.selectedActividad) {
        if (this.bas64) {
          this.utils.loader(); // carga el loader de espera 
          const body = {
            archivoBase64Original: this.bas64[0],
          }
          if (this.observacion != '') { }
          this.http.post<any>(environment.ROOTAPI + 'registrarVisitaProyectoOtass/' + this.suministro + '/' + this.longitud + '/' + this.latitud + '/' + this.idUs + '/' + this.nombreUser + '/' + this.idProyectoOtass + '/' + this.idProyectoOtassZonal + '/' + this.selectedActividad + '/' + this.lectura + '/' + this.flagQR + '/' + this.observacion + '.htm', body)
            .subscribe({
              next: response => {
                if (response.id == '1') {
                  this.utils.closeLoader();
                  //this.utils.mostrarToast(response.mensaje, 1000, 'success');
                  this.limpiar();
                  this.utils.presentAlertPersonalizado('INFO.', 'Notificado Correctamente');
                } else if (response.id == '2') {
                  console.error(response.mensaje);
                  this.utils.closeLoader();
                  this.utils.mostrarToast(response.mensaje, 5000, 'danger');
                } else if (response.id == '3') {
                  console.error(response.mensaje);
                  this.utils.closeLoader();
                  this.utils.mostrarToast(response.mensaje, 5000, 'danger');
                }

              },
              error: error => {
                this.utils.closeLoader();
                console.error(error);
                this.utils.mostrarToast(JSON.stringify(error), 5000, 'danger');

              },
              complete: () => {
                console.log('consumo completado');
              },
            });

        } else {
          this.utils.presentAlertPersonalizado('ALERTA', 'Debe tomar una foto');
        }
      } else {
        this.utils.presentAlertPersonalizado('ALERTA', 'Debes seleccionar una actividad');

      }
    } else {
      this.utils.presentAlertPersonalizado('ALERTA', 'Debes Cargar un suministro');
    }

  }

  limpiar() {
    console.log("ingreso a limpiar");
    // Establecer todas las variables utilizadas en los campos en blanco
    this.suministro = '';
    this.observacion = '';
    this.nombre = '';
    this.direccion = '';
    this.photoService.photos = [];
    this.suministro = '';
    this.provincia = '',
    this.distrito = '',
    this.codCatastral = '',
    this.selectedActividad = '';
    this.categoria = '';
    this.lectura = 0;
    this.ultimaLectura = '';
    this.fechaUltimaLectura = '';
    this.sgrabar = false;
    this.idActivida = '';
    this.descActividad = '';
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
      this.suministro = query;
      this.usuarioId = localStorage.getItem('idUsuario');
      localStorage.setItem('suministro', this.suministro);
      const tipoBusqueda = 0;
      this.obtenerDatosSuministro(this.suministro, tipoBusqueda);

    } else {
      localStorage.removeItem('suministro');
      this.limpiar();
    }
  }


  obtenerDatosSuministro(suministro: any, tipoBusqueda: any) {
    if (tipoBusqueda == 0) {//busqueda normal
      this.ocultarSelectActividad = false;
      this.flagQR = false;

    } else if (tipoBusqueda == 1) { // busqueda por qr
      this.ocultarSelectActividad = true;
      this.flagQR = true;
    }
    this.http.get<any>(environment.ROOTAPI + 'buscarSuministro/' + suministro + '.htm ')
      .subscribe({
        next: response => {
          if (response.id == '1') {
            const jsonData = JSON.parse(response.data);
            console.log(jsonData);
            this.nombre = jsonData.nombreCliente;
            this.direccion = jsonData.direccionPredio;
            this.codCatastral = jsonData.codigoCatastral;
            this.provincia = jsonData.desProvincia;
            this.distrito = jsonData.desDistrito;
            this.ultimaLectura = jsonData.valorUltimaLectura;
            this.fechaUltimaLectura = jsonData.fechaUltimaLectura;
            this.categoria = jsonData.desCategoria;
            this.utils.mostrarToast(response.mensaje, 1000, 'success');


          } else if (response.id == '2') {
            this.utils.mostrarToast('ERROR AL BUSCAR SUMINISTRO: ' + response.mensaje, 1000, 'danger');
          } else if (response.id == '3') {
            this.utils.mostrarToast('ERROR AL BUSCAR SUMINISTRO: ', 1000, 'warning');
          }

        },
        error: error => {
          this.utils.mostrarToast('ERROR AL BUSCAR SUMINISTRO ' + JSON.stringify(error), 1000, 'danger');
          console.error(error);
        },
        complete: () => {
          console.log('consumo completado');
        },
      });
  }


  async regresarToLogin() {
    const tipoMvimiento = 2;
    const log = this.logMovimientos;
    this.enviarInformacionDispositivo(this.idUs, tipoMvimiento, log.idCelular,log.ipCelular, log.modeloCelular, log.versionOS, 'CERRAR SESION');
    console.log('limpiar localstorage');
    localStorage.clear();
    this.router.navigate(['/tab1']);
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

  async avanceNotificacion() {
    this.router.navigate(['/tab3']);

  }
  onActividadSelect(event: any) {
    console.log(event);//realizar una accion al seleccionar un select 
  }

}

