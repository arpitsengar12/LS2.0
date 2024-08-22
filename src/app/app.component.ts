import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToggleService } from './shared/header/toggle.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    title = 'Tagus - Material Design Angular Admin Dashboard Template';

    isToggled = false;

    constructor(
        public router: Router,
        private toggleService: ToggleService,
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

}