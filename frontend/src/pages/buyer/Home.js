import React, {useContext} from 'react'
import { useLocation } from 'react-router-dom';

import Hero from '../../components/buyer/Hero';

import { AuthContext } from "../../utils/AuthContext";
import { enqueueSnackbar } from 'notistack';
import Provisions from '../../components/buyer/Provisions';

function Home() {

  const { login } = useContext(AuthContext);
  const location = useLocation();

  React.useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      login(token);
      window.history.replaceState({}, document.title, "/");
      enqueueSnackbar("LoggedIn Successfully!", {variant: "success"})
    }
  }, [location.search, login])

  return (
    <div>

      <Hero />
      <Provisions />
      
    </div>
  );
}

export default Home;
