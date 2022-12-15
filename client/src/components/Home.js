import { useState } from "react";
import Typography from '@mui/material/Typography';

const Home = ({setPage}) => {
  const [isFresh, setIsFresh] = useState(true);
  if (isFresh) {
    setPage(0);
    setIsFresh(false);
  }
  return (
    <Typography variant="h2" sx={{ mt: 5 }} component="div" align="center">
    Welcome to<br />Trust The Process!
  </Typography>
  )
  
};

export default Home;