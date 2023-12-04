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
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { EstadosVisita } from '../objetos/EstadosVisita';
import { ApiService } from '../services/api.service';

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
  latitud?: any=0;
  longitud?: any=0;
  observacion: string = '';
  sgrabar?= false;
  idUs?: any;
  listaActividades: Actividades[] = [];
  listaEstadosVisita: EstadosVisita[] = [];
  lectura: number = 0;
  numNotificacion: number;
  numCompromiso: number;
  ultimaLectura: any;
  selectedActividad: any;
  selectedEstadoVisita: any;
  watchId: any; // para geolocalizar
  usuarioId: any;
  tipoUsuario?: any;
  nombreUser: any;
  provincia: any;
  distrito: any;
  provinciaUser: any;
  distritoUser: any;
  codCatastral: any;
  bas64: any[] = [];
  rol: any;
  rolMorosos = false;
  rolConsumo = false;
  categoria: any;
  fechaUltimaLectura: any;
  idProyectoOtass: any;
  idProyectoOtassZonal: any;
  acuary = true;
  logMovimientos: any;
  mantenerDatos?: boolean = false;
  // data qr
  ocultarSelectActividad = false;
  idActivida: any;
  descActividad: any;
  flagQR = false;
  valor: any;
  public photos: UserPhoto[] = [];
  filesFotosCamara: File[] = [];
  filesFotosGalery: File[] = [];
  constructor(
    private http: HttpClient,
    public photoService: PhotoService,
    public alertController: AlertController,
    private router: Router,
    private api: ApiService,
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
    const estadoVisita = localStorage.getItem('estadoVisita');
    this.provinciaUser = localStorage.getItem('provincia');
    this.distritoUser = localStorage.getItem('distrito');
    const log = localStorage.getItem('logMovimientos') || '';
    this.logMovimientos = JSON.parse(log);
    console.log(this.logMovimientos);
    if (actividades) {
      this.listaActividades = JSON.parse(actividades);
      // Hacer algo con los datos almacenados en el array 'impedimentosArray'
    }
    if (estadoVisita) {
      this.listaEstadosVisita = JSON.parse(estadoVisita);
      // Hacer algo con los datos almacenados en el array 'impedimentosArray'
    }
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
    this.obtenerDatosSuministro(this.suministro, tipoBusqueda, this.idUs, this.nombreUser);
    localStorage.setItem('suministro', this.suministro);
  }

  async addPhotoToGallery() {
    //this.photoService.addNewToGallery();
    //this.obtenerCoordenadasGPS();
    if (await this.photoService.addNewToGallery()) {
      console.log("foto tomada");
      this.sgrabar = true;
      const files = await this.convertPhotosToFiles();
      this.filesFotosCamara = files;
      this.bas64 = await this.convertFilesToBase64(files);

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
         // this.utils.mostrarToast('Error al obtener las coordenadas GPS ', 5000, 'danger');
        }
      });
    } catch (error) {
      console.error('Error al iniciar la captura continua de coordenadas', error);
      this.utils.mostrarToast('Error al obtener las coordenadas GPS ', 5000, 'danger');
    }
  }


  async guardarActividad() {


    if (this.isPhotoGallery) {
      console.log('entro a fotos de galeria');
      console.log(this.filesFotosGalery);
      this.guardar(this.filesFotosGalery);
    } else {
      console.log('entro a fotos de camara');
      this.guardar(this.filesFotosCamara);
    }

  }

  async guardar(fotos: any) {
    console.log('tamaño de array fotos al guardar');
    console.log(fotos.length);
    var numNot = -1;
    var numComp = -1;
    if (this.numNotificacion) {
      numNot = this.numNotificacion
    }

    if (this.numCompromiso) {
      numComp = this.numCompromiso

    }

    if (this.nombre) {
      if (this.selectedActividad) {
        if (this.selectedEstadoVisita) {
          if (true) { // this.base64[0] aca permito que sea opcional la foto
            this.utils.loader(); // carga el loader de espera 

            const formData = new FormData();
            formData.append('numInscripcion', this.suministro);
            formData.append('longitud', this.longitud);
            formData.append('latitud', this.latitud);
            formData.append('idPersona', this.idUs);
            formData.append('nombreCompleto', this.nombreUser);
            formData.append('idProyectoOtass', this.idProyectoOtass);
            formData.append('idProyectoOtassZonal', this.idProyectoOtassZonal);
            formData.append('idActividad', this.selectedActividad);
            formData.append('idEstadoVisitaT', this.selectedEstadoVisita);
            formData.append('lectura', this.lectura.toString());
            formData.append('numNotificacion', numNot.toString());
            formData.append('numCompromisoPago', numComp.toString());
            formData.append('flagUsoQr', this.flagQR.toString());
            formData.append('observacion', this.observacion);

            if (fotos.length > 0 && fotos.length < 2) {
              formData.append('foto1', fotos[0]);
              const file = new File([''], '', { type: 'text/plain' });
              formData.append('foto2', file);
              formData.append('foto3', file);
            } else if (fotos.length > 1 && fotos.length < 3) {
              formData.append('foto1', fotos[0]);
              formData.append('foto2', fotos[1]);
              const file = new File([''], '', { type: 'text/plain' });
              formData.append('foto3', file);
            } else if (fotos.length > 2 && fotos.length < 4) {
              formData.append('foto1', fotos[0]);
              formData.append('foto2', fotos[1]);
              formData.append('foto3', fotos[2]);
            } else if (fotos.length == 0) {
              const file = new File([''], '', { type: 'text/plain' });
              formData.append('foto1', file);
              formData.append('foto2', file);
              formData.append('foto3', file);

            } else if (fotos.length > 3) {
              formData.append('foto1', fotos[0]);
              formData.append('foto2', fotos[1]);
              formData.append('foto3', fotos[2]);
            }


            this.http.post<any>(environment.ROOTAPI + 'registrarVisitaI3.htm', formData).subscribe(
              {
                next: response => {
                  if (response.id == '1') {
                    this.utils.closeLoader();
                    //this.utils.mostrarToast(response.mensaje, 1000, 'success');
                    if (this.mantenerDatos) {
                      //limpiar solo la actividad
                      this.selectedActividad = '';
                      this.selectedEstadoVisita = '';
                      this.filesFotosGalery = [];
                      this.isPhotoGallery = false;
                    } else {
                      console.log('entro a else');
                      this.limpiar(); // limpiar todo
                    }

                    this.utils.presentAlertPersonalizado('', 'Notificado Correctamente');
                  } else if (response.id == '2') {
                    console.error(response.mensaje);
                    this.utils.closeLoader();
                    this.utils.mostrarToast(response.mensaje, 5000, 'danger');
                  } else if (response.id == '3') {
                    console.error(response.mensaje);
                    this.utils.closeLoader();
                    this.utils.mostrarToast('ERROR AL REGISTRAR', 5000, 'danger');
                  }
                },
                error: (error) => {
                  this.utils.closeLoader();
                  console.error(error);
                  //this.utils.mostrarToast(JSON.stringify(error), 5000, 'danger');
                }
              }
            );


          } else {
            this.utils.presentAlertPersonalizado('', 'Debe tomar una foto');
          }
        } else {
          this.utils.presentAlertPersonalizadoDanger('', 'Debes seleccionar una estado de visita');
        }
      } else {
        this.utils.presentAlertPersonalizadoDanger('', 'Debes seleccionar una actividad');

      }
    } else {
      this.utils.presentAlertPersonalizadoDanger('', 'Debes Cargar un suministro');
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
    this.selectedEstadoVisita = '';
    this.categoria = '';
    this.lectura = 0;
    this.ultimaLectura = '';
    this.fechaUltimaLectura = '';
    this.sgrabar = false;
    this.idActivida = '';
    this.descActividad = '';
    this.images = [];
    this.filesFotosGalery = [];
    this.isPhotoGallery = false;

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
            const filename = this.getFilenameFromPath(photo.webviewPath) + '.jpg';
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
      this.obtenerDatosSuministro(this.suministro, tipoBusqueda, this.usuarioId, this.nombreUser);

    } else {
      localStorage.removeItem('suministro');
      this.limpiar();
    }
  }


  obtenerDatosSuministro(suministro: any, tipoBusqueda: any, idPersona: string, nombrePersona: string) {
    if (tipoBusqueda == 0) {//busqueda normal
      this.ocultarSelectActividad = false;
      this.flagQR = false;

    } else if (tipoBusqueda == 1) { // busqueda por qr
      this.ocultarSelectActividad = true;
      this.flagQR = true;
    }
    this.http.get<any>(environment.ROOTAPI + 'buscarSuministro/' + suministro + '/' + idPersona + '/' + nombrePersona + '.htm ')
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
    this.router.navigate(['/tab1']);
    const tipoMvimiento = 2;
    const log = this.logMovimientos;
    console.log('cerraR CESION');
    console.log(JSON.stringify(log));
    this.enviarInformacionDispositivo(this.idUs, this.nombreUser, tipoMvimiento, log.idCelular, log.ipCelular, log.modeloCelular, log.versionOS, 'CERRAR SESION');
    console.log('limpiar localstorage');
    //localStorage.clear();
  }

  enviarInformacionDispositivo(idUs: any, nombreCompleto: any, tipoMovimiento: any, idCelular: any, ipCelular: any, modeloCelular: any, versionOs: any, observacion: any) {
    this.http.get(environment.ROOTAPI + 'registrarAppInOut/' + idUs + '/' + nombreCompleto + '/' + tipoMovimiento + '/' + idCelular + '/' + ipCelular + '/' + modeloCelular + '/' + versionOs + '/' + observacion + '.htm').subscribe({
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
  onEstadoVisitaSelect(event: any) {
    console.log(event);//realizar una accion al seleccionar un select 
  }


  togleMantenerDatos() {

    // Puedes hacer lo que desees con this.toggleValue, como enviarlo a una API o realizar otras acciones.
    this.mantenerDatos = !this.mantenerDatos;
    console.log('Valor del toggle:', this.mantenerDatos);
  }

  public async readImagesFromGallery(): Promise<void> {
    const { files } = await FilePicker.pickImages({ multiple: true }); // Habilita la opción de seleccionar múltiples imágenes
    const paths: string[] = [];

    if (!files || files.length === 0) {
      return;
    }

    for (const file of files) {
      if (file.path) {
        paths.push(file.path);
      }
    }

    // Ahora 'paths' contendrá las rutas de las imágenes seleccionadas
    console.log("Rutas de las imágenes seleccionadas:", paths);
  }

  async readBarcodeFromImage(): Promise<void> {
    const { files } = await FilePicker.pickImages({ multiple: false });
    const path = files[0]?.path;
    if (!path) {
      return;
    }
    console.log('**' + files);
  }


  images: any[] = [];
  isPhotoGallery = false;

  async pickImages() {

    const result = await FilePicker.pickImages({
      multiple: true,
      readData: true
    });
    // Recorrer cada archivo
    result.files.forEach(file => {
      // Completar el base64
      const base64 = 'data:image/jpeg;base64,' + file.data;
      // Agregar al array
      this.images.push(base64); // este array se muestra en el frond
      // Convertir los base64 a Files 
      if (this.images[0]) {
        const file = this.convertBase64ToFile(this.images[0]);
        this.filesFotosGalery.push(file);
      }
      if (this.images[1]) {
        const file1 = this.convertBase64ToFile(this.images[1]);
        this.filesFotosGalery.push(file1);
      }
      if (this.images[2]) {
        const file2 = this.convertBase64ToFile(this.images[2]);
        this.filesFotosGalery.push(file2);
      }

      console.log(this.filesFotosGalery);



    });


    if (this.images.length > 0) {
      this.isPhotoGallery = true;
    } else {
      this.isPhotoGallery = false;
    }
  }

  convertBase64ToFile = (base64: string) => {

    // Extracta sólo la parte base64 sin cabecera data:image/jpeg;base64,
    const withoutHeader = base64.split(',')[1];

    // Convierte a bytes
    const byteString = atob(withoutHeader);

    // Crear array de bytes
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }

    // Crear File
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    const file = new File([blob], new Date().getTime() + 'image.jpg', { type: 'image/jpeg' });

    return file;

  }
}

