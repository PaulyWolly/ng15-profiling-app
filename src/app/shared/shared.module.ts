import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EditContentComponent } from './components/edit-content/edit-content.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { PreviewTemplateComponent } from './components/preview-template/preview-template.component';

@NgModule({
  declarations: [
    EditContentComponent,
    SafeUrlPipe,
    PreviewTemplateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    EditContentComponent,
    SafeUrlPipe,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PreviewTemplateComponent
  ]
})
export class SharedModule { }
