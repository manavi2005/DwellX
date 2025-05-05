import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar       from './Components/Navbar';
import Homepage     from './Components/Homepage';
import Login        from './Components/Login';
import Register     from './Components/Register';
import Account      from './Components/Account';
import Generate     from './Components/Generate';
import Explore      from './Components/Explore';
import Popular      from './Components/Popular';
import Favorites from './Components/Favorites';
//import ZipSearch from './Components/ZipSearch';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Homepage />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/account"  element={<Account />} />
        <Route path="/generate"  element={<Generate />} />
        <Route path="/explore"  element={<Explore />} />
        <Route path="/favorites"  element={<Favorites />} />
        <Route path="/popular" element={<Popular />} />
        
        {/*
        <Route
          path="/dashboard"
          element={
            localStorage.getItem('dwellx_token')
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;