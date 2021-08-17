import { Component, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';

import { Request, Response } from 'express';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';

import { AppInjector } from '@modules/core';

import { EnvironmentStore } from '@modules/core/stores/environment.store';
import { AuthenticationStore } from '@modules/stores/authentication/authentication.store';
import { InnovationStore } from '@modules/stores/innovation/innovation.store';

import { UtilsHelper } from './helpers';
import { MappedObject } from './models';


@Component({ template: '' })
export class CoreComponent implements OnInit, OnDestroy {

  private platformId: object;
  private serverRequest: Request | null;
  private serverResponse: Response | null;
  private pageTitleHolder = '';

  protected titleService: Title;
  protected router: Router;
  protected http: HttpClient;
  protected translateService: TranslateService;
  protected logger: NGXLogger;

  protected stores: {
    environment: EnvironmentStore;
    authentication: AuthenticationStore;
    innovation: InnovationStore;
  };

  protected subscriptions: Subscription[] = [];

  constructor() {

    const injector = AppInjector.getInjector();

    this.platformId = injector.get(PLATFORM_ID);

    try {
      this.serverRequest = injector.get<Request>(REQUEST);
      this.serverResponse = injector.get<Response>(RESPONSE);
    } catch (error) {
      this.serverRequest = null;
      this.serverResponse = null;
    }

    this.titleService = injector.get(Title);
    this.router = injector.get(Router);
    this.router = injector.get(Router);
    this.http = injector.get(HttpClient);
    this.translateService = injector.get(TranslateService);
    this.logger = injector.get(NGXLogger);

    this.stores = {
      environment: injector.get(EnvironmentStore),
      authentication: injector.get(AuthenticationStore),
      innovation: injector.get(InnovationStore)
    };

  }

  /* istanbul ignore next */
  get requestBody(): MappedObject { return this.serverRequest?.body || {}; }
  /* istanbul ignore next */
  get pageTitle(): string { return this.pageTitleHolder || ''; }

  ngOnInit(): void { }

  isRunningOnBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isRunningOnServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  isDataRequest(): boolean {
    return this.serverRequest?.method?.toLowerCase() === 'post';
  }


  setPageTitle(s: string): void {
    this.pageTitleHolder = s;
    this.titleService.setTitle(`${this.translateService.instant(s)} | ${this.translateService.instant('app.title')}`);
  }


  redirectTo(url: string, queryParams?: MappedObject): void {

    if (this.isRunningOnBrowser()) {
      this.router.navigate([url], (queryParams ? { queryParams } : {}));
      return;
    }

    url = this.encodeUrlQueryParams(url, queryParams);
    this.serverResponse?.status(303);
    this.serverResponse?.setHeader('Location', url);
  }


  encodeInfo(s: string): string {
    return this.isRunningOnBrowser() ? btoa(s) : Buffer.from(s, 'binary').toString('base64');
  }

  decodeInfo(s: string): string {
    if (!s) { return ''; }
    return this.isRunningOnBrowser() ? atob(s) : Buffer.from(s, 'base64').toString('binary');
  }

  encodeUrlQueryParams(url: string, queryParams?: MappedObject): string {

    url = `${url.split('?')[0]}`;
    url += Object.keys(queryParams || {}).length > 0 ? '?' : '';

    for (let [key, value] of Object.entries(queryParams || {})) {

      if (UtilsHelper.isEmpty(value)) { break; }

      if (typeof value === 'object') { value = JSON.stringify(value); }

      url += (url.slice(-1) === '?' ? '' : '&') + `${key}=${encodeURIComponent(this.encodeInfo(value))}`;

    }

    return url;

  }

  decodeQueryParams(queryParams: MappedObject): MappedObject {

    const o: MappedObject = {};

    for (let [key, value] of Object.entries(queryParams || {})) {

      value = decodeURIComponent(value);
      value = this.decodeInfo(value);

      try { o[key] = JSON.parse(value); }
      catch { o[key] = value; }

    }

    return o;

  }

  // translate(translation: string, params?: object) {
  //   return this.translateService.instant(translation, params);
  // }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
