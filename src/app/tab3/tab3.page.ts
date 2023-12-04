import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PhotoService } from '../services/photo.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilServices } from '../services/utils.service';
import { Avance } from '../entidades/Avance';
import { environment } from 'src/environments/environment.prod';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  ListaAvance: Avance[] = [];
  results: Avance[] = [];
  dni: any;
  nombreUser: any;
  idUs: any;
  lastIndexToShow = 15;
  tipoUsuario: any;
  mostrarAvance = false;
  mont?: any;
  constructor(private http: HttpClient,
    public photoService: PhotoService,
    public alertController: AlertController,
    private utils: UtilServices,
    private router: Router) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.nombreUser = localStorage.getItem('nombreUser');
    this.idUs = localStorage.getItem('idUsuario');
    this.tipoUsuario = localStorage.getItem('perfil');
    this.dni = localStorage.getItem('idUsuario');
    this.listarAvance(this.dni);
  }

  async listarAvance(dni: any) {
    this.http.get<any>(environment.ROOTAPI+'buscarPadronVisitaAvancePorIdPersona/' + dni +'/'+this.nombreUser+ '.htm')
      .subscribe({
        next: response => {
          if (response.id == '1') {
            const jsonData = JSON.parse(response.data);
            console.log(response.data);
            this.ListaAvance = jsonData;
            console.log(this.ListaAvance);
            this.results = [...this.ListaAvance]
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

}

