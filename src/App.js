import './css/App.module.css';
import Login from './pages/Login.js';
import { Route, Routes} from "react-router-dom";

function App() {
  return (
    <div>
      <Content />
    </div>
  );
}

//Page content
function Content() {
  return (
      <Routes>
        <Route path="/" element={<Login />}></Route>
      </Routes>
  );
}

export default App;
