import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/services/app.service';
import { User } from 'src/model/user';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProfileUserPopupComponent } from 'src/app/popup/profile-user-popup/profile-user-popup.component';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit {
  lsUsers: User[] = [];
  modalRef: BsModalRef;

  constructor(private appService: AppService, private bsModalService: BsModalService) {}


  ngOnInit(): void {
    this.appService.getAllUsers().subscribe(
      (res) => {
        this.lsUsers = res;
      },
      (err) => {}
    );
  }

  doubleClick(userId){
    const initialState = {
      userId: userId
    }
    this.modalRef = this.bsModalService.show(ProfileUserPopupComponent, { class: 'modal-xl',initialState });

  }
}
