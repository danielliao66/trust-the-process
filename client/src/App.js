import ReminderForm from "./components/ReminderForm";

function App() {
  const queryString = require('query-string');
  const params = queryString.parse(window.location.search);
  params.isAdd = params.reminderId === undefined;
  params.url = "http://localhost:4000" + (params.isAdd ? "" : `/${params.reminderId}`);
  params.handleMethod = params.isAdd ? "POST" : "DELETE"; 
  return (
    <ReminderForm {...params}/>
  );
}

export default App;
