import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { UtilServices } from '../services/utils.service';
import { environment } from 'src/environments/environment.prod';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  suminsitro: any;
  nombreUser: any;
  idUs: any;
  newMarker: any;
  address?: string[]
  lastIndexToShow = 15;
  listaCuentaCorriente: any[] = [];
  results:any[] = [];
  constructor(private router: Router,
    public navCtrl: NavController,
    private http: HttpClient,
    private utils: UtilServices
  ) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.suminsitro = localStorage.getItem('suministro');
    this.nombreUser = localStorage.getItem('nombreUser');
    this.idUs = localStorage.getItem('idUsuario');
    this.cuentaCorriente();
  }
  ionViewDidLeave(){
    console.log('usame');
    this.listaCuentaCorriente=[];
    this.results=[];
    //this.suminsitro = localStorage.removeItem('suministro');
  }
  cuentaCorriente() {
    //this.utils.loader();
    if (this.suminsitro == null) {
      this.listaCuentaCorriente = [];
    }
    this.http.get<any>(environment.ROOTAPI+'consultarCuentaCorriente/' + this.suminsitro + '.htm')
      .subscribe( 
        {
          next: response => {
          if (response.id == '1') {
           // this.utils.closeLoader();
            const jsonData = JSON.parse(response.data);
            this.listaCuentaCorriente = jsonData.reverse();
            this.results = [...this.listaCuentaCorriente]
            console.log('capturando deuda');
            console.log(this.results[0].saldo);
            localStorage.setItem('montoDeuda',this.results[0].saldo);
            //console.log(jsonData);
            this.loadMoreData();
            if (this.listaCuentaCorriente.length > 0) {
             // this.utils.mostrarToast(response.mensaje, 1000, 'success');
            } else {
              this.utils.mostrarToast('NO HAY DATOS QUE MOSTRAR', 500, 'warning');
            }
          }else if (response.id == '2' || response.id == '3') {
            //this.utils.closeLoader();
            this.utils.mostrarToast('ERROR AL BUSCAR SUMINISTRO: ' + response.mensaje, 1000, 'warning');
          }else  {
            this.utils.closeLoader();
            this.utils.mostrarToast('ERROR AL BUSCAR SUMINISTRO: desconocido', 1000, 'warning');
            throw new Error('Error desconocido al buscar el suministro');
          }

        },
        error: error => {
          console.log(error);
          if(error.status==400){
            //this.utils.closeLoader();
            this.utils.mostrarToast('DEBE CARGAR UN SUMINISTRO EN INICIO', 500, 'warning');
          }else{
            this.utils.mostrarToast('ERROR DE API ' + 'STATUS ' + error.status + ' ' + error.statusText, 2000, 'danger');
          console.error(error);
         // this.utils.closeLoader();
          }
         // this.utils.closeLoader();
        },
        complete: () => {
          console.log('Solicitud completada.');
        }

  });
  }

  loadMoreData(event?: any) {

    // Verifica si hay más elementos para mostrar
    if (this.lastIndexToShow < this.listaCuentaCorriente.length) {
      // Incrementa el índice para mostrar los siguientes 5 elementos
      this.lastIndexToShow += 20;
      // Agrega los elementos al resultado para mostrarlos
      const additionalResults = this.listaCuentaCorriente.slice(0, this.lastIndexToShow);
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


  regresarTologin() {
    this.navCtrl.navigateBack('/tab1'); // este es el tab 1 del lecturista 
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.suminsitro = localStorage.getItem('suministro');
      this.cuentaCorriente();
      event.target.complete();
    }, 2000);
  }

}
