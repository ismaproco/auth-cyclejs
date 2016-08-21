

function LoginDriver( ) {
  let API = {
    requestLogin: {
      url: 'http://localhost:3001/sessions/create/',
      method: 'POST',
      category: 'login',
      eager: true
    },
    requestCreate: {
      url: 'http://localhost:3001/users/',
      method: 'POST',
      category: 'create-user',
      eager: true
    },
    requestRandom: {
      url: 'http://localhost:3001/api/random-quote',
      category: 'random-quote',
      eager: true
    },
    requestRandomProtected: {
      url: 'http://localhost:3001/api/protected/random-quote',
      headers: {"Authorization": ""},
      category: 'random-quote-protected',
      eager: true
    }
  };  
  

  function AuthDriver( sink$ ){
    let data = {};
    console.log('sink$ changed',sink$);

    if( sink$.subscribe ) {
      sink$.subscribe( token => {
        console.log('token set', token);
        if(token) {
          API.requestRandomProtected.headers.Authorization = "Bearer " + token;
        }
      });  
    }

    function setData( data ) {
      console.log('****** set token', data );
      API.requestRandomProtected.headers.Authorization = "Bearer " + data.token;
    }

    function getData() {
      return data;
    }
    
    return {
      API,
      setData,
      getData
    }
  }

  return AuthDriver;
}

export default LoginDriver;