import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { USER_INFO_ACCESSOR } from '@tests/data.mocks';

import { CoreModule, AppInjector } from '@modules/core';
import { StoresModule, AuthenticationStore } from '@modules/stores';
import { SharedModule } from '@modules/shared/shared.module';
import { FormEngineComponent } from '@modules/shared/forms';

import { PageAccountManageDetailsEditComponent } from './manage-details-edit.component';

import { ACCOUNT_DETAILS_INNOVATOR } from './manage-details-edit-innovator.config';
import { ACCOUNT_DETAILS_ACCESSOR } from './manage-details-edit-accessor.config';

describe('Shared/Pages/Account/ManageDetails/PageAccountManageDetailsEditComponent', () => {

  let activatedRoute: ActivatedRoute;
  let authenticationStore: AuthenticationStore;

  let component: PageAccountManageDetailsEditComponent;
  let fixture: ComponentFixture<PageAccountManageDetailsEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CoreModule,
        StoresModule,
        SharedModule
      ]
    });

    AppInjector.setInjector(TestBed.inject(Injector));

    authenticationStore = TestBed.inject(AuthenticationStore);
    activatedRoute = TestBed.inject(ActivatedRoute);

    authenticationStore.getUserInfo = () => USER_INFO_ACCESSOR;

  });

  it('should create the component', () => {

    fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
    component = fixture.componentInstance;

    expect(component).toBeTruthy();

  });


  it('should be a question step', () => {

    activatedRoute.snapshot.params = { stepId: 1 };
    authenticationStore.isInnovatorType = () => true;

    fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isQuestionStep()).toBe(true);

  });

  it('should be summary step', () => {

    activatedRoute.snapshot.params = { stepId: 'summary' };
    activatedRoute.params = of({ stepId: 'summary' }); // Simulate activatedRoute.params subscription.
    authenticationStore.isInnovatorType = () => true;

    fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isSummaryStep()).toBe(true);

  });


  it('should load innovator information', () => {

    activatedRoute.snapshot.params = { stepId: 1 };
    activatedRoute.params = of({ stepId: 1 }); // Simulate activatedRoute.params subscription.
    authenticationStore.isInnovatorType = () => true;

    fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.wizard).toBe(ACCOUNT_DETAILS_INNOVATOR);

  });

  it('should load accessor information', () => {

    activatedRoute.snapshot.params = { stepId: 1 };
    activatedRoute.params = of({ stepId: 1 }); // Simulate activatedRoute.params subscription.
    authenticationStore.isAccessorType = () => true;

    fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.wizard).toBe(ACCOUNT_DETAILS_ACCESSOR);

  });

  it('should load assessment information', () => {

    activatedRoute.snapshot.params = { stepId: 1 };
    activatedRoute.params = of({ stepId: 1 }); // Simulate activatedRoute.params subscription.
    authenticationStore.isAssessmentType = () => true;

    fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.wizard).toBe(ACCOUNT_DETAILS_ACCESSOR);

  });


  it('should do nothing when submitting a step and form not is valid', () => {

    activatedRoute.snapshot.params = { stepId: 1 };
    activatedRoute.params = of({ stepId: 1 }); // Simulate activatedRoute.params subscription.
    authenticationStore.isInnovatorType = () => true;

    const expected =   {
      displayName: 'Test qualifying Accessor',
      isCompanyOrOrganisation: 'YES',
      organisationName: 'organisation_1',
      organisationSize: '',
      organisationAdditionalInformation: { id: 'org_id' }
    };

    fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.formEngineComponent = TestBed.createComponent(FormEngineComponent).componentInstance;
    spyOn(component.formEngineComponent, 'getFormValues').and.returnValue({ valid: false, data: { value1: 'some value' } });
    component.onSubmitStep('next', new Event(''));
    fixture.detectChanges();

    expect(component.wizard.getAnswers()).toEqual(expected);

  });

  // it('should redirect when submitting a step', () => {

  //   const routerSpy = spyOn(TestBed.inject(Router), 'navigate');

  //   activatedRoute.snapshot.data = { module: 'innovator' };
  //   activatedRoute.snapshot.params = { stepId: 1 };
  //   activatedRoute.params = of({ stepId: 1 }); // Simulate activatedRoute.params subscription.
  //   authenticationStore.isInnovatorType = () => true;

  //   fixture = TestBed.createComponent(PageAccountManageDetailsEditComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();

  //   component.formEngineComponent = TestBed.createComponent(FormEngineComponent).componentInstance;
  //   spyOn(component.formEngineComponent, 'getFormValues').and.returnValue({ valid: true });
  //   component.onSubmitStep('next', new Event(''));
  //   fixture.detectChanges();

  //   expect(routerSpy).toHaveBeenCalledWith(['/innovator/account/manage-details/edit/2']);

  // });

});
