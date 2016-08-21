import xs from 'xstream';
import {div, label, input, button, h1, h2, span,
        hr, ul, li, a, form, fieldset, legend, 
        makeDOMDriver } from '@cycle/dom';

function Login(  ) {
  
  // Rendering methods
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

  function render( screen, username ) {
    if(screen === 'welcome') {
      return renderWelcome(  );
    } else if( screen === 'logged-in' ) {
      return renderLoggedIn( username );
    }
  }

  // build the request and response actions based on the sources
  function intent( sources ){
    // login click
    const loginClick$ = sources.DOM
      .select('.btn-log-in').events('click')
      .map( ev => ({ 
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }))
      .filter(data => data.username && data.password)
      .map(data => {
        const request = sources.Auth.API.requestLogin;
        request.send = data;
        return request;
      });

    //signup click event
    const signUpClick$ = sources.DOM
      .select('.btn-signup').events('click')
      .map( ev => ({ 
        // get the values from the input fields and set the object to return
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }))
      .filter(data => data.username && data.password)
      .map(data => {
        const request = sources.Auth.API.requestCreate;
        // set the data to be send trough the request
        request.send = data;
        return request;
      });


    // login click
    const logoutClick$ = sources.DOM
      .select('.btn-log-out').events('click')
      .map( ev => ({ screen:'welcome'}) );


    //  create the reponses and intercepting errors
    const createResponse$ = sources.HTTP
      .select('create-user').map( (response$) =>
        response$.replaceError( (errorObject) => 
                              xs.of( errorObject ) ) ).flatten();

    const loginResponse$ = sources.HTTP
      .select('login').map( (response$) =>
        response$.replaceError( (errorObject) => 
                              xs.of( errorObject ) ) ).flatten();

    // merge the request and responses
    const mergeRequest$ = xs.merge( loginClick$ , signUpClick$ );
    const mergeResponse$ = xs.merge( createResponse$, loginResponse$ );

    return {  screenActions$: logoutClick$,
              request$: mergeRequest$, 
              response$: mergeResponse$ }
  }
  
  
  return {
    render,
    intent
  }
}

export default Login;