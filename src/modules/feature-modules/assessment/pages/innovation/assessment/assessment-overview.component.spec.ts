import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppInjector, CoreModule } from '@modules/core';
import { StoresModule } from '@modules/stores';
import { AssessmentModule } from '@modules/feature-modules/assessment/assessment.module';

import { InnovationAssessmentOverviewComponent } from './assessment-overview.component';

import { AssessmentService } from '@modules/feature-modules/assessment/services/assessment.service';

import { NEEDS_ASSESSMENT_QUESTIONS } from '@modules/stores/innovation/config/needs-assessment-constants.config';


describe('FeatureModules/Assessment/Innovation/InnovationAssessmentOverviewComponent', () => {

  let activatedRoute: ActivatedRoute;

  let assessmentService: AssessmentService;

  let component: InnovationAssessmentOverviewComponent;
  let fixture: ComponentFixture<InnovationAssessmentOverviewComponent>;

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

    assessmentService = TestBed.inject(AssessmentService);

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };
    activatedRoute.snapshot.data = { innovationData: { id: 'Inno01', name: 'Innovation 01', support: { id: 'Inno01Support01', status: 'ENGAGING' }, assessment: {} } };

  });


  it('should create the component', () => {

    fixture = TestBed.createComponent(InnovationAssessmentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();

  });

  it('should show "needsAssessmentSubmited" success', () => {

    activatedRoute.snapshot.queryParams = { alert: 'needsAssessmentSubmited' };

    const expected = { type: 'SUCCESS', title: 'Needs assessment successfully completed' };

    fixture = TestBed.createComponent(InnovationAssessmentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.alert).toEqual(expected);

  });

  it('should run getInnovationNeedsAssessment() with a response with all RELEVANT information', () => {

    NEEDS_ASSESSMENT_QUESTIONS.innovation[1].label = '';

    const responseMock = {
      innovation: { id: '01', name: 'Innovation 01' },
      assessment: {
        description: 'description',
        maturityLevel: 'DISCOVERY',
        hasRegulatoryApprovals: 'YES',
        hasRegulatoryApprovalsComment: null,
        hasEvidence: 'YES',
        hasEvidenceComment: null,
        hasValidation: 'YES',
        hasValidationComment: null,
        hasProposition: 'YES',
        hasPropositionComment: null,
        hasCompetitionKnowledge: 'DISCOVERY',
        hasCompetitionKnowledgeComment: null,
        hasImplementationPlan: 'YES',
        hasImplementationPlanComment: null,
        hasScaleResource: 'YES',
        hasScaleResourceComment: null,
        summary: null,
        organisations: [{ id: 'OrgId', name: 'Org name', acronym: 'ORG', organisationUnits: [{ id: 'OrgUnitId', name: 'Org Unit name', acronym: 'ORGu' }] }],
        assignToName: '',
        finishedAt: null,
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: '2020-01-01T00:00:00.000Z',
        updatedAt: null,
        updatedBy: null,
        hasBeenSubmitted: true
      },
      support: { id: null }
    };
    assessmentService.getInnovationNeedsAssessment = () => of(responseMock);

    const expected = { ...responseMock.assessment, organisationsNames: ['Org name'] };

    fixture = TestBed.createComponent(InnovationAssessmentOverviewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.assessment).toEqual(expected);

  });

  it('should run getInnovationNeedsAssessment() with a response with EMPTY information', () => {

    const responseMock = {
      innovation: { id: '01', name: 'Innovation 01' },
      assessment: {
        description: 'description',
        maturityLevel: null,
        hasRegulatoryApprovals: null,
        hasRegulatoryApprovalsComment: null,
        hasEvidence: null,
        hasEvidenceComment: null,
        hasValidation: null,
        hasValidationComment: null,
        hasProposition: null,
        hasPropositionComment: null,
        hasCompetitionKnowledge: null,
        hasCompetitionKnowledgeComment: null,
        hasImplementationPlan: null,
        hasImplementationPlanComment: null,
        hasScaleResource: null,
        hasScaleResourceComment: null,
        summary: null,
        organisations: [],
        assignToName: '',
        finishedAt: null,
        createdAt: '2020-01-01T00:00:00.000Z',
        createdBy: '2020-01-01T00:00:00.000Z',
        updatedAt: null,
        updatedBy: null,
        hasBeenSubmitted: false
      },
      support: { id: null }
    };
    assessmentService.getInnovationNeedsAssessment = () => of(responseMock);

    const expected = { ...responseMock.assessment, organisationsNames: [] };

    fixture = TestBed.createComponent(InnovationAssessmentOverviewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.assessment).toEqual(expected);

  });

  it('should run getInnovationNeedsAssessment() with error', () => {

    assessmentService.getInnovationNeedsAssessment = () => throwError(false);

    const expected = undefined;

    fixture = TestBed.createComponent(InnovationAssessmentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.assessment).toBe(expected);

  });

});
