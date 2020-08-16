import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from '../../../model/user';
import { AuthenticateService } from '../../../services/authen.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss'],
})
export class LoginPopupComponent implements OnInit {
  routing: string;

  email: string;
  password: string;

  errorMessage: string;
  isErrorLogin = false;
  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    public bsModalRef: BsModalRef,
    private authenticateService: AuthenticateService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {}
  login() {
    if (
      this.email == null ||
      this.email === '' ||
      this.password == null ||
      this.password === ''
    ) {
      this.email = '';
      this.password = '';
      return;
    }

    this.authenticateService.login(this.email, this.password).subscribe(
      (res: any) => {
        this.isErrorLogin = false;
        this.triggerEvent(true);
        this.bsModalRef.hide();
        this.toastr.success('Login successfully!');
      },
      (err) => {
        if (err.status === 401) {
          this.errorMessage = err.error.message;
          this.isErrorLogin = true;
        }
      }
    );
  }
  triggerEvent(item: boolean) {
    this.event.emit({ data: item, res: 200 });
  }
}
