import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { ToastService } from './services/toast/toast.service';
import { WindowService } from './services/window/window.service';
import { AuthService } from './services/firebase/auth/auth.service';
import { DatabaseService } from './services/firebase/database/database.service';
import { HomeModule } from './components/home/home.module';
import { ToolService } from './services/tool/tool.service';
import { FcmService } from './services/firebase/fcm/fcm.service';

export const MODULES = [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, // required animations module
    HomeModule,
    ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-center',
        preventDuplicates: true,
    })
];
export const COMPONENTS = [
];
export const PROVIDERS = [

    AuthService,
    DatabaseService,
    FcmService,
    ToastService,
    ToolService,
    WindowService,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ErrorInterceptor,
        multi: true
    }
];