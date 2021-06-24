import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ENV } from '@tests/app.mocks';

import { Injector } from '@angular/core';

import { AppInjector, CoreModule, EnvironmentStore } from '@modules/core';
import { StoresModule, InnovationStore } from '@modules/stores';
import { InnovationSectionsIds } from '@modules/stores/innovation/innovation.models';
import { TableModel } from '@app/base/models';

import { AccessorService, getActionsListEndpointInDTO, getActionsListEndpointOutDTO, getInnovationsListEndpointInDTO, getInnovationsListEndpointOutDTO } from './accessor.service';


describe('FeatureModules/Accessor/Services/AccessorService', () => {

  let httpMock: HttpTestingController;
  let environmentStore: EnvironmentStore;
  let innovationStore: InnovationStore;
  let service: AccessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CoreModule,
        StoresModule
      ],
      providers: [
        AccessorService,
        { provide: 'APP_SERVER_ENVIRONMENT_VARIABLES', useValue: ENV }
      ]
    });

    AppInjector.setInjector(TestBed.inject(Injector));

    httpMock = TestBed.inject(HttpTestingController);
    environmentStore = TestBed.inject(EnvironmentStore);
    innovationStore = TestBed.inject(InnovationStore);
    service = TestBed.inject(AccessorService);

  });

  afterEach(() => {
    httpMock.verify();
  });


  it('should run getInnovationsList() and return success', () => {

    const responseMock: getInnovationsListEndpointInDTO = {
      count: 2,
      data: [
        {
          id: '01', name: 'Innovation 01', mainCategory: 'MEDICAL_DEVICE', otherMainCategoryDescription: '', countryName: 'England', postcode: '', submittedAt: '2021-04-16T09:23:49.396Z',
          support: { id: 'S01', status: 'WAITING', createdAt: '2021-04-16T09:23:49.396Z', updatedAt: '2021-04-16T09:23:49.396', accessors: [] },
          organisations: [],
          assessment: { id: '01' }
        },
        {
          id: '02', name: 'Innovation 02', mainCategory: 'MEDICAL_DEVICE', otherMainCategoryDescription: '', countryName: 'England', postcode: '', submittedAt: '2021-04-16T09:23:49.396Z',
          support: { id: 'S02', status: 'WAITING', createdAt: '2021-04-16T09:23:49.396Z', updatedAt: '2021-04-16T09:23:49.396', accessors: [] },
          organisations: [],
          assessment: { id: '02' },
        }
      ]
    };

    const expected: getInnovationsListEndpointOutDTO = {
      count: responseMock.count,
      data: [
        {
          id: '01', name: 'Innovation 01', mainCategory: 'Medical device', countryName: 'England', submittedAt: '2021-04-16T09:23:49.396Z',
          support: { id: 'S01', status: 'WAITING', createdAt: '2021-04-16T09:23:49.396Z', updatedAt: '2021-04-16T09:23:49.396', accessors: [] },
          organisationsAcronyms: ['NICE', 'DIT', 'Other'], // responseMock.data[0].organisations.map(o => o.acronym),
          assessment: { id: '01' }
        },
        {
          id: '02', name: 'Innovation 02', mainCategory: 'Medical device', countryName: 'England', submittedAt: '2021-04-16T09:23:49.396Z',
          support: { id: 'S02', status: 'WAITING', createdAt: '2021-04-16T09:23:49.396Z', updatedAt: '2021-04-16T09:23:49.396', accessors: [] },
          organisationsAcronyms: ['NICE', 'DIT', 'Other'], // responseMock.data[1].organisations.map(o => o.acronym),
          assessment: { id: '02' },
        }
      ]
    };

    let response: any = null;

    const tableList = new TableModel({ visibleColumns: { name: 'Name' } }).setFilters({ status: 'UNASSIGNED' });

    service.getInnovationsList(tableList.getAPIQueryParams()).subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations?take=10&skip=0&supportStatus=UNASSIGNED&assignedToMe=false`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('GET');
    expect(response).toEqual(expected);

  });

  it('should run getInnovationsInfo() and return success', () => {

    const responseMock = {
      summary: { id: '01', name: 'Innovation 01', status: 'CREATED', description: 'A description', company: 'User company', countryName: 'England', postCode: null, categories: ['Medical'], otherCategoryDescription: '' },
      contact: { name: 'A name' },
      assessment: { id: '01' },
      support: { id: '01', status: 'WAITING' }
    };

    const expected = responseMock;
    let response: any = null;

    service.getInnovationInfo('Inno01').subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations/Inno01`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('GET');
    expect(response).toEqual(expected);

  });

  it('should run getInnovationActionsList() and return success', () => {

    const responseMock = [
      { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'REQUESTED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' },
      { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'STARTED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' },
      { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'COMPLETED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' },
      { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'COMPLETED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' }
    ];

    const expected = {
      openedActions: [
        { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'REQUESTED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' },
        { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'STARTED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' }
      ],
      closedActions: [
        { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'COMPLETED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' },
        { id: 'ID01', section: InnovationSectionsIds.COST_OF_INNOVATION, status: 'COMPLETED', name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`, createdAt: '2021-04-16T09:23:49.396Z' }
      ]
    };

    let response: any = null;

    service.getInnovationActionsList('Inno01').subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations/Inno01/actions`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('GET');
    expect(response).toEqual(expected);

  });

  it('should run getInnovationActionInfo() and return success', () => {

    const responseMock = {
      id: 'ID01',
      status: 'REQUESTED',
      description: 'some description',
      section: InnovationSectionsIds.COST_OF_INNOVATION,
      createdAt: '2021-04-16T09:23:49.396Z',
      createdBy: { id: 'user01', name: 'One guy name' }
    };

    const expected = {
      ...responseMock,
      ...{
        name: `Submit ${innovationStore.getSectionTitle(InnovationSectionsIds.COST_OF_INNOVATION)}`,
        createdBy: 'One guy name'
      }
    };

    let response: any = null;

    service.getInnovationActionInfo('Inno01', 'Inno01Action01').subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations/Inno01/actions/Inno01Action01`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('GET');
    expect(response).toEqual(expected);


  });

  it('should run getActionsList() and return success', () => {

    const responseMock: getActionsListEndpointInDTO = {
      count: 2,
      data: [
        {
          id: '01', displayId: 'dId01', status: 'REQUESTED', section: InnovationSectionsIds.INNOVATION_DESCRIPTION, createdAt: '2021-04-16T09:23:49.396Z', updatedAt: '2021-04-16T09:23:49.396',
          innovation: { id: 'Inno01', name: 'Innovation 01' }
        },
        {
          id: '02', displayId: 'dId02', status: 'STARTED', section: InnovationSectionsIds.INNOVATION_DESCRIPTION, createdAt: '2021-04-16T09:23:49.396Z', updatedAt: '2021-04-16T09:23:49.396',
          innovation: { id: 'Inno02', name: 'Innovation 02' }
        }
      ]
    };

    const expected: getActionsListEndpointOutDTO = {
      count: responseMock.count,
      data: responseMock.data.map(item => ({ ...item, ...{ name: `Submit ${innovationStore.getSectionTitle(item.section)}`, } }))
    };

    const tableList = new TableModel({ visibleColumns: { name: 'Name' } }).setFilters({ openActions: 'true' });

    let response: any = null;
    service.getActionsList(tableList.getAPIQueryParams()).subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//actions?take=10&skip=0&openActions=true`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('GET');
    expect(response).toEqual(expected);

  });

  it('should run createAction() and return success', () => {

    const responseMock = { id: 'ID01' };
    const expected = responseMock;
    let response: any = null;

    service.createAction('Inno01', { some: 'data' }).subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations/Inno01/actions`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('POST');
    expect(response).toEqual(expected);

  });

  it('should run updateAction() and return success', () => {

    const responseMock = { id: 'ID01' };
    const expected = responseMock;
    let response: any = null;

    service.updateAction('Inno01', 'Inno01Action01', { some: 'data' }).subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations/Inno01/actions/Inno01Action01`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('PUT');
    expect(response).toEqual(expected);

  });


  it('should run saveSupportStatus() WITHOUT a supportId and return success', () => {

    const responseMock = { id: 'ID01' };
    const expected = responseMock;
    let response: any = null;

    service.saveSupportStatus('Inno01', { some: 'data' }).subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations/Inno01/supports`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('POST');
    expect(response).toEqual(expected);

  });

  it('should run saveSupportStatus() WITH a supportId and return success', () => {

    const responseMock = { id: 'Inno01Support01' };
    const expected = responseMock;
    let response: any = null;

    service.saveSupportStatus('Inno01', { some: 'data' }, 'Inno01Support01').subscribe(success => response = success, error => response = error);

    const httpRequest = httpMock.expectOne(`${environmentStore.API_URL}/accessors//innovations/Inno01/supports/Inno01Support01`);
    httpRequest.flush(responseMock);
    expect(httpRequest.request.method).toBe('PUT');
    expect(response).toEqual(expected);

  });



});
