import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { fromEvent as observableFromEvent, Subscription } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CesiumService } from '../../../../angular-cesium/services/cesium/cesium.service';


/**
 * Toolbar widget, act as a container for ac-toolbar-button components
 * allowing drag configuration and passing `toolbarClass` as attributes
 *
 * Usage:
 * ```
 * <ac-toolbar [allowDrag]="true">
     <ac-toolbar-button [iconUrl]="'assets/home-icon.svg'" (onClick)="goHome()">
     </ac-toolbar-button>
     <ac-toolbar-button [iconUrl]="'assets/explore-icon.svg'" (onClick)="rangeAndBearing()">
     </ac-toolbar-button>
 </ac-toolbar>
 * ```
 *
 */
@Component(
  {
    selector : 'ac-toolbar',
    template : `
        <div class="{{toolbarClass}}">
            <div *ngIf="allowDrag">
                <ac-toolbar-button>
                    <ac-drag-icon></ac-drag-icon>
                </ac-toolbar-button>
            </div>

            <ng-content></ng-content>
        </div>
    `,
    styles : [`
        :host {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 20px;
            height: 20px;
            z-index: 999;
            -webkit-user-drag: none;
        }
    `],
    changeDetection : ChangeDetectionStrategy.OnPush,
  }
)
export class AcToolbarComponent implements OnInit, OnDestroy {
  @Input()
  toolbarClass: string;
  @Input()
  allowDrag = true;
  
  dragStyle = {
    'height.px' : 20,
    'width.px' : 20,
  };
  
  private subscription: Subscription;
  
  constructor(private element: ElementRef, private cesiumService: CesiumService) {
  }
  
  ngOnInit() {
    this.cesiumService.getMap().getMapContainer().appendChild(this.element.nativeElement);
    if (this.allowDrag) {
      const mouseDown$ = observableFromEvent(this.element.nativeElement, 'mousedown');
      const mouseMove$ = observableFromEvent(document, 'mousemove');
      const mouseUp$ = observableFromEvent(document, 'mouseup');
      
      const drag$ = mouseDown$.pipe(switchMap(() => mouseMove$.pipe(takeUntil(mouseUp$))));
      
      this.subscription = drag$.subscribe((event: MouseEvent) => {
        this.element.nativeElement.style.left = event.x + 'px';
        this.element.nativeElement.style.top = event.y + 'px';
      })
    }
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
        this.subscription.unsubscribe()
    }
  }
}
