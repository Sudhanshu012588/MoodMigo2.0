import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import Homepage from './Pages/Homepage';
import NotFound from './Pages/NotFound';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Signup from "./Pages/Signup"
import Dashboard from './Pages/Dashboard';
import MoodMigoQuestionnaire from  './Pages/Questionare';
import Login  from './Pages/Login';
import BlogPage from "./Pages/BlogPage";
import AccountPage from "./Pages/AccountPage"
import Manarah from "./Pages/Manarah"
import MentorsLogin from './MentorsComponents/MentorsLogin';
import MentorsDashboard from './MentorsComponents/MentorsDashboard';
import MentorsBlogPage from './MentorsComponents/MentorsBlogpage';
import DiaryJournal from "./Components/DailyJournal";
import ChatPage from './Pages/Manarah';
import ManarahCall from "./Pages/ManarahVoiceCall";
import BookSession from './Pages/ProffesionalsList';
import TherapistProfile from './Pages/TherapistProfile';
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
          <Route path='/blog' element={<BlogPage/>}/>
          <Route path="*" element={<NotFound />} />
          <Route path='/account/:id' element={<AccountPage/>}/>
          <Route path='/manarah' element={<Manarah/>}/>
          <Route path='/mentorspage' element={<MentorsLogin/>}/>
          <Route path='/mentorsdashboard/:mentorId' element={<MentorsDashboard/>}/>
          <Route path='/mentordashboard/BlogPage' element={<MentorsBlogPage/>}/>
          <Route path='/journal' element={<DiaryJournal/>}/>
          <Route path='/manarah/voicecall/:uuid' element={<ManarahCall/>}/>
          <Route path='/manarah/chat' element={<ChatPage/>}/>
          <Route path='/therapists' element={<BookSession/>}/>
          <Route path='/therapist/:therapistId' element={<TherapistProfile/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
