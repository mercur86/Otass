import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController } from '@ionic/angular';
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
  saldoCC?:any='';
  montoDeuda?:any='';
  numMesesDeuda?:any='';
  direccion?: any;
  latitud?: any;
  longitud?: any;
  observacion: string = '';
  sgrabar? = false;
  idUs?: any;
  listaActividades: Actividades[] = [];
  listaEstadosVisita: EstadosVisita[] = [];
  lectura: number = 0;
  numNotificacion: any;
  numCompromiso: any;
  numPapeleta: any;
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

  private countdownInterval: any;
  constructor(
    private http: HttpClient,
    public photoService: PhotoService,
    public alertController: AlertController,
    private router: Router,
    private api: ApiService,
    private utils: UtilServices,
    private loading: LoadingController) {
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
    this.startCountdown();
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


  countdown: string = '';
  startCountdown() {
    let timeLeft = environment.TIMESESION; // Tiempo en segundos
    clearInterval(this.countdownInterval); // Borra el intervalo previo, si existe

    this.countdownInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      this.countdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      timeLeft--;

      //console.log(this.countdown);

      if (timeLeft < 0) {
        clearInterval(this.countdownInterval);
        // Realiza la acción deseada al finalizar el contador
        this.router.navigate(['/tab1']);
      }
    }, 1000);
  }

  // Método que puedes llamar para restablecer el contador desde otros métodos
  resetCountdown() {
    clearInterval(this.countdownInterval); // Borra el intervalo actual
    this.startCountdown(); // Inicia un nuevo contador
  }

  stopCountdown() {
    clearInterval(this.countdownInterval); // Detiene el intervalo actual
    // Puedes realizar alguna acción adicional si es necesario al detener el contador
    console.log('Contador detenido');
  }

  ionViewDidLeave() {// se ejecuta al salir del componente
    this.stopCountdown();
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
    this.startCountdown();
    //this.photoService.addNewToGallery();
    //this.obtenerCoordenadasGPS();
    if (await this.photoService.addNewToGallery()) {
      console.log("foto tomada");
      this.sgrabar = true;
      const files = await this.convertPhotosToFiles();
      this.filesFotosCamara = files;
      console.log(this.filesFotosCamara);
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
    this.resetCountdown();// restablece contador para cerrar sesion

    // Mostrar un cuadro de diálogo de confirmación
    const confirmAlert = await this.alertController.create({
      header: '¿Está seguro de guardar?',
      //  message: '¿Desea exportar el archivo Excel?',

      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Exportación cancelada');
          },
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (this.isPhotoGallery) {
              console.log('entro a fotos de galeria');
              console.log(this.filesFotosGalery);
              this.guardar(this.filesFotosGalery);
            } else {
              console.log('entro a fotos de camara');
              this.guardar(this.filesFotosCamara);
            }

          },
        },
      ],
    });

    await confirmAlert.present();
    /////////////////////////////////////////////7




  }

  async guardar(fotos: any) {
    console.log('tamaño de array fotos al guardar');
    console.log(fotos.length);
    var numNot = '';
    var numComp = '';
    var numPape = '';
    if (this.numNotificacion) {
      numNot = this.numNotificacion
    }

    if (this.numCompromiso) {
      numComp = this.numCompromiso

    }

    if (this.numPapeleta) {
      numPape = this.numPapeleta

    }

    if (this.nombre) {
      if (this.selectedActividad) {
        if (this.selectedEstadoVisita) {
          if (true) { // this.base64[0] aca permito que sea opcional la foto
            //this.utils.loader(); // carga el loader de espera 
            // Mostrar el indicador de carga
            const loading = await this.loading.create({
              message: 'Espere un momento...', // Mensaje que se mostrará mientras carga
            });
            await loading.present();
            ////
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
            formData.append('numPapeleta', numPape.toString());
            formData.append('flagUsoQr', this.flagQR.toString());
            formData.append('observacion', this.observacion);

            const maxFotos = 5; // Máximo de fotos a considerar

            // Llenar el FormData con archivos de fotos
            for (let i = 0; i < maxFotos; i++) {
              if (fotos.length > i) {
                formData.append(`foto${i + 1}`, fotos[i]);
              } else {
                const file = new File([''], '', { type: 'text/plain' });
                formData.append(`foto${i + 1}`, file);
              }
            }


            this.http.post<any>(environment.ROOTAPI + 'registrarVisitaI3.htm', formData).subscribe(
              {
                next: response => {
                  if (response.id == '1') {
                    //this.utils.closeLoader();
                    loading.dismiss();
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
                    //this.utils.closeLoader();
                    loading.dismiss();
                    this.utils.mostrarToast('ERROR AL REGISTRAR', 5000, 'danger');
                  }
                },
                error: (error) => {
                  // this.utils.closeLoader();
                  loading.dismiss();
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
    this.resetCountdown();
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
    this.numCompromiso = '',
      this.numNotificacion = '',
      this.numPapeleta = ''
    this.index=0;
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

  index:any=0;
  public convertPhotosToFiles(): Promise<File[]> {
    const photoPromises = this.photoService.photos.map((photo, index) => {
      if (photo.webviewPath) {
        const currentIndex = index+1
        return fetch(photo.webviewPath)
          .then(response => response.blob())
          .then(blob => {
           
            const filename = `img_${currentIndex}.jpg`;
            return new File([blob], filename);
          });
      } else {
        return Promise.reject('webviewPath is undefined');
      }
    });
    if(this.photoService.photos.length>5){
      this.utils.presentAlertPersonalizadoDanger('','Solo se guardaran las 5 primeras fotos');
    }
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
    this.resetCountdown();
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
            this.saldoCC = jsonData.saldoCtaCte;
            this.montoDeuda = jsonData.montoDeuda;
            this.numMesesDeuda= jsonData.numMesesDeuda;
            this.direccion = jsonData.direccionPredio;
            //this.codCatastral = jsonData.codigoCatastral;
            this.provincia = jsonData.desProvincia +' - '+ jsonData.desDistrito ;
            //this.distrito = jsonData.desDistrito;
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
    this.resetCountdown();
    console.log(event);//realizar una accion al seleccionar un select 
  }
  onEstadoVisitaSelect(event: any) {
    this.resetCountdown();
    console.log(event);//realizar una accion al seleccionar un select 
  }


  togleMantenerDatos() {
    this.resetCountdown();
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
    this.resetCountdown();
    this.filesFotosGalery = [];
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
      this.filesFotosGalery = [];

      // Recorrer la lista images para crear nuevos elementos File
      var cont =0;
      this.images.forEach(base64 => {
        cont++;
        const file = this.convertBase64ToFile(base64,cont);
        this.filesFotosGalery.push(file);
        console.log(this.filesFotosGalery);
      });


    });

    if(this.filesFotosGalery.length>5){
      this.utils.presentAlertPersonalizadoDanger('','Solo se cargaran las 5 primeras fotos');
    }

    if (this.images.length > 0) {
      this.isPhotoGallery = true;
    } else {
      this.isPhotoGallery = false;
    }
  }

  convertBase64ToFile = (base64: string , index:any) => {
    // Extracta solo la parte base64 sin cabecera data:image/jpeg;base64,
    const withoutHeader = base64.split(',')[1];
  
    // Convierte a bytes
    const byteString = atob(withoutHeader);
  
    // Crear array de bytes
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
  
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
  
    // Crear Blob
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
  
    // Verificar si el nombre del archivo tiene extensión
    let fileName ='img'+'_'+index;
    if (!fileName.endsWith('.jpg')) {
      fileName += '.jpg';
    }
  
    // Crear File con la extensión .jpg si no la tiene
    const file = new File([blob], fileName, { type: 'image/jpeg' });
  
    return file;
  }
  

  eliminarFoto(index: any) {
    this.resetCountdown();
  this.index--;
    console.log(index);
    if (index >= 0 && index < this.images.length) {
      this.images.splice(index, 1);
      // Aquí realizas cualquier otra lógica que necesites después de eliminar la foto
    }
    if (index >= 0 && index < this.photoService.photos.length) {
      this.photoService.photos.splice(index, 1);
      // Aquí realizas cualquier otra lógica que necesites después de eliminar la foto
    }

    this.filesFotosGalery = [];
    var cont =0;
    // Recorrer la lista images para crear nuevos elementos File
    this.images.forEach(base64 => {
      cont++;
      const file = this.convertBase64ToFile(base64,cont);
      this.filesFotosGalery.push(file);
      console.log(this.filesFotosCamara);

    });
  }


}

