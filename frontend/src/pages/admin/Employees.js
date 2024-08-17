import React from 'react'
import axios from "axios"
import { enqueueSnackbar } from "notistack"
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaEye } from "react-icons/fa6";
import { IoIosCloseCircleOutline } from 'react-icons/io';
import Dropdown from "../../components/common/Dropdown"

function Employees() {

  const [admins, setAdmins] = React.useState([]);
  const [showAddNewModel, setShowAddNewModel] = React.useState(false);
  let [passwordHidden, setPasswordHidden] = React.useState(true);
  let [selectedRole, setSelectedRole] = React.useState("Moderator");
  const [newEmployee, setNewEmployee] = React.useState({
    email: "",
    name: "",
    password: ""
  })

  React.useEffect(() => {

    const token = localStorage.getItem('adminToken');
    axios.get('http://localhost:5000/api/v1/admins/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (response.data.success)
          setAdmins(response.data.admins);
      })
      .catch((e) => {
        enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
      });

  }, [])

  const handleAddNewEmployee = (e) => {
    e.preventDefault();
  }

  const handleInputChange = (e) => {
    setNewEmployee(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const employeesElems = admins.length > 0 ? admins.map((admin, index) => (
    <div key={index}>
      <div className="requestRow row">
        <div className="titleField field"><p className='title'>{admin.email}</p></div>
        <p className="idField field">#{admin._id}</p>
        <p className="nameField field">Shahab Hassan</p>
        <p className="accessField field">Dashboard</p>
        <div className="actionsField field">
          <FaEye className='icon' />
          <FaEdit className='icon' />
          <FaTrash className='icon' />
        </div>
      </div>
      {admins.length > 1 && admins.length - 1 !== index && <div className="horizontalLine"></div>}
    </div>
  )) : <div className="row">Nothing to show here...</div>;

  const editEditorAccess = selectedRole === "Editor" && <div className='editEditorAccess'>
    
  </div>

  return (
    <div className='adminEmployeesDiv'>
      <div className="adminEmployeesContent">

        <div className="tableDiv">
          <div className="tableContent">

            <div className="upper">
              <h2 className="secondaryHeading">All <span>Employees</span><span className='totalRows'>- {(admins.length < 10 && "0") + admins.length}</span></h2>
              <button className="primaryBtn" onClick={() => setShowAddNewModel(true)}>Add New Employee</button>
            </div>

            <div className="header">
              <p className="title">Email</p>
              <p className='id'>Employee ID</p>
              <p>Employee Name</p>
              <p>Roles</p>
              <p>Actions</p>
            </div>

            <div className="rows">{employeesElems}</div>

          </div>
        </div>

      </div>

      {showAddNewModel &&
        <div className="popupDiv">
          <div className="popupContent">
            <form className="form" onSubmit={handleAddNewEmployee}>

              <div className='inputDiv'>
                <label>Email <span>*</span></label>
                <input
                  type="email"
                  className='inputField'
                  name="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  placeholder='Enter Email'
                  required
                />
              </div>

              <div className='inputDiv'>
                <label>Name <span>*</span></label>
                <input
                  type="text"
                  className='inputField'
                  name="name"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                  placeholder='Enter Name'
                  required
                />
              </div>

              <div className='inputDiv'>
                <label>Role</label>
                <Dropdown options={["Moderator", "Editor"]} selected={selectedRole} onSelect={setSelectedRole}  />
                {editEditorAccess}
              </div>

              <div className='inputDiv'>
                <div className="passwordFieldUpper">
                  <label htmlFor="password">Create Password <span>*</span></label>
                  <div className='hidePasswordBtn'
                    onClick={() => setPasswordHidden((oldValue) => !oldValue)}
                  >
                    <i className={passwordHidden ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                  </div>
                </div>
                <input
                  type={passwordHidden ? "password" : "text"}
                  className='inputField'
                  name="password"
                  value={newEmployee.password}
                  onChange={handleInputChange}
                  placeholder='Enter Password'
                  required
                />
              </div>

              <div className="buttonsDiv">
                <button className='primaryBtn' type="submit">Add Employee</button>
                <button className='secondaryBtn' type="button" onClick={() => setShowAddNewModel(false)}>Close</button>
              </div>

            </form>
          </div>
          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className='icon' onClick={() => setShowAddNewModel(false)} />
          </div>
        </div>
      }

    </div>
  )

}

export default Employees