
// Method that composites the Auth login operations
function LoginDriver( ) {
  // object to hold the request properties
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
  
  // auth to handle request properties
  function AuthDriver(  ){
    let data = {};

    function setData( _data ) {
      data = _data;
      // set the auth token to the protected request
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