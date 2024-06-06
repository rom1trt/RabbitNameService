import React, { useState, useEffect } from "react";

const App = () => {
  const [message, setMessage] = useState("Hello World");

  useEffect(() => {
    console.log("Component mounted");
  }, []);

  const handleClick = () => {
    setMessage("Button Clicked");
  };

  return (
    <div className="App">
      <h1>{message}</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};

export default App;
