import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { UtilServices } from '../services/utils.service';
@Component({
  selector: 'app-tab6',
  templateUrl: 'tab6.page.html',
  styleUrls: ['tab6.page.scss']
})
export class Tab6Page {

  constructor(private router: Router, public navCtrl: NavController, private http: HttpClient, private utils: UtilServices) { }

  ngOnInit() {


  }
  ionViewWillEnter() {
   
  }
  ionViewWillLeave() {

  }
 
 

}
