import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PhotoService } from '../services/photo.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilServices } from '../services/utils.service';
import { Avance } from '../entidades/Avance';
import { environment } from 'src/environments/environment.prod';
import * as XLSX from 'xlsx';
import { Browser } from '@capacitor/browser';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  contador: number = 1;
  ListaAvance: Avance[] = [];
  ListaAvanceAux: Avance[] = [];
  results: Avance[] = [];
  resultsAux: Avance[] = [];
  dni: any;
  nombreUser: any;
  idUs: any;
  lastIndexToShow = 15;
  tipoUsuario: any;
  mostrarAvance = false;
  mont?: any;
  isModalOpen = false;
  listaUrls: any;
  idProyectoOtass: any;
  urlMaps: string = '';
  dniPersona: any = '';
  countdown: string = ';'
  private countdownInterval: any;
  constructor(private http: HttpClient,
    public photoService: PhotoService,
    public alertController: AlertController,
    private utils: UtilServices,
    private router: Router,
    private loading: LoadingController
  ) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.nombreUser = localStorage.getItem('nombreUser');
    this.idUs = localStorage.getItem('idUsuario');
    this.tipoUsuario = localStorage.getItem('perfil');
    this.dni = localStorage.getItem('idUsuario');
    this.idProyectoOtass = localStorage.getItem('idProyectoOtass');
    this.listarAvance(this.dni);

    this.startCountdown();
  }

  ionViewDidLeave() {// se ejecuta al salir del componente
    this.stopCountdown();
  }

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


  async listarAvance(dni: any) {
    this.resetCountdown();
    this.contador = 1;
    this.http.get<any>(environment.ROOTAPI + 'buscarPadronVisitaAvancePorIdPersona/' + dni + '/' + this.nombreUser + '.htm')
      .subscribe({
        next: response => {
          if (response.id == '1') {
            const jsonData = JSON.parse(response.data);
            this.ListaAvance = jsonData;
            this.ListaAvanceAux = jsonData;
            this.convertirFechasEnLista(this.ListaAvance);
            this.ListaAvance.sort(this.compare);
            this.results = [...this.ListaAvance]
            for (let i = 0; i < this.results.length; i++) {
              this.results[i].id = this.contador; // Asigna el contador como ID
              this.contador++; // Incrementa el contador para el siguiente elemento
            }
            this.loadMoreData();
            if (this.results.length == 0) {
              this.utils.mostrarToast('NO CUENTA CON AVANCE ', 1000, 'warning');
            } else if (this.results.length > 0) {
              this.mostrarAvance = true;
            }

          } else if (response.id == '2') {
            this.utils.mostrarToast(response.mensaje, 2000, 'danger');

          }
        },
        error: error => {
          console.error(error);
          this.utils.mostrarToast(JSON.stringify(error), 2000, 'danger');
        },
        complete: () => {
          console.log('solicitud completada');
        }
      });
  }
  convertirFechasEnLista(lista: Avance[]) {
    for (let i = 0; i < lista.length; i++) {
      const fechaStr = lista[i].fecha;
      const partes = fechaStr.split('/');
      const fechaFormatoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
      lista[i].fechaDate = new Date(fechaFormatoISO);
    }
  }

  compare(a: Avance, b: Avance) {
    if (a.fechaDate > b.fechaDate) return -1;
    if (a.fechaDate > b.fechaDate) return 1;
    return 0;
  }

  buscadorListaAvances(event: any) {
    this.resetCountdown();
    const query = event.target.value.toUpperCase();
    if (query) {
      this.results = this.ListaAvance.filter(item => {
        // Comparar query con campo "fecha" , "nombreCompleto , suministro y actividad"
        return (
          item.fecha.includes(query) ||
          item.nombreCompleto.includes(query) ||
          item.numInscripcion.toString().includes(query) || // Convierte numInscripcion a cadena
          item.actividad.includes(query) ||
          item.idPersona.includes(query)
        );
      });
      /////////////////////////// AQUI FILTRO AVANZADO 
      this.filtroAvanzado(query, this.dniPersona);

    } else {
       this.results=this.ListaAvance;
       this.loadMoreData();
      this.resultsAux = [];
      console.log('query vacio');
    }

  }


  filtroAvanzado(query: string, idPersona: string) {
    this.resetCountdown();
    if (idPersona.length > 0) {
      // Filtrar por (fecha or nombreCompleto or numInscripcion or actividad) y idPersona
      this.resultsAux = this.ListaAvanceAux.filter(item =>
        (item.fecha.includes(query)) ||
        (item.nombreCompleto.includes(query)) ||
        (item.numInscripcion.toString().includes(query)) ||
        (item.actividad.includes(query))

      );

      this.resultsAux = this.resultsAux.filter(item => item.idPersona.includes(idPersona));
      console.log(this.resultsAux.length);
      console.log('buscando con dni');
    } else {
      // Filtrar por (fecha or nombreCompleto or numInscripcion or actividad)
      this.resultsAux = this.ListaAvanceAux.filter(item =>
        (item.fecha.includes(query)) ||
        (item.nombreCompleto.includes(query)) ||
        (item.idPersona.includes(query)) ||
        (item.numInscripcion.toString().includes(query)) ||
        (item.actividad.includes(query))
      );
      console.log('buscando sin dni ');

    }
  }


  loadMoreData(event?: any) {
    this.resetCountdown();
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

  eliminarAvance(id: any, index: any) {
    this.resetCountdown();
    console.log(id);
    this.http.get<any>(environment.ROOTAPI + 'eliminarVisitaProyectoOtass/' + id + '/' + this.idUs + '/' + this.nombreUser + '.htm')
      .subscribe({
        next: response => {
          if (response.id == '1') {
            this.utils.mostrarToast(response.mensaje, 1000, 'success');
            //this.listarAvance(this.dni);
            //this.results.splice(index.id, 1)
            this.listarAvance(this.dni);
          } else {
            this.utils.mostrarToast('ERROR AL ELIMINAR: ' + response.mensaje, 1000, 'danger');
          }
        },
        error: error => {
          console.error(error);
          this.utils.mostrarToast(JSON.stringify(error), 1000, 'danger');
        },
        complete: () => {
          console.log('solicitud completada');
        },
      });

  }


  handleRefresh(event: any) {
    setTimeout(() => {
      this.dni = localStorage.getItem('idUsuario');
      this.listarAvance(this.dni);
      event.target.complete();
    }, 2000);
  }

  async generarExcel() {
    this.resetCountdown();
    console.log(this.resultsAux);

    var listaExportar:Avance[] =[];
    if(this.resultsAux.length === 0){
      listaExportar = this.ListaAvance;
    }else{
      listaExportar=this.resultsAux;
    }


    // Verificar si hay datos para generar el Excel
    if (this.resultsAux.length === 0 && this.ListaAvance.length===0) {
      console.log('No hay datos para generar el Excel.');
      alert('No hay datos que exportar');
      return;
    }
    // Mostrar un cuadro de diálogo de confirmación
    const confirmAlert = await this.alertController.create({
      header: 'Nombre de archivo',
      //  message: '¿Desea exportar el archivo Excel?',
      inputs: [
        {
          name: 'NombreArchivo',
          type: 'text',
          placeholder: 'Ingrese un nombre para el archivo'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Exportación cancelada');
          },
        },
        {
          text: 'Exportar',
          handler: async (data) => {
            const loading = await this.loading.create({
              message: 'Exportando...', // Mensaje que se mostrará mientras carga
            });
            await loading.present();

            var enteredFileName = data.NombreArchivo.trim(); // Obtener el valor ingresado

            if (enteredFileName === '') {
              // Validación si no se ingresa ningún nombre de archivo
              enteredFileName = 'listaAvance' + this.idUs;
              loading.dismiss();
              //return;
            } else {


              // Crear un libro de Excel
              const workbook = XLSX.utils.book_new();
              const worksheet = XLSX.utils.json_to_sheet(listaExportar);

              // Agregar la hoja de trabajo al libro
              XLSX.utils.book_append_sheet(workbook, worksheet, 'OTASS');

              // Generar un nombre de archivo basado en la fecha y hora actual
              const fileName = enteredFileName + '.xlsx';

              try {
                // Convertir el libro de Excel a un ArrayBuffer
                const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
                console.log(excelBlob);

                const byteCharacters = atob(excelBlob);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);

                // Crea un Blob con los bytes decodificados y el tipo MIME correcto
                const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                // Crea una URL del Blob
                // const fileUrl = URL.createObjectURL(blob);
                const f = this.convertBase64ToFile('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + excelBlob);
                console.log(f);

                /// aqui va servicio de exportar documento
                const formData = new FormData();
                formData.append('idPersona', this.idUs);
                formData.append('nombreCompleto', this.nombreUser);
                formData.append('idProyectoOtass', this.idProyectoOtass);
                formData.append('nombreArchivo', enteredFileName);
                formData.append('archivo', f);
                this.http.post<any>(environment.ROOTAPI + 'exportarArchivo.htm', formData).subscribe(
                  {
                    next: response => {
                      if (response.id == '1') {
                        console.log(response);
                        const url = response.data;
                        this.openBrowser(url);
                        this.utils.presentAlertPersonalizado('', 'Exportado');
                      } else if (response.id == '2') {
                        console.error(response.mensaje);
                        this.utils.mostrarToast(response.mensaje, 5000, 'danger');
                      } else if (response.id == '3') {
                        console.error(response.mensaje);
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

                //const xlsc = XLSX.writeFile(workbook,"reporte.xlsx");
                // Guardar el archivo Excel en el directorio de documentos
                // await Filesystem.writeFile({
                //     path:  fileName,
                //     data: excelBlob,
                //     directory: Directory.Data,
                // });

                // // // Obtener la URL del archivo guardado
                // const fileUri = await Filesystem.getUri({
                //   directory: Directory.Data,
                //   path: fileName
                // });
                //   console.log(fileUri.uri);
                //console.log(fileUrl);
                //this.downloadFile(fileUrl);

                // console.log('Archivo Excel generado:', fileName);
                // alert('Archivo exportado correctamente en Documentos');
                loading.dismiss();
              } catch (error) {
                console.error('Error al generar el archivo Excel:', error);
                alert('Error al generar archivo');
                loading.dismiss();
              }
            }


          },
        },
      ],
    });

    await confirmAlert.present();
  }


  downloadFile = async (url: any) => {
    await Browser.open({ url: url });
  };

  convertBase64ToFile = (base64: string) => {
    // Extracta sólo la parte base64 sin cabecera data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,
    const withoutHeader = base64.split(',')[1];

    // Convierte a bytes
    const byteString = atob(withoutHeader);

    // Crear array de bytes
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }

    // Crear Blob con el tipo correcto para un archivo Excel (XLSX)
    const blob = new Blob([int8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crear File con nombre y tipo
    const file = new File([blob], 'file.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    return file;
  }

  setOpen(isOpen: boolean, url: string, latitud: string, longitud: string) {
    this.resetCountdown();
    this.isModalOpen = isOpen;
    if (latitud == '0' && longitud == '0') {
      console.log('no hay coordenadas');
    } else {
      console.log(longitud);
      console.log(latitud);
      this.urlMaps = `https://www.google.com/maps?q=${latitud},${longitud}`
    }

    if (!isOpen) {
      // se aplica la presionar cerrar 
      this.listaUrls = [];
      this.urlMaps = '';
      this.isModalOpen = false;
    }
    // Verificar si la cadena 'url' no está vacía o es null
    if (url && url.trim() !== '') {
      // Dividir la cadena en un array de URLs usando la coma como delimitador
      const urlsArray = url.split(',').map(url => url.trim());

      // Filtrar para eliminar elementos vacíos o nulos en el array
      const arregloDeUrls: string[] = urlsArray.filter(u => u !== '');

      if (arregloDeUrls.length > 0) {
        console.log('Arreglo de URLs:', arregloDeUrls);
        this.listaUrls = arregloDeUrls;
      }

    }

  }

  irAubicacion() {
    this.resetCountdown();
    if (this.urlMaps.length == 0) {
      alert('ubicacion no disponible para este registro');


    } else {
      this.openBrowser(this.urlMaps);

    }

  }

  openBrowser = async (url: any) => {
    this.resetCountdown();
    await Browser.open({ url: url });
  };

  async obtenerDniFiltro() {
    this.resetCountdown();
    // Mostrar un cuadro de diálogo de confirmación
    const confirmAlert = await this.alertController.create({
      header: 'Filtro',
      //  message: '¿Desea exportar el archivo Excel?',
      inputs: [
        {
          name: 'dniPersona',
          type: 'number',
          placeholder: 'Ingrese dni a filtrar'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Exportación cancelada');
          },
        },
        {
          text: 'aceptar',
          handler: async (data) => {


            var dniPersona = data.dniPersona.trim(); // Obtener el valor ingresado
            this.dniPersona = dniPersona;
          },
        },
      ],
    });

    await confirmAlert.present();
  }

}

