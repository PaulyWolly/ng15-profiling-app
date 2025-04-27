import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-preview-template',
  templateUrl: './preview-template.component.html',
  styleUrls: ['./preview-template.component.scss']
})
export class PreviewTemplateComponent implements OnInit {
  @Input() title: string = '';

  constructor() {
    console.log('[PreviewTemplateComponent] constructor called');
  }

  ngOnInit() {
    console.log('[PreviewTemplateComponent] ngOnInit - title:', this.title);
  }
} 