import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap } from 'rxjs/operators';

import { CoreComponent } from '@app/base';
import { FormEngineComponent, FormEngineHelper, FormEngineModel } from '@app/base/forms';

import { FIRST_TIME_SIGNIN_QUESTIONS } from '@stores-module/innovation/config/first-time-signin-catalog.config';

import { OrganisationsService } from '@shared-module/services/organisations.service';

import { InnovatorService } from '../../services/innovator.service';

@Component({
  selector: 'app-innovator-pages-first-time-signin',
  templateUrl: './first-time-signin.component.html'
})
export class FirstTimeSigninComponent extends CoreComponent implements OnInit {

  @ViewChild(FormEngineComponent) formEngineComponent?: FormEngineComponent;

  stepsData: FormEngineModel[] = [];
  currentStep: {
    number: number;
    data: FormEngineModel;
  };
  totalNumberOfSteps: number;

  currentAnswers: { [key: string]: any };
  summaryList: {
    items: { label: string, value: string, url: string, errorMessage: string | null }[];
    valid: boolean;
  };

  isFirstStep(): boolean { return this.currentStep.number === 1; }
  isLastStep(): boolean { return this.currentStep.number === this.totalNumberOfSteps; }
  isQuestionStep(): boolean { return Number.isInteger(Number(this.activatedRoute.snapshot.params.id)); }
  isSummaryStep(): boolean { return this.activatedRoute.snapshot.params.id === 'summary'; }

  isValidStepId(): boolean {
    const id = this.activatedRoute.snapshot.params.id;
    return ((1 <= Number(id) && Number(id) <= this.stepsData.length) || id === 'summary');
  }

  isVisibleStep(stepId: number): boolean {
    const step = this.stepsData[stepId - 1];
    return (!step.visibility || (step.visibility && step.visibility.values.includes(this.currentAnswers[step.visibility.parameter])));
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private innovatorService: InnovatorService,
    private organisationsService: OrganisationsService
  ) {

    super();

    this.stepsData = FIRST_TIME_SIGNIN_QUESTIONS;
    this.totalNumberOfSteps = this.stepsData.length;

    this.currentStep = {
      number: Number(this.activatedRoute.snapshot.params.id),
      data: new FormEngineModel({ parameters: [] })
    };

    this.currentAnswers = {};
    this.summaryList = { items: [], valid: false };

  }


  ngOnInit(): void {

    // Update last step with the organisations list with description and pre-select all checkboxes.
    this.organisationsService.getAccessorsOrganisations().subscribe(response => {
      this.stepsData[this.stepsData.length - 1].description = `<a href="/about-the-service/who-we-are" target="_blank" rel="noopener noreferrer"> What does each organisation do? (opens in a new window) </a>`;
      this.stepsData[this.stepsData.length - 1].parameters[0].items = response.map(item => ({ value: item.id, label: item.name }));
      this.currentAnswers = { organisationShares: response.map(item => item.id) };
    });

    this.subscriptions.push(
      this.activatedRoute.params.subscribe(params => {

        this.currentStep.number = Number(params.id);

        if (!this.isValidStepId()) {
          this.redirectTo('not-found');
          return;
        }

        if (this.isQuestionStep()) {

          if (!this.isVisibleStep(this.currentStep.number)) {

            // Remove previously anwsered questions if it is currenly invisible.
            this.stepsData[this.currentStep.number - 1].parameters.forEach(p => {
              delete this.currentAnswers[p.id];
            });

            this.redirectTo(this.getNavigationUrl(this.activatedRoute.snapshot.queryParams.a));
            return;
          }

          this.currentStep.data = this.stepsData[this.currentStep.number - 1];
          this.currentStep.data.defaultData = this.currentAnswers;

          this.setPageTitle(this.currentStep.data.parameters[0].label || ''); // 1 question per page approach.
        }

        if (this.isSummaryStep()) {
          this.setPageTitle('First Time Signin failed');
          this.prepareSummaryData();
        }

      })
    );

  }


  onSubmitStep(action: 'previous' | 'next'): void {

    const formData = this.formEngineComponent?.getFormValues();

    if (action === 'next' && !formData?.valid) { // Apply validation only when moving forward.
      return;
    }

    this.currentAnswers = { ...this.currentAnswers, ...formData!.data };

    if (this.isLastStep() && action === 'next') { this.onSubmitSurvey(); }
    else { this.redirectTo(this.getNavigationUrl(action), { a: action }); }

  }

  onSubmitSurvey(): void {

    this.prepareSummaryData();

    if (this.summaryList.valid) {
      this.innovatorService.submitFirstTimeSigninInfo('FIRST_TIME_SIGNIN', this.currentAnswers).pipe(
        concatMap(() => {
          return this.stores.authentication.initializeAuthentication$(); // Initialize authentication in order to update First Time SignIn information.
        })
      ).subscribe(
        () => this.redirectTo(`innovator/dashboard`),
        () => this.redirectTo(`innovator/first-time-signin/summary`)
      );
    }

  }

  getNavigationUrl(action: 'previous' | 'next'): string {

    let url = `innovator`;

    switch (action) {
      case 'previous':
        if (this.isFirstStep()) { url += ''; }
        else if (this.isSummaryStep()) { url += `/first-time-signin/${this.stepsData.length}`; }
        else { url += `/first-time-signin/${this.currentStep.number - 1}`; }
        break;

      case 'next':
        if (this.isLastStep()) { url += '/first-time-signin/summary'; }
        else { url += `/first-time-signin/${this.currentStep.number + 1}`; }
        break;

      default: // Should NOT happen!
        url += '';
        break;
    }

    return url;

  }

  prepareSummaryData(): void {

    this.summaryList = { items: [], valid: true };

    const parameters = this.stepsData.filter((step, i) => this.isVisibleStep(i + 1)).map(fd => fd.parameters).reduce((a, p) => [...a, ...p], []);
    const form = FormEngineHelper.buildForm(parameters, this.currentAnswers);
    const errors = FormEngineHelper.getErrors(form);

    this.summaryList.valid = form.valid;
    this.stepsData.forEach((step, stepIndex) => {
      if (this.isVisibleStep(stepIndex + 1)) {
        step.parameters.forEach(p => {
          this.summaryList.items.push({ label: step.parameters[0].label || '', value: this.currentAnswers[p.id], url: `/innovator/first-time-signin/${stepIndex + 1}`, errorMessage: errors[p.id] || null });
        });
      }
    });

  }

}
