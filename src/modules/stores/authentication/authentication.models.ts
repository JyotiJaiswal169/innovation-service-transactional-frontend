export class AuthenticationModel {

  isSignIn: boolean;

  user?: {
    id: string;
    displayName: string;
    type: '' | 'ASSESSMENT' | 'ACCESSOR' | 'INNOVATOR';
    organisations: {
      id: string,
      name: string,
      role: 'OWNER' | 'QUALIFYING_ACCESSOR' | 'ACCESSOR',
      organisationUnits?: {
        id: string,
        name: string,
      }[],
    }[];
    innovations: { id: string, name: string }[];
  };

  didFirstTimeSignIn?: boolean;


  constructor() {

    this.isSignIn = false;

  }

}
