import React, {useContext} from 'react'

import SampleProvisions from '../../components/buyer/SampleProvisions';
import { AuthContext } from "../../utils/AuthContext";

function Provisions() {

    const { isLogin } = useContext(AuthContext);

  return (
    <div className="homeProvisionsDiv">
        <section className='section'>
          <SampleProvisions pre="top" />
          {isLogin && <SampleProvisions pre="recents" />}
          <SampleProvisions pre="discounted" />
        </section>
      </div>
  )
}

export default Provisions