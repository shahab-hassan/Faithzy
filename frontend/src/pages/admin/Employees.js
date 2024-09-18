import React, { useContext } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { IoIosCloseCircleOutline } from 'react-icons/io';
// import Dropdown from '../../components/common/Dropdown';
import { AuthContext } from "../../utils/AuthContext";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { formatDate } from '../../utils/utilFuncs';

function Employees() {

  const { admin } = useContext(AuthContext);

  const [admins, setAdmins] = React.useState([]);
  const [showAddNewModel, setShowAddNewModel] = React.useState(false);
  const [showDetailsModel, setShowDetailsModel] = React.useState(null);
  const [passwordHidden, setPasswordHidden] = React.useState(true);
  // const [selectedRole, setSelectedRole] = React.useState('Moderator');
  // const [pageAccess, setPageAccess] = React.useState({});
  const [isEditing, setIsEditing] = React.useState(false);
  const [editAdmin, setEditAdmin] = React.useState(null);
  const [showPassInputs, setShowPassInputs] = React.useState(false);
  const [newEmployee, setNewEmployee] = React.useState({
    email: '',
    name: '',
    newPassword: '',
    confirmNewPass: '',
  });

  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    axios
      .get('http://localhost:5000/api/v1/admins/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (response.data.success) setAdmins(response.data.admins);
      })
      .catch((e) => {
        enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
      });
  }, []);

  const handleOpenAddNewForm = () => {
    setIsEditing(false);
    setNewEmployee({
      email: '',
      name: '',
      password: ''
    });
    // setSelectedRole('Moderator');
    // setPageAccess({});
    setShowAddNewModel(true);
  };

  const handleAddNewEmployee = (e) => {

    e.preventDefault();

    // if (selectedRole === "Editor")
    //   if (Object.keys(pageAccess).length < 1) {
    //     enqueueSnackbar("Editor requires at least 1 page access", { variant: "warning" });
    //     return;
    //   }

    const token = localStorage.getItem('adminToken');
    // const newAdminData = {
    //   ...newEmployee,
    //   role: selectedRole,
    //   access: selectedRole === 'Editor' ? pageAccess : []
    // };

    axios
      .post('http://localhost:5000/api/v1/admins/admin/add', newEmployee, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (response.data.success) {
          setAdmins([response.data.admin, ...admins]);
          setShowAddNewModel(false);
          enqueueSnackbar('Employee added successfully!', { variant: 'success' });
        }
      })
      .catch((e) => {
        console.log(e);
        enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
      });
  };

  const handleOpenEditForm = (adminData) => {
    setEditAdmin(adminData);
    // setSelectedRole(adminData.role);
    // setPageAccess(adminData.access || {});
    setNewEmployee({
      email: adminData.email,
      name: adminData.name,
      password: ''
    });
    setIsEditing(true);
    setShowAddNewModel(true);
  };

  const handleEditEmployee = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    const updatedAdminData = {
      ...newEmployee,
      // role: selectedRole,
      // access: selectedRole === 'Editor' ? pageAccess : undefined
    };

    axios
      .put(`http://localhost:5000/api/v1/admins/admin/update/${editAdmin._id}`, updatedAdminData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (response.data.success) {
          setAdmins((prevAdmins) => [
            response.data.admin,
            ...prevAdmins.filter((admin) => admin._id !== editAdmin._id)
          ]);
          setShowAddNewModel(false);
          setIsEditing(false);
          enqueueSnackbar('Employee updated successfully!', { variant: 'success' });
        }
      })
      .catch((e) => {
        enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
      });
  };

  const handleDeleteAdmin = (adminId) => {
    if (!window.confirm("You are removing an Employee... Are you sure you want to continue?"))
      return;
    const token = localStorage.getItem('adminToken');
    axios
      .delete(`http://localhost:5000/api/v1/admins/admin/delete/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (response.data.success) {
          setAdmins(admins.filter((admin) => admin._id !== adminId));
          enqueueSnackbar('Employee removed successfully!', { variant: 'success' });
        }
      })
      .catch((e) => {
        enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
      });
  };

  const handleInputChange = (e) => {
    setNewEmployee((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // const handlePageAccessChange = (page, checked, action) => {
  //   setPageAccess((prev) => {
  //     const updatedAccess = { ...prev };

  //     if (checked) {
  //       updatedAccess[page] = action;
  //     } else {
  //       delete updatedAccess[page];
  //     }

  //     return updatedAccess;
  //   });
  // };


  // const adminPages = [
  //   'Dashboard',
  //   'Categories',
  //   'Coupons',
  //   'Orders',
  //   'Sellers',
  //   'Buyers',
  //   'Revenue',
  //   'Payments',
  //   'Social Media Links',
  //   'Fee',
  //   'Terms & Conditions',
  //   'Disputes',
  //   'Chats'
  // ];

  // const editEditorAccess = selectedRole === 'Editor' && (
  //   <div className="editEditorAccess">
  //     {adminPages.map((page, index) => (
  //       <div key={index} className="accessBtn">
  //         <div className="checkboxDiv">
  //           <input
  //             type="checkbox"
  //             className="checkbox"
  //             id={`checkbox-${page}`}
  //             name={page}
  //             checked={!!pageAccess[page]}
  //             onChange={(e) =>
  //               handlePageAccessChange(page, e.target.checked, pageAccess[page] || 'View')
  //             }
  //           />
  //           <label htmlFor={`checkbox-${page}`}>{page}</label>
  //         </div>
  //         {pageAccess[page] && (
  //           <Dropdown
  //             options={['View', 'Edit']}
  //             selected={pageAccess[page]}
  //             onSelect={(action) => handlePageAccessChange(page, true, action)}
  //             isSimple={true}
  //           />
  //         )}
  //       </div>
  //     ))}
  //   </div>
  // );

  // const showEditorAccesses = showDetailsModel && showDetailsModel.role === "Editor" && (
  //   <div className='accessTo'>
  //     {Object.entries(showDetailsModel.access)
  //       .map(([page, access]) => `${page} (Can ${access})`)
  //       .join(", ")}
  //   </div>
  // );


  const employeesElems = admins.length > 0 ? admins.map((item, index) => (
    <div key={index}>
      <div className="requestRow row">
        <div className="titleField field">
          <p className="title">{item.email}</p>
        </div>
        <p className="idField field">#{item._id}</p>
        <p className="nameField field">{item.name}</p>
        {/* <p className="accessField field">{item.role}</p> */}
        <div className="actionsField field">
          <FaEye className="icon" onClick={() => setShowDetailsModel(item)} />
          {admin._id !== item._id && <><FaEdit className="icon" onClick={() => handleOpenEditForm(item)} />
            <FaTrash className="icon" onClick={() => handleDeleteAdmin(item._id)} /></>}

        </div>
      </div>
      {admins.length > 1 && admins.length - 1 !== index && <div className="horizontalLine"></div>}
    </div>
  ))
    : <div className="row">Nothing to show here...</div>;

  const handlePasswordInputChange = (e) => {
    let { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  }


  if(!(admin && admin?.role === "Admin")) return <div>You are not authorized to access this page!</div>


  return (
    <div className="adminEmployeesDiv">
      <div className="adminEmployeesContent">

        <div className="tableDiv">
          <div className="tableContent">
            <div className="upper">
              <h2 className="secondaryHeading">
                All <span>Employees</span>
                <span className="totalRows">- {(admins.length < 10 && '0') + admins.length}</span>
              </h2>
              <button className="primaryBtn" onClick={handleOpenAddNewForm}>Add New Employee</button>
            </div>
            <div className="header">
              <p className="title">Email</p>
              <p className="id">Employee ID</p>
              <p>Employee Name</p>
              {/* <p>Roles</p> */}
              <p>Actions</p>
            </div>
            <div className="rows">{employeesElems}</div>
          </div>
        </div>

      </div>

      {showAddNewModel && (
        <div className="popupDiv addNewModelDiv">
          <div className="popupContent">
            <form className="form" onSubmit={isEditing ? handleEditEmployee : handleAddNewEmployee}>
              <div className="inputDiv">
                <label>Email <span>*</span></label>
                <input
                  type="email"
                  className="inputField"
                  name="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email"
                  required
                />
              </div>
              <div className="inputDiv">
                <label>Name <span>*</span></label>
                <input
                  type="text"
                  className="inputField"
                  name="name"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                  placeholder="Enter Name"
                  required
                />
              </div>
              {/* <div className="inputDiv">
                <label>Role</label>
                <Dropdown
                  options={['Moderator', 'Editor']}
                  selected={selectedRole}
                  onSelect={setSelectedRole}
                />
                {editEditorAccess}
              </div> */}

              {!isEditing && <div className="inputDiv">
                <div className="passwordFieldUpper">
                  <label htmlFor="password">Create Password <span>*</span></label>
                  <div
                    className="hidePasswordBtn"
                    onClick={() => setPasswordHidden((oldValue) => !oldValue)}
                  >
                    <i className={passwordHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                  </div>
                </div>
                <input
                  type={passwordHidden ? 'password' : 'text'}
                  className="inputField"
                  name="password"
                  value={newEmployee.password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  required={!isEditing}
                />
              </div>}

              {isEditing && <div className="changePassDiv">

                <div className="upper" onClick={() => setShowPassInputs(prev => !prev)}>
                  <p>Change Password</p>
                  {showPassInputs ? <MdKeyboardArrowUp className='icon' /> : <MdKeyboardArrowDown className='icon' />}
                </div>

                {showPassInputs && <div className="lower">

                  <div className="inputDiv">
                    <div className='inputInnerDiv'>
                      <input type="password" placeholder='Enter new password' className='inputField' name='newPassword' value={newEmployee.newPassword} onChange={handlePasswordInputChange} required />
                    </div>
                    <div className='inputInnerDiv'>
                      <input type="password" placeholder='Confirm new password' className='inputField' name='confirmNewPass' value={newEmployee.confirmNewPass} onChange={handlePasswordInputChange} required />
                    </div>
                  </div>

                </div>}


              </div>}

              <div className="buttonsDiv">
                <button className="primaryBtn" type="submit">
                  {isEditing ? 'Save Changes' : 'Add Employee'}
                </button>
                <button className="secondaryBtn" type="button" onClick={() => setShowAddNewModel(false)}>
                  Close
                </button>
              </div>
            </form>

          </div>
          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddNewModel(false)} />
          </div>
        </div>
      )}

      {showDetailsModel && (
        <div className="showDetailsModelDiv popupDiv">
          <div className="popupContent">
            <div className="form" onSubmit={handleAddNewEmployee}>

              <h2 className="secondaryHeading">More About <span>Admin</span></h2>

              <div className="horizontalLine"></div>

              <div className="row"><p>ID</p><p className='fw500'>#{showDetailsModel._id}</p></div>
              <div className="row"><p>Email</p><p className='fw500'>{showDetailsModel.email}</p></div>
              <div className="row"><p>Name</p><p className='fw500'>{showDetailsModel.name}</p></div>
              {/* <div className="row"><p>Role</p><p className='fw500'>{showDetailsModel.role}</p></div> */}
              <div className="row"><p>Admin Since</p><p className='fw500'>{formatDate(showDetailsModel.createdAt)}</p></div>

              {/* <div className="horizontalLine"></div> */}

              {/* {showDetailsModel.role === "Editor" &&
                <div>
                  <p className='fw600'>Access To</p>
                  <div className='accessTo'>
                    {showEditorAccesses}
                  </div>
                </div>} */}

              <div className="buttonsDiv">
                <button className="secondaryBtn" type="button" onClick={() => setShowDetailsModel(null)}>Close</button>
              </div>

            </div>
          </div>
          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className="icon" onClick={() => setShowDetailsModel(null)} />
          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;
