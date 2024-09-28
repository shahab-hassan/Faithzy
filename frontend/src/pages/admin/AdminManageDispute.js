import React from 'react'
import { useParams } from 'react-router-dom'
import DisputeChatRoom from '../../components/common/DisputeChatRoom';

function AdminManageDispute() {

    const { id } = useParams();

    return (
        <div className='adminManageDisputeDiv'>
            <div className="adminManageDisputeContent commonChatDiv">

                <h2 className="secondaryHeading">Dispute ID: <span>#{id}</span></h2>
                <div className="horizontalLine"></div>

                <DisputeChatRoom disputeId={id} isSourceAdmin={true} />

            </div>

            
        </div>
    )
}

export default AdminManageDispute
