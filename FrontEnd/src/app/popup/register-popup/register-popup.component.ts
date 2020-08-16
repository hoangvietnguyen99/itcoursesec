import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticateService } from '../../../services/authen.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-popup',
  templateUrl: './register-popup.component.html',
  styleUrls: ['./register-popup.component.scss'],
})
export class RegisterPopupComponent implements OnInit {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  isConfirm = true;
  errorMessage: string;
  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    public bsModalRef: BsModalRef,
    private authenticateService: AuthenticateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  registerUser() {
    if (
      this.username == null ||
      this.username === '' ||
      this.email == null ||
      this.email === '' ||
      this.password == null ||
      this.password === '' ||
      this.confirmPassword == null ||
      this.confirmPassword === ''
    ) {
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.isConfirm = false;
      return;
    }
    this.isConfirm = true;
    this.authenticateService
      .registerUser(this.username, this.email, this.password)
      .subscribe(
        (res: any) => {
          this.triggerEvent(true);
          this.errorMessage = null;
          this.bsModalRef.hide();
        },
        (err) => {
          if (err.status === 409) {
            this.errorMessage = err.error.message;
          }
        }
      );
  }

  triggerEvent(item: boolean) {
    this.event.emit({ data: item, res: 200 });
  }
}
