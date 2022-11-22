import { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import emailjs from '@emailjs/browser';
import {serviceId, templateId, publicKey} from '../config'

const intervals = ["minute", "hour", "day", "week", "month", "year"]

export default function ReminderForm({isAdd, url, handleMethod}) {
  
  const initInfo = {name: "", email: "", activity: "", interval: intervals[2], code: ""};
  const [info, setInfo] = useState(initInfo);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState("");
  const [received, setReceived] = useState(isAdd);
  if (!isAdd && !received) {
    getInfo().then((infoResult) => {setInfo(infoResult)});
    setReceived(true);
  }
  const generateCode = () => {
    let ans = "";
    for (let i = 0; i < 5; i++) {
      ans += String.fromCharCode(65 + Math.floor(Math.random() * 25));
    }
    return ans;
  };
  const handleChange = (event) => {
    const id = event.target.id;
    const copy = JSON.parse(JSON.stringify(info));
    copy[id === undefined ? "interval" : id] = event.target.value;
    setInfo(copy);
  };
  const handleDone = () => {
    const newCode = generateCode();
    setCode(newCode);
    const [name, email] = [info.name, info.email];
    emailjs.send(serviceId, templateId, {name, code: newCode, email}, publicKey)
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
    setDone(true);
  };
  const handleReminder = async () => {
    if (code === info.code) {
      let res;
      if (isAdd) {
        const {code, ...data} = info;
        res = await fetch(url, {
          method: handleMethod,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data),
          mode: "cors"
        });
      }
      else {
        res = await fetch(url, {
          method: handleMethod,
          mode: "cors"
        });
      }
      if (res.ok) {
        alert(`${isAdd ? "Addition" : "Deletion"} Complete`);
        setDone(false);
        setInfo(initInfo);
      }
      else {
        alert("Something Went Wrong!");
      }
    }
    else {
      alert("Invalid Code!!");
    }
  };
  async function getInfo() {
    return await fetch(url, {method: "GET", mode: "cors"}).then(res => res.json());
  };
  return (
    <div>
      <TextField id="name" disabled={isAdd ? false : true} label="Name" value={info.name} variant="filled" onChange={handleChange}/> <br/> <br/>
      <TextField id="email" disabled={isAdd ? false : true} label="Email" value={info.email} variant="filled" onChange={handleChange}/> <br/> <br/>
      <TextField id="activity" disabled={isAdd ? false : true} label="Activity" value={info.activity} variant="filled" onChange={handleChange}/> <br/> <br/>
      <TextField id="interval" select disabled={isAdd ? false : true} label="Interval" value={info.interval} onChange={handleChange}>
        {intervals.map((option) => (
          <MenuItem key={option} value={option}>
            {`1 ${option}`}
          </MenuItem>
        ))}
      </TextField> <br/> <br/>
      <Button variant="contained" onClick={handleDone}>Done</Button> <br/> <br/>
      <TextField id="code" label="Verification Code" variant="filled" onChange={handleChange} helperText="Please use the code we just sent you" sx={{visibility: done ? 'visible' : 'hidden'}}/> <br/> <br/>
      <Button variant="contained" onClick={handleReminder} sx={{visibility: done ? 'visible' : 'hidden'}}>{isAdd ? "add" : "delete"}</Button>
    </div>
  );
}