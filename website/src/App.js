import React, { useState, useEffect } from "react";

const App = () => {
  const [message, setMessage] = useState("Hello World");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    console.log("Component mounted");
  }, []);

  const handleClick = () => {
    setMessage("Button Clicked");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };


  return (
    <div className="App">
      <h1>{message}</h1>
      <button onClick={handleClick}>Click Me</button>
      <input type="text" value={inputValue} onChange={handleInputChange} />
      <p>{inputValue}</p>
    </div>
  );
};

export default App;