import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import ReminderForm from "./components/ReminderForm";
import Motivation from "./components/Motivation";
import Error from "./components/Error";

function App() {
  const [page, setPage] = useState(0);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout {...{page, setPage, outlet: <Outlet/>}}/>}>
          <Route index element={<Home {...{setPage}}/>}/>
          <Route path="main" element={<ReminderForm {...{setPage}}/>}/>
          <Route path="main/:id" element={<ReminderForm {...{setPage}}/>}/>
          <Route path="motivation" element={<Motivation {...{setPage}}/>}/>
          <Route path="*" element={<Error/>}/>
        </Route>
      </Routes>     
    </BrowserRouter>
  );
}

export default App;
