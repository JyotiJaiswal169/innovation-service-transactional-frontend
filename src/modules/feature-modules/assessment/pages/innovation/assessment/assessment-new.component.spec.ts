import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppInjector, CoreModule } from '@modules/core';
import { StoresModule } from '@modules/stores';
import { FormEngineComponent } from '@modules/shared/forms';
import { AssessmentModule } from '@modules/feature-modules/assessment/assessment.module';

import { InnovationAssessmentNewComponent } from './assessment-new.component';

import { AssessmentService } from '@modules/feature-modules/assessment/services/assessment.service';
import { INNOVATION_STATUS } from '@modules/stores/innovation/innovation.models';


describe('FeatureModules/Assessment/Innovation/Assessment/InnovationAssessmentNewComponent', () => {

  let activatedRoute: ActivatedRoute;
  let router: Router;
  let routerSpy: jasmine.Spy;

  let component: InnovationAssessmentNewComponent;
  let fixture: ComponentFixture<InnovationAssessmentNewComponent>;

  let assessmentService: AssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CoreModule,
        StoresModule,
        AssessmentModule
      ]
    });

    AppInjector.setInjector(TestBed.inject(Injector));

    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    assessmentService = TestBed.inject(AssessmentService);

  });

  it('should create the component', () => {
    fixture = TestBed.createComponent(InnovationAssessmentNewComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });


  it('should run getInnovationInfo() with success', () => {

    const responseMock = {
      summary: { id: '01', name: 'Innovation 01', status: 'CREATED' as keyof typeof INNOVATION_STATUS, description: 'A description', company: 'User company', countryName: 'England', postCode: 'SW01', categories: ['Medical'], otherCategoryDescription: '' },
      contact: { name: 'A name', email: 'email', phone: '' },
      assessment: { id: '01', assignToName: 'Name' }
    };
    assessmentService.getInnovationInfo = () => of(responseMock);

    const expected = responseMock.summary.name;

    fixture = TestBed.createComponent(InnovationAssessmentNewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.innovationName).toBe(expected);

  });

  it('should run getInnovationInfo() with error', () => {

    assessmentService.getInnovationInfo = () => throwError(false);

    fixture = TestBed.createComponent(InnovationAssessmentNewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.innovationName).toBe('');

  });

  it('should run onSubmit() with NO formEngineComponent defined', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    assessmentService.createInnovationNeedsAssessment = () => of({ id: 'Assess01' });

    fixture = TestBed.createComponent(InnovationAssessmentNewComponent);
    component = fixture.componentInstance;

    component.onSubmit();
    fixture.detectChanges();
    expect(routerSpy).not.toHaveBeenCalledWith(['/assessment/innovations/Inno01/assessments/Assess01/edit'], {});

  });

  it('should run onSubmit() with invalid form data', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    assessmentService.createInnovationNeedsAssessment = () => of({ id: 'Assess01' });

    fixture = TestBed.createComponent(InnovationAssessmentNewComponent);
    component = fixture.componentInstance;

    component.formEngineComponent = TestBed.createComponent(FormEngineComponent).componentInstance;
    component.formEngineComponent.getFormValues  = () => ({ valid: false, data: { value1: 'some value' } });

    component.onSubmit();
    fixture.detectChanges();

    expect(routerSpy).not.toHaveBeenCalledWith(['/assessment/innovations/Inno01/assessments/Assess01/edit'], {});

  });

  it('should run onSubmit() with valid form data and API success', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    assessmentService.createInnovationNeedsAssessment = () => of({ id: 'Assess01' });

    fixture = TestBed.createComponent(InnovationAssessmentNewComponent);
    component = fixture.componentInstance;

    component.formEngineComponent = TestBed.createComponent(FormEngineComponent).componentInstance;
    component.formEngineComponent.getFormValues  = () => ({ valid: true, data: { value1: 'some value' } });

    component.onSubmit();
    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/assessment/innovations/Inno01/assessments/Assess01/edit'], {});

  });

  it('should submit survey with valid form data and API failed', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    assessmentService.createInnovationNeedsAssessment = () => throwError('error');

    const expected = {
      type: 'ERROR',
      title: 'An error occurred when starting needs assessment',
      message: 'Please try again or contact us for further help',
      setFocus: true
    };

    fixture = TestBed.createComponent(InnovationAssessmentNewComponent);
    component = fixture.componentInstance;

    component.formEngineComponent = TestBed.createComponent(FormEngineComponent).componentInstance;
    component.formEngineComponent.getFormValues  = () => ({ valid: true, data: { value1: 'some value' } });

    component.onSubmit();
    fixture.detectChanges();
    expect(component.alert).toEqual(expected);

  });

});
