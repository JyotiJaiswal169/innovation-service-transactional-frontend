import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppInjector, CoreModule } from '@modules/core';
import { StoresModule } from '@modules/stores';
import { InnovationSectionsIds } from '@modules/stores/innovation/innovation.models';
import { AccessorModule } from '@modules/feature-modules/accessor/accessor.module';

import { InnovationActionTrackerEditComponent } from './action-tracker-edit.component';

import { AccessorService, getInnovationActionInfoOutDTO } from '@modules/feature-modules/accessor/services/accessor.service';


describe('FeatureModules/Accessor/Innovation/InnovationActionTrackerEditComponent', () => {

  let activatedRoute: ActivatedRoute;
  let router: Router;
  let routerSpy: jasmine.Spy;

  let accessorService: AccessorService;

  let component: InnovationActionTrackerEditComponent;
  let fixture: ComponentFixture<InnovationActionTrackerEditComponent>;

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
    router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    accessorService = TestBed.inject(AccessorService);

  });


  it('should create the component', () => {
    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have component initial values', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

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

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;

    expect(component.actionDisplayId).toBe(responseMock.displayId);

  });

  it('should NOT have component initial values', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    accessorService.getInnovationActionInfo = () => throwError('error');

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;

    expect(component.actionDisplayId).toBe('');

  });

  it('should run onSubmitStep() with INVALID form', () => {

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;

    component.onSubmitStep();
    expect(component.form.valid).toEqual(false);

  });

  it('should run onSubmitStep() with VALID form', () => {

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;
    component.form.get('status')?.setValue('A required value');

    component.onSubmitStep();
    expect(component.stepNumber).toBe(2);

  });


  it('should run onSubmit() with invalid form', () => {

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;

    component.onSubmit();
    expect(component.form.valid).toEqual(false);

  });

  it('should run onSubmit and call api with success with INVALID "status" form field', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    const responseMock = { id: 'actionId' };
    accessorService.updateAction = () => of(responseMock);

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;
    component.form.get('status')?.setValue('Invalid status');
    component.form.get('comment')?.setValue('A required value');

    component.onSubmit();
    expect(routerSpy).toHaveBeenCalledWith(['/accessor/innovations/Inno01/action-tracker/actionId'], { queryParams: { alert: 'actionUpdateSuccess', status: undefined } });

  });

  it('should run onSubmit and call api with success', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    const responseMock = { id: 'actionId' };
    accessorService.updateAction = () => of(responseMock);

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;
    component.form.get('status')?.setValue('REQUESTED');
    component.form.get('comment')?.setValue('A required value');

    component.onSubmit();
    expect(routerSpy).toHaveBeenCalledWith(['/accessor/innovations/Inno01/action-tracker/actionId'], { queryParams: { alert: 'actionUpdateSuccess', status: 'Requested' } });

  });

  it('should run onSubmit and call api with error', () => {

    activatedRoute.snapshot.params = { innovationId: 'Inno01' };

    accessorService.updateAction = () => throwError('error');

    const expected = {
      type: 'ERROR',
      title: 'An error occurred when creating an action',
      message: 'Please try again or contact us for further help',
      setFocus: true
    };

    fixture = TestBed.createComponent(InnovationActionTrackerEditComponent);
    component = fixture.componentInstance;
    component.form.get('status')?.setValue('REQUESTED');
    component.form.get('comment')?.setValue('A required value');

    component.onSubmit();
    expect(component.alert).toEqual(expected);

  });

});
