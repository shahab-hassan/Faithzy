import React from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import Dropdown from '../../components/common/Dropdown';

function Employees() {
  const [admins, setAdmins] = React.useState([]);
  const [showAddNewModel, setShowAddNewModel] = React.useState(false);
  const [showDetailsModel, setShowDetailsModel] = React.useState(null);
  const [passwordHidden, setPasswordHidden] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState('Moderator');
  const [pageAccess, setPageAccess] = React.useState({});
  const [newEmployee, setNewEmployee] = React.useState({
    email: '',
    name: '',
    password: ''
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

  const handleAddNewEmployee = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    const newAdminData = {
      ...newEmployee,
      role: selectedRole,
      access: selectedRole === 'Editor' ? pageAccess : []
    };

    axios
      .post('http://localhost:5000/api/v1/admins/admin/add', newAdminData, {
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
        enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
      });
  };

  const handleDeleteAdmin = (adminId) => {
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

  const handlePageAccessChange = (page, checked, action) => {
    setPageAccess((prev) => ({
      ...prev,
      [page]: checked ? action : null
    }));
  };

  const adminPages = [
    'Dashboard',
    'Categories',
    'Coupons',
    'Orders',
    'Sellers',
    'Buyers',
    'Revenue',
    'Payments',
    'Social Media Links',
    'Fee',
    'Terms & Conditions',
    'Disputes',
    'Chats'
  ];

  const editEditorAccess = selectedRole === 'Editor' && (
    <div className="editEditorAccess">
      {adminPages.map((page, index) => (
        <div key={index} className="accessBtn">
          <div className="checkboxDiv">
            <input
              type="checkbox"
              className="checkbox"
              id={`checkbox-${page}`}
              name={page}
              checked={!!pageAccess[page]}
              onChange={(e) =>
                handlePageAccessChange(page, e.target.checked, pageAccess[page] || 'View')
              }
            />
            <label htmlFor={`checkbox-${page}`}>{page}</label>
          </div>
          {pageAccess[page] && (
            <Dropdown
              options={['View', 'Edit']}
              selected={pageAccess[page]}
              onSelect={(action) => handlePageAccessChange(page, true, action)}
              isSimple={true}
            />
          )}
        </div>
      ))}
    </div>
  );

  const showEditorAccesses = showDetailsModel && showDetailsModel.role === "Editor" && (
    <div className='accessTo'>
      {Object.entries(showDetailsModel.access)
        .filter(([page, access]) => access !== null)
        .map(([page, access]) => `${page} (Can ${access})`)
        .join(", ")}
    </div>
  );


  const employeesElems = admins.length > 0? admins.map((admin, index) => (
      <div key={index}>
        <div className="requestRow row">
          <div className="titleField field">
            <p className="title">{admin.email}</p>
          </div>
          <p className="idField field">#{admin._id}</p>
          <p className="nameField field">{admin.name}</p>
          <p className="accessField field">{admin.role}</p>
          <div className="actionsField field">
            <FaEye className="icon" onClick={() => setShowDetailsModel(admin)} />
            <FaEdit className="icon" />
            <FaTrash className="icon" onClick={() => handleDeleteAdmin(admin._id)} />

          </div>
        </div>
        {admins.length > 1 && admins.length - 1 !== index && <div className="horizontalLine"></div>}
      </div>
    ))
    : <div className="row">Nothing to show here...</div>;

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
              <button className="primaryBtn" onClick={() => setShowAddNewModel(true)}>
                Add New Employee
              </button>
            </div>
            <div className="header">
              <p className="title">Email</p>
              <p className="id">Employee ID</p>
              <p>Employee Name</p>
              <p>Roles</p>
              <p>Actions</p>
            </div>
            <div className="rows">{employeesElems}</div>
          </div>
        </div>

      </div>

      {showAddNewModel && (
        <div className="popupDiv addNewModelDiv">
          <div className="popupContent">
            <form className="form" onSubmit={handleAddNewEmployee}>
              <div className="inputDiv">
                <label>
                  Email <span>*</span>
                </label>
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
                <label>
                  Name <span>*</span>
                </label>
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
              <div className="inputDiv">
                <label>Role</label>
                <Dropdown
                  options={['Moderator', 'Editor']}
                  selected={selectedRole}
                  onSelect={setSelectedRole}
                />
                {editEditorAccess}
              </div>
              <div className="inputDiv">
                <div className="passwordFieldUpper">
                  <label htmlFor="password">
                    Create Password <span>*</span>
                  </label>
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
                  required
                />
              </div>
              <div className="buttonsDiv">
                <button className="primaryBtn" type="submit">
                  Add Employee
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
              <div className="row"><p>Role</p><p className='fw500'>{showDetailsModel.role}</p></div>
              <div className="row"><p>Admin Since</p><p className='fw500'>{new Date(showDetailsModel.createdAt).toLocaleString()}</p></div>

              <div className="horizontalLine"></div>

              {showDetailsModel.role === "Editor" &&
                <div>
                  <p className='fw600'>Access To</p>
                  <div className='accessTo'>
                    {showEditorAccesses}
                  </div>
                </div>}

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
