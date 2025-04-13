import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { GameBoardComponent } from './game-play/game-board/game-board.component';
import { JoinTableComponent } from './game-play/join-table/join-table.component';
import { CreateTableComponent } from './game-play/create-table/create-table.component';
import { ChatModule } from "./features/chat/chat.module";

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    JoinTableComponent,
    CreateTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: environment.production,
        autoPause: true,
        trace: false,
        traceLimit: 75,
    }),
    ChatModule
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
