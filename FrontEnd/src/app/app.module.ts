import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './courses/courses.component';
import { CourseComponent } from './course/course.component';
import { LoginPopupComponent } from './popup/login-popup/login-popup.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RegisterPopupComponent } from './popup/register-popup/register-popup.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { AppService } from '../services/app.service';
import { PaymentComponent } from './payment/payment.component';
import { AuthenticateService } from '../services/authen.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ToastrModule } from 'ngx-toastr';
import { UserValidGuard } from './guards/user-valid.guard';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CartComponent } from './cart/cart.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ManageCoursesComponent } from './admin/manage-courses/manage-courses.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { CreateCoursePopupComponent } from './popup/create-course-popup/create-course-popup.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OverviewComponent } from './admin/overview/overview.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ManagePromotionComponent } from './admin/manage-promotion/manage-promotion.component';
import { ProfileUserPopupComponent } from './popup/profile-user-popup/profile-user-popup.component';
import { AddPromotionPopupComponent } from './popup/add-promotion-popup/add-promotion-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CoursesComponent,
    CourseComponent,
    LoginPopupComponent,
    RegisterPopupComponent,
    ProfileComponent,
    AdminComponent,
    PaymentComponent,
    CartComponent,
    ManageCoursesComponent,
    ManageUsersComponent,
    CreateCoursePopupComponent,
    OverviewComponent,
    ManagePromotionComponent,
    ProfileUserPopupComponent,
    AddPromotionPopupComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ToastrModule.forRoot({
      timeOut: 3000,
    }),
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    RatingModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    NgxPaginationModule,
    NgxChartsModule,
  ],
  providers: [AppService, AuthenticateService, DatePipe, UserValidGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
