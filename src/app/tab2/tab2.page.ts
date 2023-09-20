import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  
  nombreUser:any;
  idUs:any;
  
  constructor(private router: Router,public navCtrl: NavController) {}

  ngOnInit() {


  }
  ionViewDidEnter() {
    this.nombreUser=localStorage.getItem('nombreUser');
    this.idUs=localStorage.getItem('idUsuario');
  }

  regresarTologin(){
    this.navCtrl.navigateBack('/tab1'); // este es el tab 1 del lecturista 
  }
}
