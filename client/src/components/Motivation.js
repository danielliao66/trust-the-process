import { useState } from "react";
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import gif from "../img/motivation.gif"

const Motivation = ({setPage}) => {
  const [isFresh, setIsFresh] = useState(true);
  if (isFresh) {
    setPage(2);
    setIsFresh(false);
  }
  return (
    <>
      <Typography variant="h3" sx={{ mt: 1 }} component="div" align="center">
        Believe in yourself.<br/>You can make it!<br/>
        <Box component="img" sx={{width: "300px", height: "300px"}} src={gif} alt="motivation"/>
      </Typography>
    </>
  );
};

export default Motivation;