import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './components/alert/alert.component';
import { TitleComponent } from './components/title/title.component';
import { EditContentComponent } from './components/edit-content/edit-content.component';

@NgModule({
  declarations: [
    AlertComponent,
    EditContentComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TitleComponent
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AlertComponent,
    TitleComponent,
    EditContentComponent
  ]
})
export class SharedModule { }
