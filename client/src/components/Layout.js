import { useNavigate } from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const Layout = ({page, setPage, outlet}) => {
  const navigate = useNavigate();
  const handleNav = (event, newValue) => {
    navigate(newValue === 0 ? "/" : newValue === 1 ? "/main" : "/motivation");
  };
  return (
    <>
      <Tabs value={page} onChange={handleNav} centered sx={{mb: 3}}>
        <Tab label={<h2>Home</h2>}/>
        <Tab label={<h2>Main</h2>}/>
        <Tab label={<h2>Motivation</h2>}/>
      </Tabs>
      <div style={{display: "flex", justifyContent: "center"}}>
      {outlet}
      </div>
    </>
  );    
};

export default Layout;