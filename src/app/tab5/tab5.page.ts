import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { UtilServices } from '../services/utils.service';
@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page {
  suminsitro: any;
  monto: number = 0;
  cuotaInicial: number;
  numeroCuotas: number;
  montoCantidadFija: number;
  saldoFinanciar: number;
  mostrarCardCalcular = false;
  tasa: number;
  listaSimulacionDeuda: any;
  constructor(private router: Router, public navCtrl: NavController, private http: HttpClient, private utils: UtilServices) { }

  ngOnInit() {


  }
  ionViewWillEnter() {
    this.tasa = environment.TASA;
    this.suminsitro = localStorage.getItem('suministro');
    this.monto = parseFloat('' + localStorage.getItem('montoDeuda'));
    console.log(this.monto);
  }
  ionViewWillLeave() {

  }
 
  calcularNumCuotasConvenio_SISGECO(montoAPlazo: number, cuotaFija: number, tasa: number): number {
    let numCuotas: number;
    if (tasa > 0) {
      const uno_tasa: number = 1 + tasa;
      const valor: number = cuotaFija / (montoAPlazo * tasa);
      const valor_neo: number = valor / (valor - 1);
      numCuotas = Math.log(valor_neo) / Math.log(uno_tasa); // Logaritmo natural
    } else {
      numCuotas = montoAPlazo / cuotaFija;
    }
    return Math.round(numCuotas);
  }


  calcularCuotaFijaConvenio_SISGECO(montoAPlazo: any, numCuotas: any, tasa: any) {
    var cuotaFija;
    if (tasa > 0) {
      var v1 = 1 + tasa;
      var v2 = Math.pow(v1, numCuotas);
      cuotaFija = (montoAPlazo * tasa * v2) / (v2 - 1);
    } else {
      cuotaFija = montoAPlazo / numCuotas;
    }
    return cuotaFija;
  }
  calcularSimulacion() {
    this.saldoFinanciar = parseFloat((this.monto - this.cuotaInicial).toFixed(2));
    if (this.numeroCuotas > 0) {
      this.montoCantidadFija = parseFloat(this.calcularCuotaFijaConvenio_SISGECO(this.saldoFinanciar, this.numeroCuotas, this.tasa).toFixed(2));
    } else if (this.montoCantidadFija > 0) {
      this.numeroCuotas = this.calcularNumCuotasConvenio_SISGECO(this.saldoFinanciar, Number(this.montoCantidadFija), Number(this.tasa));
      console.log(this.numeroCuotas);
    }

    if (this.cuotaInicial) {

      this.mostrarCardCalcular = true;
      this.http.post<any>(environment.ROOTAPI +'generarSimulacionCuotasConvenio/' + this.cuotaInicial + '/' + this.saldoFinanciar + '/' + this.numeroCuotas + '/' + this.tasa + '/' + this.montoCantidadFija + '.htm', {})
        .subscribe({
          next:response => {
            if (response.id == '1') {
              console.log(response);
              this.listaSimulacionDeuda = JSON.parse(response.data)
              console.log(this.listaSimulacionDeuda);

            } else if (response.id == '2' || response.id == '3') {
              this.utils.mostrarToast(JSON.stringify(response.mensaje), 5000, 'danger');

            } 

          },
          error:error => {
            console.error(error);
            this.utils.mostrarToast(JSON.stringify(error), 5000, 'danger');

          },
          complete:()=> {
              console.log('consumo completado');
          }
         } );
    } else {
      this.utils.mostrarToast('Ingresar cuota inicial', 1000, 'warning')
    }

  }

  refrecarContenedores(event: any) {
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  recalcularSaldo(event: any) {
    this.saldoFinanciar = parseFloat((this.monto - this.cuotaInicial).toFixed(2));
    console.log(event);
  }

  limpiar() {
    this.numeroCuotas = NaN;
    this.montoCantidadFija = NaN;
    this.saldoFinanciar = NaN;
    this.cuotaInicial = NaN;
    this.listaSimulacionDeuda = [];
    this.mostrarCardCalcular = false;
  }

}
