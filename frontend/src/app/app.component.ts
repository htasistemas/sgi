import { Component } from '@angular/core';
import { CadastrosComponent } from './features/cadastros/cadastros.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CadastrosComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
