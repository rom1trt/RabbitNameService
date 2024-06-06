import React, { useState } from "react";

const App = () => {
  const [message, setMessage] = useState("Hello World");

  return (
    <div className="App">
      <h1>{message}</h1>
    </div>
  );
};

export default App;
