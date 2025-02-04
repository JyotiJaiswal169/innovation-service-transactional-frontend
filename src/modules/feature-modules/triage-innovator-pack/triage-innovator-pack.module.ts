import { NgModule } from '@angular/core';

import { ThemeModule } from '@modules/theme/theme.module';
import { SharedModule } from '@modules/shared/shared.module';

import { TriageInnovatorPackRoutingModule } from './triage-innovator-pack-routing.module';

// Pages.
import { SurveyStartComponent } from './pages/survey/start.component';
import { SurveyStepComponent } from './pages/survey/step.component';

// Services.
import { SurveyService } from './services/survey.service';


@NgModule({
  imports: [
    ThemeModule,
    SharedModule,

    TriageInnovatorPackRoutingModule
  ],
  declarations: [
    // Pages.
    SurveyStartComponent,
    SurveyStepComponent
  ],
  providers: [
    SurveyService
  ]
})
export class TriageInnovatorPackModule { }
