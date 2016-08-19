import xs from 'xstream';
import {div, label, input, button, h1, h2, span,
        hr, ul, li, a, form, fieldset, legend, 
        makeDOMDriver } from '@cycle/dom';

function Login( API ) {
  
  function renderForm(  ) {
    return div('.login-form',[
      div('.pure-form',[
        fieldset([
          legend('Please log in to use the protected api.'),
          input('.user-input', 
            { attrs: { 
                type:'text', placeholder: 'User', required:'true'
              } 
            }),
          input('.user-password', 
            { attrs: { 
                type:'text', placeholder: 'Password', required:'true'
              } 
            })
        ])
      ])
    ])
  }

  function renderWelcome(  ) {
    return div('.welcome', [
      renderForm(),
      button('.btn-signup .pure-button','sign up'),
      button('.btn-log-in .pure-button', 'log in')
    ]);
  }
  
  function renderLoggedIn( username ) {
    return div('.logged-in-form',[
      div('.welcome-user-name', [ 
        span('.welcome', 'Welcome: '), 
        span('.user-name',username) 
        ]),
      button('.btn-log-out .pure-button', 'log out' )
    ])
  }

  function renderLoginSection( screen, username ) {
    if(screen === 'welcome') {
      return renderWelcome(  );
    } else if( screen === 'logged-in' ) {
      return renderLoggedIn( username );
    }
  }

  
function loginIntent( sources ){
  
    // login click
    const loginClick$ = sources.DOM
      .select('.btn-log-in').events('click')
      .map( ev => ({ 
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }))
      .filter(data => data.username && data.password)
      .map(data => {
        const request = API.requestLogin;
        request.send = data;
        return request;
      });

    const signUpClick$ = sources.DOM
      .select('.btn-signup').events('click')
      .map( ev => ({ 
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }))
      .filter(data => data.username && data.password)
      .map(data => {
        const request = API.requestCreate;

        request.send = data;

        return request;
      });


    // login click
    const logoutClick$ = sources.DOM
      .select('.btn-log-out').events('click')
      .map( ev => ({ screen:'welcome'}) );


    // response event which filter by the category
    const createResponse$ = sources.HTTP
      .select('create-user').map( (response$) =>
        response$.replaceError( (errorObject) => xs.of( errorObject ) ) ).flatten();

    const loginResponse$ = sources.HTTP
      .select('login').map( (response$) =>
        response$.replaceError( (errorObject) => xs.of( errorObject ) ) ).flatten();

    const mergeRequest$ = xs.merge( loginClick$ , signUpClick$ );
    const mergeResponse$ = xs.merge( createResponse$, loginResponse$ );

    let screenActions$ = xs.merge(logoutClick$);

    return {  screenActions$,
              request$: mergeRequest$, 
              response$: mergeResponse$ }
  }
  
  
  return {
    renderLoginSection,
    loginIntent
  }
}

export default Login;