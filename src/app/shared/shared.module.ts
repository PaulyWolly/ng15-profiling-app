import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EditContentComponent } from './components/edit-content/edit-content.component';

@NgModule({
  declarations: [
    EditContentComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    EditContentComponent
  ]
})
export class SharedModule { }
