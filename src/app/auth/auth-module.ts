import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from './login';
import { LoginService } from './login.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, Login],
  providers: [LoginService],
})
export class AuthModule {}
