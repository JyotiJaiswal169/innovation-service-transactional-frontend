import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { CoreService } from '@app/base';

import { APIQueryParamsType, DatesHelper, MappedObject, UrlModel } from '@modules/core';

import { INNOVATION_STATUS } from '@modules/stores/innovation/innovation.models';
import { mainCategoryItems } from '@modules/stores/innovation/sections/catalogs.config';


export type getInnovationsListEndpointInDTO = {
  count: number;
  data: {
    id: string;
    name: string;
    countryName: string;
    postCode: string;
    mainCategory: string;
    otherMainCategoryDescription: string;
    submittedAt: string; // "2021-04-16T09:23:49.396Z",
    assessment: {
      id: string,
      createdAt: string; // "2021-04-16T09:23:49.396Z",
      assignTo: { name: string };
      finishedAt: string; // "2021-04-16T09:23:49.396Z",
    };
    organisations: string[];
    notifications: {
      count: number;
      isNew: boolean;
    };
  }[];
};
export type getInnovationsListEndpointOutDTO = {
  count: number;
  data: (Omit<getInnovationsListEndpointInDTO['data'][0], 'otherMainCategoryDescription'> & { isOverdue: boolean })[]
};

export type getInnovationInfoEndpointDTO = {
  summary: {
    id: string;
    name: string;
    status: keyof typeof INNOVATION_STATUS;
    description: string;
    company: string;
    countryName: string;
    postCode: string;
    categories: string[];
    otherCategoryDescription: null | string;
  };
  contact: {
    name: string;
    email: string;
    phone: null | string;
  };
  assessment?: {
    id: string;
    assignToName: string;
  };
};


export type getInnovationNeedsAssessmentEndpointInDTO = {
  id: string;
  innovation: { id: string; name: string; };
  description: null | string;
  maturityLevel: null | string;
  hasRegulatoryApprovals: null | string;
  hasRegulatoryApprovalsComment: null | string;
  hasEvidence: null | string;
  hasEvidenceComment: null | string;
  hasValidation: null | string;
  hasValidationComment: null | string;
  hasProposition: null | string;
  hasPropositionComment: null | string;
  hasCompetitionKnowledge: null | string;
  hasCompetitionKnowledgeComment: null | string;
  hasImplementationPlan: null | string;
  hasImplementationPlanComment: null | string;
  hasScaleResource: null | string;
  hasScaleResourceComment: null | string;
  summary: null | string;
  organisations: { id: string; name: string; acronym: null | string, organisationUnits: { id: string; name: string; acronym: string; }[] }[];
  assignToName: string;
  finishedAt: null | string;
  createdAt: string;
  createdBy: string;
  updatedAt: null | string;
  updatedBy: null | string;
};
export type getInnovationNeedsAssessmentEndpointOutDTO = {
  innovation: { id: string; name: string; };
  assessment: Omit<getInnovationNeedsAssessmentEndpointInDTO, 'id' | 'innovation'> & { hasBeenSubmitted: boolean}
};


@Injectable()
export class AssessmentService extends CoreService {

  constructor() { super(); }

  getInnovationsList(queryParams: APIQueryParamsType): Observable<getInnovationsListEndpointOutDTO> {

    const { filters, ...qParams } = queryParams;

    const qp = {
      ...qParams,
      status: filters.status || []
    };

    const url = new UrlModel(this.API_URL).addPath('/assessments/:userId/innovations').setPathParams({ userId: this.stores.authentication.getUserId() }).setQueryParams(qp);
    return this.http.get<getInnovationsListEndpointInDTO>(url.buildUrl()).pipe(
      take(1),
      map(response => ({
        count: response.count,
        data: response.data.map(item => ({
          id: item.id,
          name: item.name,
          countryName: item.countryName,
          postCode: item.postCode,
          mainCategory: item.otherMainCategoryDescription || mainCategoryItems.find(i => i.value === item.mainCategory)?.label || '',
          submittedAt: item.submittedAt,
          assessment: {
            id: item.assessment.id,
            createdAt: item.assessment.createdAt,
            assignTo: item.assessment.assignTo,
            finishedAt: item.assessment.finishedAt,
          },
          organisations: item.organisations,
          isOverdue: DatesHelper.dateDiff(item.submittedAt, Date()) >= 7,
          notifications: item.notifications,
        })),
      }))
    );

  }

  getInnovationInfo(innovationId: string): Observable<getInnovationInfoEndpointDTO> {

    const url = new UrlModel(this.API_URL).addPath('assessments/:userId/innovations/:innovationId').setPathParams({ userId: this.stores.authentication.getUserId(), innovationId });
    return this.http.get<getInnovationInfoEndpointDTO>(url.buildUrl()).pipe(
      take(1),
      map(response => response)
    );

  }

  getInnovationNeedsAssessment(innovationId: string, assessmentId: string): Observable<getInnovationNeedsAssessmentEndpointOutDTO> {

    const url = new UrlModel(this.API_URL).addPath('assessments/:userId/innovations/:innovationId/assessments/:assessmentId').setPathParams({ userId: this.stores.authentication.getUserId(), innovationId, assessmentId });
    return this.http.get<getInnovationNeedsAssessmentEndpointInDTO>(url.buildUrl()).pipe(
      take(1),
      map(response => ({
        innovation: response.innovation,
        assessment: {
          description: response.description,
          maturityLevel: response.maturityLevel,
          hasRegulatoryApprovals: response.hasRegulatoryApprovals,
          hasRegulatoryApprovalsComment: response.hasRegulatoryApprovalsComment,
          hasEvidence: response.hasEvidence,
          hasEvidenceComment: response.hasEvidenceComment,
          hasValidation: response.hasValidation,
          hasValidationComment: response.hasValidationComment,
          hasProposition: response.hasProposition,
          hasPropositionComment: response.hasPropositionComment,
          hasCompetitionKnowledge: response.hasCompetitionKnowledge,
          hasCompetitionKnowledgeComment: response.hasCompetitionKnowledgeComment,
          hasImplementationPlan: response.hasImplementationPlan,
          hasImplementationPlanComment: response.hasImplementationPlanComment,
          hasScaleResource: response.hasScaleResource,
          hasScaleResourceComment: response.hasScaleResourceComment,
          summary: response.summary,
          organisations: response.organisations,
          assignToName: response.assignToName,
          finishedAt: response.finishedAt,
          createdAt: response.createdAt,
          createdBy: response.createdBy,
          updatedAt: response.updatedAt,
          updatedBy: response.updatedBy,
          hasBeenSubmitted: !!response.finishedAt
        }
      }))
    );

  }

  createInnovationNeedsAssessment(innovationId: string, data: MappedObject): Observable<{ id: string }> {

    const url = new UrlModel(this.API_URL).addPath('assessments/:userId/innovations/:innovationId/assessments').setPathParams({ userId: this.stores.authentication.getUserId(), innovationId });
    return this.http.post<{ id: string }>(url.buildUrl(), data).pipe(
      take(1),
      map(response => response)
    );

  }

  updateInnovationNeedsAssessment(innovationId: string, assessmentId: string, isSubmission: boolean, data: MappedObject): Observable<{ id: string }> {

    const body = Object.assign({}, data);

    if (isSubmission) {
      body.isSubmission = true;
    }

    const url = new UrlModel(this.API_URL).addPath('assessments/:userId/innovations/:innovationId/assessments/:assessmentId').setPathParams({ userId: this.stores.authentication.getUserId(), innovationId, assessmentId });
    return this.http.put<{ id: string }>(url.buildUrl(), body).pipe(
      take(1),
      map(response => response)
    );

  }

}
