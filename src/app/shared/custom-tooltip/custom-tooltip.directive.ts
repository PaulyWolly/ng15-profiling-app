import {
  Directive, Input, HostListener, ApplicationRef, ComponentRef, ComponentFactoryResolver, Injector
} from '@angular/core';
import { CustomTooltipComponent } from './custom-tooltip.component';

@Directive({
  selector: '[appCustomTooltip]',
  standalone: true
})
export class CustomTooltipDirective {
  @Input('appCustomTooltip') text = '';
  @Input() tooltipBgColor = '#222';
  @Input() tooltipTextColor = '#fff';
  @Input() tooltipFont = 'Arial, sans-serif';
  @Input() tooltipBorder = '1px solid #333';

  private tooltipRef: ComponentRef<CustomTooltipComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    if (!this.tooltipRef) {
      const factory = this.resolver.resolveComponentFactory(CustomTooltipComponent);
      this.tooltipRef = factory.create(this.injector);
      this.setTooltipProps(event);
      this.tooltipRef.instance.visible = true;
      this.appRef.attachView(this.tooltipRef.hostView);
      document.body.appendChild((this.tooltipRef.hostView as any).rootNodes[0]);
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.tooltipRef) {
      this.setTooltipProps(event);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.tooltipRef) {
      this.appRef.detachView(this.tooltipRef.hostView);
      this.tooltipRef.destroy();
      this.tooltipRef = null;
    }
  }

  private setTooltipProps(event: MouseEvent) {
    if (this.tooltipRef) {
      this.tooltipRef.instance.text = this.text;
      this.tooltipRef.instance.bgColor = this.tooltipBgColor;
      this.tooltipRef.instance.textColor = this.tooltipTextColor;
      this.tooltipRef.instance.font = this.tooltipFont;
      this.tooltipRef.instance.border = this.tooltipBorder;
      // Position: just below and to the right of the cursor
      this.tooltipRef.instance.top = event.clientY + 16;
      this.tooltipRef.instance.left = event.clientX + 12;
    }
  }
} 