import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppInjector, CoreModule } from '@modules/core';
import { StoresModule } from '@modules/stores';
import { InnovationSectionsIds } from '@modules/stores/innovation/innovation.models';
import { AccessorModule } from '@modules/feature-modules/accessor/accessor.module';

import { InnovationActionTrackerInfoComponent } from './action-tracker-info.component';

import { AccessorService, getInnovationActionInfoOutDTO } from '@modules/feature-modules/accessor/services/accessor.service';


describe('FeatureModules/Accessor/Innovation/InnovationActionTrackerInfoComponent', () => {

  let activatedRoute: ActivatedRoute;

  let accessorService: AccessorService;

  let component: InnovationActionTrackerInfoComponent;
  let fixture: ComponentFixture<InnovationActionTrackerInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CoreModule,
        StoresModule,
        AccessorModule
      ]
    });

    AppInjector.setInjector(TestBed.inject(Injector));

    activatedRoute = TestBed.inject(ActivatedRoute);

    accessorService = TestBed.inject(AccessorService);

  });


  it('should create the component', () => {
    fixture = TestBed.createComponent(InnovationActionTrackerInfoComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should show "actionCreationSuccess" warning', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01', actionId: 'Action01' };
    activatedRoute.snapshot.queryParams = { alert: 'actionCreationSuccess' };

    const expected = { type: 'SUCCESS', title: 'Action requested', message: 'The innovator has been notified of your action request.' };

    fixture = TestBed.createComponent(InnovationActionTrackerInfoComponent);
    component = fixture.componentInstance;
    expect(component.alert).toEqual(expected);

  });

  it('should show "actionUpdateSuccess" warning', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01', actionId: 'Action01' };
    activatedRoute.snapshot.queryParams = { alert: 'actionUpdateSuccess', status: 'Completed' };

    const expected = { type: 'SUCCESS', title: `You have updated the status of this action to 'Completed'`, message: 'The innovator will be notified of this status change' };

    fixture = TestBed.createComponent(InnovationActionTrackerInfoComponent);
    component = fixture.componentInstance;
    expect(component.alert).toEqual(expected);

  });


  it('should have initial information loaded', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01', actionId: 'Action01' };

    const responseMock: getInnovationActionInfoOutDTO = {
      id: 'ID01',
      displayId: '',
      status: 'REQUESTED',
      name: 'Submit section 01',
      description: 'some description',
      section: InnovationSectionsIds.COST_OF_INNOVATION,
      createdAt: '2020-01-01T00:00:00.000Z',
      createdBy: 'Innovation user'
    };
    accessorService.getInnovationActionInfo = () => of(responseMock);
    const expected = responseMock;

    fixture = TestBed.createComponent(InnovationActionTrackerInfoComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.action).toBe(expected);

  });

  it('should NOT have initial information loaded', () => {

    accessorService.getInnovationActionInfo = () => throwError('error');

    fixture = TestBed.createComponent(InnovationActionTrackerInfoComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.action).toBe(undefined);

  });

});
