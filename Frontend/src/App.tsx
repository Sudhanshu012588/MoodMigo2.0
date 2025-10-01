import './App.css';
import 'react-toastify/dist/ReactToastify.css'; // ✅ Add this
// import {useEffect} from 'react'
// import {account} from './Appwrite/config'
import Homepage from './Pages/Homepage';
import NotFound from './Pages/NotFound';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Signup from "./Pages/Signup"
// import { useUserState } from './Store/Userstore';
import Dashboard from './Pages/Dashboard';
import MoodMigoQuestionnaire from  './Pages/Questionare';
import Login  from './Pages/Login';
function App() {
  
  // const isLoggedIn = useUserState((state) => state.isLoggedIn);
  // const setIsLoggedIn = useUserState((state)=>state.setIsLoggedIn);
  //   useEffect(() => {
  //   account.get()
  //     .then(() => setIsLoggedIn(true))
  //     .catch(() => setIsLoggedIn(false));
  // }, []);
  return (
    <>
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName={() =>
          'bg-gray-900 text-white rounded-lg shadow-lg px-4 py-3 border border-gray-700'
        }
        
        progressClassName="bg-green-400"
      />

      {/* Routes */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<Signup/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/questionnaire' element={<MoodMigoQuestionnaire/>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
