import { useState } from "react";

const Home = () => {
  const [counter, setCounter] = useState<number>(0);

  return (
    <div>
      <h1>Olá meu amigo.</h1>
      <button onClick={() => setCounter(counter + 1)}>Clique agui</button>
    </div>
  )
}

export default Home;