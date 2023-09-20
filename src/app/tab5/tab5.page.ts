import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page {
  
  constructor(private router: Router,public navCtrl: NavController) {}

  ngOnInit() {


  }
  ionViewWillLeave() {
    
  }


 
}
