declare module 'react-facebook-login/dist/facebook-login-render-props' {
  import { Component } from 'react';

  interface FacebookLoginProps {
    appId: string;
    autoLoad?: boolean;
    fields?: string;
    callback: (response: any) => void;
    render: (props: any) => React.ReactNode;
    scope?: string;
    version?: string;
    cssClass?: string;
    className?: string;
    redirectUri?: string;
    textButton?: string;
    icon?: string;
    xfbml?: boolean;
    overlayShow?: boolean;
    disableMobileRedirect?: boolean;
    state?: string;
    authType?: string;
    responseType?: string;
    onClick?: () => void;
  }

  class FacebookLogin extends Component<FacebookLoginProps> {}
  export default FacebookLogin;
}
