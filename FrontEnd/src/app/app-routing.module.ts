import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoursesComponent } from './courses/courses.component';
import { HomeComponent } from './home/home.component';
import { CourseComponent } from './course/course.component';
import { ProfileComponent } from './profile/profile.component';
import { UserValidGuard } from './guards/user-valid.guard';
import { CartComponent } from './cart/cart.component';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'courses', component: CoursesComponent, data: { title: 'Courses'} },
  { path: 'courses/cat/:categoryId', component: CoursesComponent, data: { title: 'Courses'}},
  { path: 'courses/sort/:sortType', component: CoursesComponent, data: { title: 'Courses'}},
  {
    path: 'course/:id',
    component: CourseComponent,
    runGuardsAndResolvers: 'always',
    data: { title: 'Course'}
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [UserValidGuard],
    data: { title: 'Profile'}
  },
  // { path: 'create-course', component: CreateCourseComponent },
  { path: 'cart', component: CartComponent, canActivate: [UserValidGuard], data: { title: 'Cart'} },
  { path: 'admin', component: AdminComponent, data: { title: 'Admin'} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
