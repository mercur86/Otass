import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PhotoService } from '../services/photo.service';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilServices } from '../services/utils.service';
import { Avance } from '../entidades/Avance';
import { environment } from 'src/environments/environment.prod';
import * as XLSX from 'xlsx';
import { Browser } from '@capacitor/browser';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Actividades } from '../entidades/Actividades';
import { EstadosVisita } from '../objetos/EstadosVisita';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  listaActividades: Actividades[] = [];
  listaEstadosVisita: EstadosVisita[] = [];
  contador: number = 1;
  ListaAvance: Avance[] = [];
  ListaAvanceAux: Avance[] = [];
  ListaEliminados: Avance[] = [];;
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
  isImagenAmpliada = false;
  listaUrls: any;
  idProyectoOtass: any;
  urlMaps: string = '';
  dniPersona: any = '';
  countdown: string = ';'

  ///variables filtro avanzado 
  dniAvanzado: any = '';
  fechaInicio: any = '';
  fechaFin: any = '';
  nombreFiltrAvanzado: any = '';

  private countdownInterval: any;

  /// variables modal detalle
  numCompromisoPago: string = '';
  numNotificacion: string;
  numPapelata: string;
  estadoVisita: string;
  numInscripcion:any;
  idEstadoVisita:any=0;
  idActividad:any=0;
  
  //modal imagen ampliada
  urlimagenmodal: any;

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
    const actividades = localStorage.getItem('actividades');
    const estadoVisita = localStorage.getItem('estadoVisita');
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
    this.http.get<any>(environment.ROOTAPI + 'buscarPadronVisitaAvancePorIdPersona/' + dni + '/' + this.nombreUser + '/false'+'.htm')
      .subscribe({
        next: response => {
          
          if (response.id == '1') {
            const jsonData = JSON.parse(response.data);
            console.log(jsonData);
            this.ListaAvance = jsonData;
            this.ListaAvanceAux = jsonData;
            this.convertirFechasEnLista(this.ListaAvance);
            this.ListaAvance.sort(this.compare);
            this.results = [...this.ListaAvance]
            console.log(this.ListaAvance);
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
      const fechaStr = lista[i].fechaVisita;
      const partesFechaHora = fechaStr.split(' '); // Separar fecha y hora
      const partesFecha = partesFechaHora[0].split('/'); // Separar día, mes y año
      const fechaFormatoISO = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
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
          item.fechaVisita.includes(query) ||
          item.nombreCompleto.includes(query) ||
          item.numInscripcion.toString().includes(query) || // Convierte numInscripcion a cadena
          item.actividad.includes(query) ||
          item.idPersona.includes(query)
        );
      });
      /////////////////////////// AQUI FILTRO aux
      this.filtroAux(query, this.dniPersona);

    } else {
      this.results = this.ListaAvance;
      this.loadMoreData();
      this.resultsAux = [];
      console.log('query vacio');
    }

  }


  filtroAux(query: string, idPersona: string) {
    this.resetCountdown();
    if (idPersona.length > 0) {
      // Filtrar por (fecha or nombreCompleto or numInscripcion or actividad) y idPersona
      this.resultsAux = this.ListaAvanceAux.filter(item =>
        (item.fechaVisita.includes(query)) ||
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
        (item.fechaVisita.includes(query)) ||
        (item.nombreCompleto.includes(query)) ||
        (item.idPersona.includes(query)) ||
        (item.numInscripcion.toString().includes(query)) ||
        (item.actividad.includes(query))
      );
      console.log('buscando sin dni ');

    }
  }


  filtroAvanzado() {
    this.resetCountdown(); // resetear contador de cierre de sesion 
    var combinaciondeFiltro = false;
      //filtro todo vacio 
      if(this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita==0){
        combinaciondeFiltro=true;
        console.log('entro a todo vacio');
          this.resultsAux  =[];
          this.results = this.ListaAvance;
          this.loadMoreData();
        }
    

    // Filtar solo por dni a la lista de exportacion
    if (this.dniAvanzado !== '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => item.idPersona.includes(this.dniAvanzado));
      console.log(this.resultsAux.length);

      //lista que se muestra en el frond 
      this.results = this.ListaAvance.filter(item => item.idPersona.includes(this.dniAvanzado));
      console.log(this.resultsAux.length);



      console.log('buscando con dni avanzado');
      this.restaurarFiltros();
    }


    //Filtar solo por fecha rango de fecha lista exportacion 

    if (this.dniAvanzado == '' && this.fechaInicio !== '' && this.fechaFin !== '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => {
        return item.fechaDate >= new Date(this.fechaInicio) && item.fechaDate <= new Date(this.fechaFin);;
      });


      //Filtar solo por fecha rango de fecha lista de frond 
      this.results = this.ListaAvance.filter(item => {
        return item.fechaDate >= new Date(this.fechaInicio) && item.fechaDate <= new Date(this.fechaFin);;
      });

      console.log(this.resultsAux.length);
      this.restaurarFiltros();
    }

    //Filtar solo por fecha inicio lista exportacion 

    const fa = this.utils.formatearFecha(new Date(), 'aaaa-mm-dd') + '';

    if (this.dniAvanzado == '' && this.fechaInicio !== '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => {
        return item.fechaDate >= new Date(this.fechaInicio) && item.fechaDate <= new Date(fa);;
      });


      //Filtar solo por fecha rango de fecha lista de frond 
      this.results = this.ListaAvance.filter(item => {
        return item.fechaDate >= new Date(this.fechaInicio) && item.fechaDate <= new Date(fa);;
      });

      console.log(this.resultsAux.length);
      this.restaurarFiltros();
    }


    //Filtar solo por fecha fin lista exportacion 

    if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin !== '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => {
        return item.fechaDate <= new Date(this.fechaFin);;
      });


      //Filtar solo por fecha rango de fecha lista de frond 
      this.results = this.ListaAvance.filter(item => {
        return item.fechaDate <= new Date(this.fechaFin);;
      });

      console.log(this.resultsAux.length);
      this.restaurarFiltros();
    }


    // Filtrar por rango de fecha y DNI lista exportacion 
    if (this.dniAvanzado !== '' && this.fechaInicio !== '' && this.fechaFin !== '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => {
        return (
          item.idPersona.includes(this.dniAvanzado) &&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
      });

      // Filtrar por rango de fecha y DNI lista frond 

      this.results = this.ListaAvance.filter(item => {
        return (
          item.idPersona.includes(this.dniAvanzado) &&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
      });

      console.log(this.resultsAux.length);
      this.restaurarFiltros();
    }

    // filtardo por nombre y rango de fechas 
    if (this.dniAvanzado == '' && this.fechaInicio !== '' && this.fechaFin !== '' && this.nombreFiltrAvanzado !== ''&& this.idActividad==0 && this.idEstadoVisita==0) {
      combinaciondeFiltro=true;
      this.resultsAux  = this.ListaAvanceAux.filter(item => {
        return (
          item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) &&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
      });

      this.results  = this.ListaAvance.filter(item => {
        return (
          item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) &&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
      });

      

      console.log(this.resultsAux.length);
     this.restaurarFiltros();
    }
 
    // filtrado por dni y estado visita

    if (this.dniAvanzado !== '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita!==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => 
        item.idPersona.includes(this.dniAvanzado) && 
        item.idEstadoVisita==this.idEstadoVisita
      );
      console.log(this.resultsAux.length);

      //lista que se muestra en el frond 
      this.results = this.ListaAvance.filter(item => 
        item.idPersona.includes(this.dniAvanzado)&& 
        item.idEstadoVisita==this.idEstadoVisita
      );
      console.log(this.resultsAux.length);



      console.log('buscando con dni avanzado');
      this.restaurarFiltros();
    }

    // filtrar por nombre y estado visita 
    if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado !== ''&& this.idActividad==0 && this.idEstadoVisita!==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => 
        item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
        item.idEstadoVisita==this.idEstadoVisita
      );

      //lista que se muestra en el frond 
      this.results = this.ListaAvance.filter(item => 
        item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
        item.idEstadoVisita==this.idEstadoVisita
      );
      console.log(this.resultsAux.length);



      console.log('buscando con dni avanzado');
      this.restaurarFiltros();
    }

     // filtrado por dni , estado visita y rango de fecha
     if (this.dniAvanzado !== '' && this.fechaInicio !== '' && this.fechaFin !== '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita!==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => 
        item.idPersona.includes(this.dniAvanzado) && 
        item.idEstadoVisita==this.idEstadoVisita &&
        item.fechaDate >= new Date(this.fechaInicio) &&
        item.fechaDate <= new Date(this.fechaFin)
      );
      console.log(this.resultsAux.length);

      //lista que se muestra en el frond 
      this.results = this.ListaAvance.filter(item => 
        item.idPersona.includes(this.dniAvanzado)&& 
        item.idEstadoVisita==this.idEstadoVisita &&
        item.fechaDate >= new Date(this.fechaInicio) &&
        item.fechaDate <= new Date(this.fechaFin)
      );
      console.log(this.resultsAux.length);



      console.log('buscando con dni avanzado');
      this.restaurarFiltros();
    }
    
    // filtrar por nombre , estado visita y rango de fecha 

    if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado !== ''&& this.idActividad==0 && this.idEstadoVisita!==0) {
      combinaciondeFiltro=true;
      this.resultsAux = this.ListaAvanceAux.filter(item => 
        item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
        item.idEstadoVisita==this.idEstadoVisita&&
        item.fechaDate >= new Date(this.fechaInicio) &&
        item.fechaDate <= new Date(this.fechaFin)
      );


      //lista que se muestra en el frond 
      this.results = this.ListaAvance.filter(item => 
        item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
        item.idEstadoVisita==this.idEstadoVisita&&
        item.fechaDate >= new Date(this.fechaInicio) &&
        item.fechaDate <= new Date(this.fechaFin)
      );
      console.log(this.resultsAux.length);

      console.log('buscando con dni avanzado');
      this.restaurarFiltros();
    }

    
      // filtro dni y actividad

      if (this.dniAvanzado !== '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad!==0 && this.idEstadoVisita==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.idPersona.includes(this.dniAvanzado) && 
          item.idActividad==this.idActividad
        );
        console.log(this.resultsAux.length);
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.idPersona.includes(this.dniAvanzado)&& 
          item.idActividad==this.idActividad
        );
        console.log(this.resultsAux.length);
  
  
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }

      // filtro nombre y actividad 

      if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado !== ''&& this.idActividad!==0 && this.idEstadoVisita==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
          item.idActividad==this.idActividad
        );
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
          item.idActividad==this.idActividad
        );
        console.log(this.resultsAux.length);
  
  
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }
      // filtro dni actividad y rango de fecha 

      if (this.dniAvanzado !== '' && this.fechaInicio !== '' && this.fechaFin !== '' && this.nombreFiltrAvanzado == ''&& this.idActividad!==0 && this.idEstadoVisita==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.idPersona.includes(this.dniAvanzado) && 
          item.idActividad==this.idActividad &&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
        console.log(this.resultsAux.length);
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.idPersona.includes(this.dniAvanzado)&& 
          item.idActividad==this.idActividad &&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
        console.log(this.resultsAux.length);
  
  
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }
      // filtro nombre actividad y rango de fecha 

      if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado !== ''&& this.idActividad!==0 && this.idEstadoVisita==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
          item.idActividad==this.idActividad&&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
  
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.nombreCompleto.toLowerCase().includes(this.nombreFiltrAvanzado.toLowerCase()) && 
          item.idActividad==this.idActividad&&
          item.fechaDate >= new Date(this.fechaInicio) &&
          item.fechaDate <= new Date(this.fechaFin)
        );
        console.log(this.resultsAux.length);
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }

      //filtro solo estado de visita 

      if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad==0 && this.idEstadoVisita!==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.idEstadoVisita==this.idEstadoVisita
        );
  
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.idEstadoVisita==this.idEstadoVisita
        );
        console.log(this.resultsAux.length);
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }

      //filtro solo actividad 
      if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad!==0 && this.idEstadoVisita==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.idActividad==this.idActividad
        );
  
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.idActividad==this.idActividad
        );
        console.log(this.resultsAux.length);
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }

      //filtro solo por nombre 

      if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado !== ''&& this.idActividad==0 && this.idEstadoVisita==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.nombreCompleto.toLowerCase().includes( this.nombreFiltrAvanzado)
        );
  
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.nombreCompleto.toLowerCase().includes( this.nombreFiltrAvanzado)
        );
        console.log(this.resultsAux.length);
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }

      // filtro estado visitaa y actividad
      
      if (this.dniAvanzado == '' && this.fechaInicio == '' && this.fechaFin == '' && this.nombreFiltrAvanzado == ''&& this.idActividad!==0 && this.idEstadoVisita!==0) {
        combinaciondeFiltro=true;
        this.resultsAux = this.ListaAvanceAux.filter(item => 
          item.idActividad==this.idActividad&&
          item.idEstadoVisita==this.idEstadoVisita
       
        );
  
  
        //lista que se muestra en el frond 
        this.results = this.ListaAvance.filter(item => 
          item.idActividad==this.idActividad&&
          item.idEstadoVisita==this.idEstadoVisita
          
        );
        console.log(this.resultsAux.length);
  
        console.log('buscando con dni avanzado');
        this.restaurarFiltros();
      }

      //estado visita , actividad y nombre 
      //estado visita , actividad y dni 
      //estado visita , actividad y rango de fechas 
      //estado visita , actividad y rango de fechas
  
    if(!combinaciondeFiltro){
      this.utils.presentAlertPersonalizadoDanger('','Combinacion de filtro no considerada');
     }
  }
  
  restaurarFiltros(){
    this.fechaInicio = '';
    this.fechaFin = '';
    this.nombreFiltrAvanzado = '';
    this.dniAvanzado = '';
    this.idActividad=0;
    this.idEstadoVisita=0;
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

  async eliminarAvance(id: any, index: any) {
    this.resetCountdown();
    // Mostrar un cuadro de diálogo de confirmación
    const confirmAlert = await this.alertController.create({
      header: '¿Está seguro de eliminar?',
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
          text: 'Eliminar',
          handler: async (data) => {

            /////
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

          },
        },
      ],
    });

    await confirmAlert.present();
    /////////////////////


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

    var listaExportar: Avance[] = [];
    if (this.resultsAux.length === 0) {
      listaExportar = this.ListaAvance;
    } else {
      listaExportar = this.resultsAux;
    }


    // Verificar si hay datos para generar el Excel
    if (this.resultsAux.length === 0 && this.ListaAvance.length === 0) {
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
            console.log(enteredFileName);
            if (enteredFileName === '') {
              console.log('entro a exportar sin nombre');
              // Validación si no se ingresa ningún nombre de archivo
              enteredFileName = 'listaAvance' + this.idUs;
              loading.dismiss();
              //return;
            }
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
              //     directory: Directory.Documents,
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



          },
        },
      ],
    });

    await confirmAlert.present();
  }


  crearLibro() {

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


  setOpen(isOpen: boolean, url: string, latitud: string, longitud: string, numCompromiso: string, numNoti: string, numPapeleta: string, estadoVisita: string,numInscripcion:any,idEstadoVisita:any,idActividad:any) {
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

    this.numCompromisoPago = numCompromiso;
    this.numPapelata = numPapeleta;
    this.numNotificacion = numNoti;
    this.estadoVisita = estadoVisita;
    this.numInscripcion=numInscripcion;
    this.idActividad=idActividad;
    this.estadoVisita=estadoVisita;

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

  mostrarImagenAmpliada(index: any) {


    this.urlimagenmodal = index;
  }

  setOpenModalImagen(isOpen: boolean) {
    this.isImagenAmpliada = isOpen;
  }
  doc: any;
  async descargarImagen(url: any, position: any) {
    this.openBrowser(url);
  }

  async cadrgarElimidados(){

    this.resetCountdown();
    this.contador = 1;
    this.http.get<any>(environment.ROOTAPI + 'buscarPadronVisitaAvancePorIdPersona/' + this.idUs + '/' + this.nombreUser + '/true'+'.htm')
      .subscribe({
        next: response => {
          
          if (response.id == '1') {
            const jsonData = JSON.parse(response.data);
            console.log(jsonData);
            this.ListaEliminados = jsonData;
            for (let i = 0; i < this.ListaEliminados.length; i++) {
              this.ListaEliminados[i].id = this.contador; // Asigna el contador como ID
              this.contador++; // Incrementa el contador para el siguiente elemento
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

  async restaurarAvance(idPadron:any, idPersona:any, nombreCompleto:any){



   ////////////////////////////////////////////////
       // Mostrar un cuadro de diálogo de confirmación
       const confirmAlert = await this.alertController.create({
        header: 'Esta seguro de restaurar',
        //  message: '¿Desea exportar el archivo Excel?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Restauracion cancelada');
            },
          },
          {
            text: 'Restaurar',
            handler: async (data) => {
             
                
   const formData = new FormData();
   formData.append('idPadronDetalleVisita', idPadron);
   formData.append('idPersona',idPersona);
   formData.append('nombreCompleto', nombreCompleto);
   this.http.post<any>(environment.ROOTAPI+'restaurarVisitaProyectoOtass.htm',formData).subscribe({

    next: response => {
      console.log(response);
      if (response.id == '1') {
        
        this.cadrgarElimidados();
        this.listarAvance(this.idUs);
        this.utils.presentAlertPersonalizado('','Restaurado Correctamente');
       
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

  
            },
          },
        ],
      });
  
      await confirmAlert.present();

  }

}

