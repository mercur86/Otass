import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PhotoService } from '../services/photo.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilServices } from '../services/utils.service';
import { Avance } from '../entidades/Avance';
import { environment } from 'src/environments/environment.prod';
import { Directory, Filesystem } from '@capacitor/filesystem';
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
  results: Avance[] = [];
  dni: any;
  nombreUser: any;
  idUs: any;
  lastIndexToShow = 15;
  tipoUsuario: any;
  mostrarAvance = false;
  mont?: any;
  isModalOpen = false;
  listaUrls:any;
  idProyectoOtass:any;
  urlMaps:string='';
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
  }

  async listarAvance(dni: any) {
    this.contador=1;
    this.http.get<any>(environment.ROOTAPI+'buscarPadronVisitaAvancePorIdPersona/' + dni +'/'+this.nombreUser+ '.htm')
      .subscribe({
        next: response => {
          if (response.id == '1') {
            const jsonData = JSON.parse(response.data);
            this.ListaAvance = jsonData;
            this.convertirFechasEnLista(  this.ListaAvance);
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

          } else  if (response.id == '2') {
            this.utils.mostrarToast(response.mensaje, 2000, 'danger');

          }
        },
        error: error => {
          console.error(error);
          this.utils.mostrarToast(JSON.stringify(error), 2000, 'danger');
        },
        complete:() =>{
            console.log('solicitud completada');
        }
  });
  }
  convertirFechasEnLista(lista:Avance[]) {
    for (let i = 0; i < lista.length; i++) {
      const fechaStr = lista[i].fecha;
      const partes = fechaStr.split('/');
      const fechaFormatoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
      lista[i].fechaDate = new Date(fechaFormatoISO);
    }
  }

  compare(a: Avance, b: Avance) {
    if(a.fechaDate > b.fechaDate) return -1;
    if(a.fechaDate > b.fechaDate) return 1;
    return 0;
  }

  buscadorListaAvances(event: any) {
    const query = event.target.value.toUpperCase();
    this.results = this.ListaAvance.filter(item => {
      // Comparar query con campo "fecha" , "nombreCompleto , suministro y actividad"
      return (
        item.fecha.includes(query) ||
        item.nombreCompleto.includes(query) ||
        item.numInscripcion.toString().includes(query) || // Convierte numInscripcion a cadena
        item.actividad.includes(query)
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

  eliminarAvance(id: any, index: any) {
    console.log(id);
    this.http.get<any>(environment.ROOTAPI+'eliminarVisitaProyectoOtass/' + id +'/'+this.idUs+ '/'+this.nombreUser+'.htm')
      .subscribe({
        next: response => {
          if (response.id == '1') {
            this.utils.mostrarToast(response.mensaje, 1000, 'success');
            //this.listarAvance(this.dni);
            this.results.splice(index, 1)
          } else {
            this.utils.mostrarToast('ERROR AL ELIMINAR: ' + response.mensaje, 1000, 'danger');
          }
        },
        error:error=> {
          console.error(error);
          this.utils.mostrarToast(JSON.stringify(error), 1000, 'danger');
        },
        complete:()=> {
            console.log('solicitud completada');
        },
       } );

  }

  regresar() {
    this.router.navigate(['/tabs/tab4']);
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.dni = localStorage.getItem('idUsuario');
      this.listarAvance(this.dni);
      event.target.complete();
    }, 2000);
  }

  async generarExcel() {
   
    // Verificar si hay datos para generar el Excel
    if (this.ListaAvance.length === 0) {
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
                    enteredFileName = 'listaAvance'+this.idUs;
                    loading.dismiss();
                    //return;
                  }else{
                    
                 
                  // Crear un libro de Excel
                  const workbook = XLSX.utils.book_new();
                  const worksheet = XLSX.utils.json_to_sheet(this.ListaAvance);

                  // Agregar la hoja de trabajo al libro
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'OTASS');

                  // Generar un nombre de archivo basado en la fecha y hora actual
                  const fileName = enteredFileName+'.xlsx';

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
                    const f=   this.convertBase64ToFile('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,'+excelBlob);
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
                            const url= response.data;
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
    const file = new File([blob],  'file.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    return file;
  }
  
  setOpen(isOpen: boolean, url: string, latitud:string, longitud:string) {
    this.isModalOpen = isOpen;
    if(latitud=='0' && longitud=='0'){
     console.log('no hay coordenadas');
    }else{
      console.log(longitud);
      console.log(latitud);
      this.urlMaps = `https://www.google.com/maps?q=${latitud},${longitud}`
    }
    
    if(!isOpen){
      this.listaUrls=[];
      this.urlMaps='';
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

  irAubicacion(){
    if(this.urlMaps.length==0){
        alert('ubicacion no disponible para este registro');

       
    }else{
      this.openBrowser(this.urlMaps);
      
    }

  }

  openBrowser = async (url: any) => {
    await Browser.open({ url: url });
  };

}

